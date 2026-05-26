/* ── /api/push/send ──
 * POST - Super Admin ส่ง push notification ไปทุก subscriber
 * รองรับ Web Push Encryption (RFC 8291) สำหรับ iOS + Android + Desktop
 */

/* ── Helper: parse session cookie ── */
function getSession(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/gwm_session=([^;]+)/);
  if (!match) return null;
  try {
    const binaryString = atob(match[1]);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch { return null; }
}

/* ── Helper: base64url ── */
function b64urlEncode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - s.length % 4);
  return Uint8Array.from(atob(s + pad), c => c.charCodeAt(0));
}

function str2buf(str) { return new TextEncoder().encode(str); }
function concat(...bufs) {
  const total = bufs.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const b of bufs) { out.set(b, off); off += b.length; }
  return out;
}
function num2buf(n, len) {
  const b = new Uint8Array(len);
  for (let i = len - 1; i >= 0; i--) { b[i] = n & 0xff; n >>= 8; }
  return b;
}

/* ── Build VAPID JWT ── */
async function buildVapidJWT(endpoint, subject, pubKeyB64, privKeyB64) {
  const url = new URL(endpoint);
  const aud = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header = b64urlEncode(str2buf(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64urlEncode(str2buf(JSON.stringify({ aud, exp, sub: subject })));
  const sigInput = `${header}.${payload}`;

  const rawPriv = b64urlDecode(privKeyB64);
  const privKey = await crypto.subtle.importKey(
    'pkcs8', rawPriv.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, privKey, str2buf(sigInput)
  );
  return `${sigInput}.${b64urlEncode(sig)}`;
}

/* ── Web Push Encryption (RFC 8291 / RFC 8188) ── */
async function encryptPayload(subscription, payloadStr) {
  const plaintext = str2buf(payloadStr);

  /* 1. Generate salt (16 bytes) */
  const salt = crypto.getRandomValues(new Uint8Array(16));

  /* 2. Generate local ECDH key pair */
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );

  /* 3. Export local public key (uncompressed, 65 bytes) */
  const localPubKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', localKeyPair.publicKey)
  );

  /* 4. Import receiver's public key (p256dh) */
  const receiverPubKeyRaw = b64urlDecode(subscription.keys.p256dh);
  const receiverPubKey = await crypto.subtle.importKey(
    'raw', receiverPubKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );

  /* 5. ECDH: derive shared secret */
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: receiverPubKey }, localKeyPair.privateKey, 256
    )
  );

  /* 6. auth secret */
  const authSecret = b64urlDecode(subscription.keys.auth);

  /* 7. HKDF-SHA-256: PRK from auth */
  const prkKey = await crypto.subtle.importKey('raw', authSecret, { name: 'HKDF' }, false, ['deriveBits']);
  const prk = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: concat(
        str2buf('WebPush: info\x00'), receiverPubKeyRaw, localPubKeyRaw
      )
    }, await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']), 256
  ));

  /* 8. HKDF: content encryption key (16 bytes) */
  const prkImport = await crypto.subtle.importKey('raw', prk, { name: 'HKDF' }, false, ['deriveBits']);
  const cekInfo = concat(str2buf('Content-Encoding: aes128gcm\x00'));
  const cek = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo }, prkImport, 128
  ));

  /* 9. HKDF: nonce (12 bytes) */
  const nonceInfo = concat(str2buf('Content-Encoding: nonce\x00'));
  const nonce = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, prkImport, 96
  ));

  /* 10. AES-128-GCM encrypt — add padding delimiter (0x02) */
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const paddedPlaintext = concat(plaintext, new Uint8Array([0x02]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, paddedPlaintext)
  );

  /* 11. Build aes128gcm header */
  // record_size = 4096
  const header = concat(
    salt,
    num2buf(4096, 4),
    num2buf(localPubKeyRaw.length, 1),
    localPubKeyRaw
  );

  return { body: concat(header, ciphertext), keyid: b64urlEncode(localPubKeyRaw) };
}

/* ── Send one push message ── */
async function sendPush(subscription, payloadStr, vapidJWT, vapidPubKey) {
  const { body } = await encryptPayload(subscription, payloadStr);

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${vapidJWT},k=${vapidPubKey}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400'
    },
    body
  });

  return res;
}

/* ── Main handler ── */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  /* Auth: Super Admin only */
  const session = getSession(request);
  if (!session || session.exp < Date.now()) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  const isAdminRole = session.role === 'admin' || session.role === 'sub_admin';
  const isSuperAdmin = session.userId === '798922868917796874';
  if (!isAdminRole && !isSuperAdmin) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  /* Parse body */
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { title, message, url } = body;
  if (!title || !message) {
    return new Response(JSON.stringify({ error: 'title และ message จำเป็น' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const KV = env.GWM_KV;
  const VAPID_PUBLIC_KEY = env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT = env.VAPID_SUBJECT;

  /* List all subscribers */
  const list = await KV.list({ prefix: 'push:sub:' });
  if (list.keys.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, message: 'ไม่มี subscriber' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const payload = JSON.stringify({
    title,
    body: message,
    url: url || '/app',
    tag: 'gwm-announce'
  });

  let sent = 0, failed = 0;
  const failedDetails = [];

  for (const key of list.keys) {
    try {
      const raw = await KV.get(key.name);
      if (!raw) continue;
      const { subscription } = JSON.parse(raw);

      const jwt = await buildVapidJWT(
        subscription.endpoint, VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
      );

      const res = await sendPush(subscription, payload, jwt, VAPID_PUBLIC_KEY);

      if (res.ok || res.status === 201) {
        sent++;
      } else {
        failed++;
        const errText = await res.text();
        failedDetails.push({ status: res.status, body: errText, endpoint: subscription.endpoint.slice(0, 60) });
        if (res.status === 410 || res.status === 404) {
          await KV.delete(key.name);
        }
      }
    } catch(e) {
      failed++;
      failedDetails.push({ error: e.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, failed, total: list.keys.length, errors: failedDetails }), {
    headers: { 'Content-Type': 'application/json' }
  });
}