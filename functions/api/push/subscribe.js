/* ── /api/push/subscribe ── 
 * POST   - บันทึก subscription ของ user
 * DELETE - ลบ subscription ของ user
 * GET    - เช็คว่า user subscribe แล้วหรือยัง
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
  } catch {
    return null;
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  /* ── Auth check ── */
  const session = getSession(request);
  if (!session || session.exp < Date.now()) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const KV = env.GWM_KV;
  const subKey = `push:sub:${session.userId}`;

  /* ── GET: เช็คว่า subscribe แล้วหรือยัง ── */
  if (request.method === 'GET') {
    const existing = await KV.get(subKey);
    return new Response(JSON.stringify({ 
      subscribed: !!existing,
      userId: session.userId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── POST: บันทึก subscription ── */
  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'invalid_json' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { subscription } = body;

    /* Validate subscription object */
    if (!subscription || 
        !subscription.endpoint || 
        !subscription.keys || 
        !subscription.keys.p256dh || 
        !subscription.keys.auth) {
      return new Response(JSON.stringify({ 
        error: 'invalid_subscription',
        message: 'Subscription ไม่ครบ field ที่จำเป็น'
      }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    /* Store subscription with metadata */
    const data = {
      subscription,
      userId: session.userId,
      displayName: session.displayName,
      role: session.role,
      subscribedAt: Date.now()
    };

    await KV.put(subKey, JSON.stringify(data));

    return new Response(JSON.stringify({ 
      ok: true,
      message: 'Subscribe สำเร็จ'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── DELETE: ลบ subscription ── */
  if (request.method === 'DELETE') {
    await KV.delete(subKey);
    return new Response(JSON.stringify({ 
      ok: true,
      message: 'Unsubscribe สำเร็จ'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'method_not_allowed' }), { 
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}