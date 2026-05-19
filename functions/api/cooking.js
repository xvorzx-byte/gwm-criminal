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
  const session = getSession(request);

  if (!session || session.exp < Date.now()) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const KV = env.GWM_KV;
  const KEY = 'cooking_custom';

  /* ── GET: ดึง custom recipes ── */
  if (request.method === 'GET') {
    const raw = await KV.get(KEY);
    const data = raw ? JSON.parse(raw) : { recipes: [], ingredients: {} };
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── POST: เพิ่ม/แก้ไข/ลบ (admin/sub_admin เท่านั้น) ── */
  if (request.method === 'POST') {
    if (session.role === 'member') {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    const body = await request.json();
    await KV.put(KEY, JSON.stringify(body));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}