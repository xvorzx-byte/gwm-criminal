/* ── /api/push/cron ──
 * GET - Cloudflare Cron trigger เรียกทุก 5 นาที
 * ตรวจสอบและส่ง push notification ก่อน war/ซ้อม
 */

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
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, str2buf(sigInput));
  return `${sigInput}.${b64urlEncode(sig)}`;
}

async function encryptPayload(subscription, payloadStr) {
  const plaintext = str2buf(payloadStr);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const localKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const localPubKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeyPair.publicKey));
  const receiverPubKeyRaw = b64urlDecode(subscription.keys.p256dh);
  const receiverPubKey = await crypto.subtle.importKey('raw', receiverPubKeyRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: receiverPubKey }, localKeyPair.privateKey, 256));
  const authSecret = b64urlDecode(subscription.keys.auth);
  const sharedSecretKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']);
  const prk = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: concat(str2buf('WebPush: info\x00'), receiverPubKeyRaw, localPubKeyRaw) },
    sharedSecretKey, 256
  ));
  const prkKey = await crypto.subtle.importKey('raw', prk, { name: 'HKDF' }, false, ['deriveBits']);
  const cek = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: str2buf('Content-Encoding: aes128gcm\x00') }, prkKey, 128));
  const nonce = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: str2buf('Content-Encoding: nonce\x00') }, prkKey, 96));
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, concat(plaintext, new Uint8Array([0x02]))));
  const header = concat(salt, num2buf(4096, 4), num2buf(localPubKeyRaw.length, 1), localPubKeyRaw);
  return concat(header, ciphertext);
}

async function sendPushToAll(KV, env, title, body, tag) {
  const list = await KV.list({ prefix: 'push:sub:' });
  if (list.keys.length === 0) return { sent: 0, failed: 0 };

  /* โหลด state เพื่อเช็ค assigned members */
  const stateRaw = await KV.get('state');
  const state = stateRaw ? JSON.parse(stateRaw) : null;
  const assignedDiscordIds = new Set();
  if (state) {
    const assignedMemberIds = new Set(state.zones.flatMap(z => z.members));
    state.roster.forEach(m => {
      if (assignedMemberIds.has(m.id) && m.discordId) {
        assignedDiscordIds.add(m.discordId);
      }
    });
  }

  const payload = JSON.stringify({ title, body, url: '/app', tag });
  let sent = 0, failed = 0;

  for (const key of list.keys) {
    try {
      const raw = await KV.get(key.name);
      if (!raw) continue;
      const { subscription, userId } = JSON.parse(raw);

      /* ส่งเฉพาะคนที่ assign zone แล้ว */
      if (state && assignedDiscordIds.size > 0 && !assignedDiscordIds.has(userId)) continue;

      const jwt = await buildVapidJWT(subscription.endpoint, env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
      const encBody = await encryptPayload(subscription, payload);
      const res = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `vapid t=${jwt},k=${env.VAPID_PUBLIC_KEY}`,
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'aes128gcm',
          'TTL': '86400'
        },
        body: encBody
      });
      if (res.ok || res.status === 201) { sent++; }
      else {
        failed++;
        if (res.status === 410 || res.status === 404) await KV.delete(key.name);
      }
    } catch(e) { failed++; }
  }
  return { sent, failed };
}

export async function onRequest(context) {
  const { request, env } = context;

  /* Secret key กันคนอื่นเรียก endpoint นี้ */
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  if (secret !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  const KV = env.GWM_KV;
  const raw = await KV.get('push:schedule');
  if (!raw) return new Response(JSON.stringify({ ok: true, message: 'no schedule' }), {
    headers: { 'Content-Type': 'application/json' }
  });

  const schedule = JSON.parse(raw);
  const now = Date.now();
  const results = [];

  /* ── War ปกติ (20:00) ── */
  if (schedule.warEnabled && schedule.warDate) {
    const war60 = new Date(schedule.warDate + 'T12:00:00Z').getTime();
    const war15 = new Date(schedule.warDate + 'T12:45:00Z').getTime();
    const window = 5 * 60 * 1000; /* 5 นาที */

    if (Math.abs(now - war60) < window && schedule.lastSentWar !== '60') {
      const r = await sendPushToAll(KV, env, '⚔️ War เริ่มใน 1 ชั่วโมง!', 'เตรียมตัวให้พร้อม เข้า position ก่อนเวลา', 'gwm-war-60');
      schedule.lastSentWar = '60';
      results.push({ type: 'war-60', ...r });
    }
    if (Math.abs(now - war15) < window && schedule.lastSentWar !== '15') {
      const r = await sendPushToAll(KV, env, '🔴 War เริ่มใน 15 นาที!', 'เข้า position ด่วน! อย่าลืม buff และ potion', 'gwm-war-15');
      schedule.lastSentWar = '15';
      results.push({ type: 'war-15', ...r });
    }

    /* Reset lastSentWar วันถัดไป */
    const warEnd = new Date(schedule.warDate + 'T21:00:00+07:00').getTime();
    if (now > warEnd) schedule.lastSentWar = null;
  }

  /* ── ซ้อมวอร์ ── */
  if (schedule.practiceEnabled && schedule.practiceDate && schedule.practiceTime) {
    const [ph, pm] = schedule.practiceTime.split(':').map(Number);
    const practiceUTCHour = ph - 7 < 0 ? ph - 7 + 24 : ph - 7;
    const practiceStart = new Date(`${schedule.practiceDate}T${String(practiceUTCHour).padStart(2,'0')}:${String(pm).padStart(2,'0')}:00Z`).getTime();
    const p30 = practiceStart - 30 * 60 * 1000;
    const p5 = practiceStart - 5 * 60 * 1000;
    const window = 5 * 60 * 1000;

    if (Math.abs(now - p30) < window && schedule.lastSentPractice !== '30') {
      const r = await sendPushToAll(KV, env, '🛡️ ซ้อมวอร์ใน 30 นาที!', `ซ้อมวอร์ ${schedule.practiceDate} เวลา ${schedule.practiceTime} — เตรียมตัวได้เลย`, 'gwm-practice-30');
      schedule.lastSentPractice = '30';
      results.push({ type: 'practice-30', ...r });
    }
    if (Math.abs(now - p5) < window && schedule.lastSentPractice !== '5') {
      const r = await sendPushToAll(KV, env, '🔴 ซ้อมวอร์อีก 5 นาที!', 'เข้า position ได้เลย! รีบหน่อยนะ', 'gwm-practice-5');
      schedule.lastSentPractice = '5';
      results.push({ type: 'practice-5', ...r });
    }

    /* Auto-disable หลังซ้อมเสร็จ */
    if (now > practiceStart + 60 * 60 * 1000) {
      schedule.practiceEnabled = false;
      schedule.lastSentPractice = null;
    }
  }

  await KV.put('push:schedule', JSON.stringify(schedule));

  return new Response(JSON.stringify({ ok: true, results, now: new Date(now).toISOString() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}