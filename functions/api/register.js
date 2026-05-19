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
  const STATE_KEY = 'guild_state';

  /* ── GET: ดึงรายชื่อที่ยังไม่ถูก link ── */
  if (request.method === 'GET') {
    const raw = await KV.get(STATE_KEY);
    if (!raw) return new Response(JSON.stringify({ availableMembers: [], registered: null }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const state = JSON.parse(raw);
    
    /* เช็คว่า Member นี้ลงทะเบียนแล้วหรือยัง */
    const registered = state.roster.find(m => m.discordId === session.userId);
    
    /* รายชื่อที่ยังไม่ถูก link (ยังว่าง) */
    const availableMembers = state.roster
      .filter(m => !m.discordId)
      .map(m => ({
        id: m.id,
        name: m.name,
        cls: m.cls,
        cp: m.cp || 0
      }));
    
    return new Response(JSON.stringify({ 
      availableMembers, 
      registered: registered ? { id: registered.id, name: registered.name } : null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── POST: ลงทะเบียน (link Discord ID กับ member) ── */
  if (request.method === 'POST') {
    const raw = await KV.get(STATE_KEY);
    if (!raw) return new Response(JSON.stringify({ error: 'no_state' }), { 
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
    
    const state = JSON.parse(raw);
    const { memberId } = await request.json();
    
    if (!memberId) {
      return new Response(JSON.stringify({ error: 'member_id_required' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    /* เช็คว่า Member นี้ลงทะเบียนไปแล้วหรือยัง */
    const alreadyRegistered = state.roster.find(m => m.discordId === session.userId);
    if (alreadyRegistered) {
      return new Response(JSON.stringify({ 
        error: 'already_registered',
        message: `คุณลงทะเบียนเป็น "${alreadyRegistered.name}" แล้ว`
      }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    /* หา member ที่จะ link */
    const target = state.roster.find(m => m.id === memberId);
    if (!target) {
      return new Response(JSON.stringify({ 
        error: 'member_not_found',
        message: 'ไม่พบสมาชิกในระบบ'
      }), { 
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    /* เช็คว่า member นี้ถูก link โดยคนอื่นแล้วหรือยัง */
    if (target.discordId) {
      return new Response(JSON.stringify({ 
        error: 'already_linked',
        message: `ชื่อ "${target.name}" ถูกลงทะเบียนโดยผู้อื่นแล้ว`
      }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    /* Link Discord ID */
    target.discordId = session.userId;
    target.discordName = session.displayName;  // เก็บชื่อ Discord ไว้ด้วย
    
    await KV.put(STATE_KEY, JSON.stringify(state));
    
    return new Response(JSON.stringify({ 
      ok: true,
      member: {
        id: target.id,
        name: target.name,
        cls: target.cls
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── DELETE: Admin unlink Discord ID จาก member ── */
  if (request.method === 'DELETE') {
    /* เฉพาะ Admin เท่านั้น */
    if (session.role !== 'admin' && session.role !== 'sub_admin') {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const raw = await KV.get(STATE_KEY);
    if (!raw) return new Response(JSON.stringify({ error: 'no_state' }), { status: 404 });
    
    const state = JSON.parse(raw);
    const { memberId } = await request.json();
    
    const target = state.roster.find(m => m.id === memberId);
    if (!target) {
      return new Response(JSON.stringify({ error: 'member_not_found' }), { 
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    delete target.discordId;
    delete target.discordName;
    
    await KV.put(STATE_KEY, JSON.stringify(state));
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
