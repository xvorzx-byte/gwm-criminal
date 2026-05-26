/* ── /api/push/schedule ──
 * GET  - ดูการตั้งค่า schedule ปัจจุบัน
 * POST - Admin ตั้งค่า schedule
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

export async function onRequest(context) {
  const { request, env } = context;
  const session = getSession(request);
  if (!session || session.exp < Date.now()) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const KV = env.GWM_KV;
  const ADMIN_IDS = (env.ADMIN_IDS || '').split(',').map(s => s.trim());
  const isSuperAdmin = session.userId === '798922868917796874';
  const isAdmin = isSuperAdmin || ADMIN_IDS.includes(session.userId) ||
    session.role === 'admin' || session.role === 'sub_admin';

  /* ── GET: ดูการตั้งค่า ── */
  if (request.method === 'GET') {
    const raw = await KV.get('push:schedule');
    const schedule = raw ? JSON.parse(raw) : {
      warEnabled: true,
      practiceEnabled: false,
      practiceDate: null,
      practiceTime: null,
      lastSentWar: null,
      lastSentPractice: null
    };
    return new Response(JSON.stringify(schedule), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── POST: ตั้งค่า (Admin only) ── */
  if (request.method === 'POST') {
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    let body;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: 'invalid_json' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const raw = await KV.get('push:schedule');
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...body, updatedAt: Date.now(), updatedBy: session.displayName };
    await KV.put('push:schedule', JSON.stringify(updated));

    return new Response(JSON.stringify({ ok: true, schedule: updated }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}