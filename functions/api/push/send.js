/* ── /api/push/send ──
 * POST - Super Admin ส่ง push notification ไปทุก subscriber
 */

const ALGO = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

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
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function str2buf(str) {
  return new TextEncoder().encode(str);
}

/* ── Build VAPID JWT ── */
async function buildVapidJWT(endpoint, subject, publicKeyB64, privateKeyB64) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header = b64url(str2buf(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64url(str2buf(JSON.stringify({ aud: audience, exp, sub: subject })));
  const sigInput = `${header}.${payload}`;

  /* Import private key */
  const rawPriv = Uint8Array.from(atob(privateKeyB64.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
  const privKey = await crypto.subtle.importKey(
    'pkcs8', rawPriv.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privKey,
    str2buf(sigInput)
  );

  return `${sigInput}.${b64url(sig)}`;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── Auth: Super Admin only ── */
  const session = getSession(request);
  if (!session || session.exp < Date.now()) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  if (session.userId !== '798922868917796874') {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── Parse body ── */
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

  /* ── List all subscribers ── */
  const list = await KV.list({ prefix: 'push:sub:' });
  if (list.keys.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, message: 'ไม่มี subscriber' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const payload = JSON.stringify({ title, body: message, url: url || '/app', tag: 'gwm-announce' });
  let sent = 0, failed = 0;

  for (const key of list.keys) {
    try {
      const raw = await KV.get(key.name);
      if (!raw) continue;
      const { subscription } = JSON.parse(raw);

      const jwt = await buildVapidJWT(subscription.endpoint, VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      const vapidAuth = `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`;

      const res = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': vapidAuth,
          'Content-Type': 'application/octet-stream',
          'TTL': '86400'
        },
        body: str2buf(payload)
      });

      if (res.ok || res.status === 201) { sent++; }
      else {
        failed++;
        const errText = await res.text();
        console.error(`Push failed [${res.status}]: ${errText} | endpoint: ${subscription.endpoint.slice(0,50)}`);
        if (res.status === 410 || res.status === 404) {
          await KV.delete(key.name);
        }
      }
    } catch(e) { failed++; }
  }

  return new Response(JSON.stringify({ ok: true, sent, failed, total: list.keys.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
}