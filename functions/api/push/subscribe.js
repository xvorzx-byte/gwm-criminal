/* ── /api/push/subscribe ── 
 * POST   - บันทึก subscription ของ user (รองรับหลาย device)
 * DELETE - ลบ subscription ของ device นี้
 * GET    - เช็คว่า device นี้ subscribe แล้วหรือยัง
 */

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

/* สร้าง deviceId จาก endpoint URL (hash สั้นๆ) */
async function makeDeviceId(endpoint) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(buf)).slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function onRequest(context) {
  const { request, env } = context;

  const session = getSession(request);
  if (!session || session.exp < Date.now()) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const KV = env.GWM_KV;

  /* ── POST: บันทึก subscription ── */
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: 'invalid_json' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { subscription } = body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return new Response(JSON.stringify({ error: 'invalid_subscription' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const deviceId = await makeDeviceId(subscription.endpoint);
    const subKey = `push:sub:${session.userId}:${deviceId}`;

    await KV.put(subKey, JSON.stringify({
      subscription,
      userId: session.userId,
      displayName: session.displayName,
      role: session.role,
      deviceId,
      subscribedAt: Date.now()
    }));

    return new Response(JSON.stringify({ ok: true, message: 'Subscribe สำเร็จ', deviceId }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── DELETE: ลบ subscription ของ device นี้ ── */
  if (request.method === 'DELETE') {
    let body;
    try { body = await request.json(); } catch { body = {}; }

    if (body.deviceId) {
      await KV.delete(`push:sub:${session.userId}:${body.deviceId}`);
    } else if (body.endpoint) {
      const deviceId = await makeDeviceId(body.endpoint);
      await KV.delete(`push:sub:${session.userId}:${deviceId}`);
    }

    return new Response(JSON.stringify({ ok: true, message: 'Unsubscribe สำเร็จ' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── GET: เช็คว่า subscribe แล้วหรือยัง ── */
  if (request.method === 'GET') {
    const list = await KV.list({ prefix: `push:sub:${session.userId}:` });
    return new Response(JSON.stringify({
      subscribed: list.keys.length > 0,
      devices: list.keys.length,
      userId: session.userId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}