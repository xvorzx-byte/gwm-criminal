/* ── Helper: parse session cookie ── */
function getSession(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/gwm_session=([^;]+)/);
  if (!match) return null;
  try {
    // Unicode-safe base64 decoding
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

  /* ── GET: อ่าน state ── */
  if (request.method === 'GET') {
    const raw = await KV.get(STATE_KEY);
    const state = raw ? JSON.parse(raw) : null;
    return new Response(JSON.stringify({
      state,
      session: {
        userId: session.userId,
        displayName: session.displayName,
        avatar: session.avatar,
        role: session.role,
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  /* ── POST: บันทึก state (admin/sub_admin เท่านั้น) ── */
  if (request.method === 'POST') {
    if (session.role === 'member') {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    const body = await request.json();
    await KV.put(STATE_KEY, JSON.stringify(body));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* ── PATCH: member อัปเดตสถานะ/โปรไฟล์ตัวเอง ── */
  if (request.method === 'PATCH') {
    const raw = await KV.get(STATE_KEY);
    if (!raw) return new Response(JSON.stringify({ error: 'no_state' }), { status: 404 });

    const state = JSON.parse(raw);
    const body = await request.json();
    const { attend, profile } = body;

    /* หา member ที่ลงทะเบียนแล้ว (มี discordId ตรงกับ userId) */
    const me = state.roster.find(m => m.discordId === session.userId);

    if (!me) {
      return new Response(JSON.stringify({
        error: 'not_registered',
        message: 'กรุณาลงทะเบียนก่อนใช้งาน'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    /* ── Update profile (ชื่อ / CP / Class / Note) ── */
    if (profile) {
      if (typeof profile.name === 'string') {
        const n = profile.name.trim();
        if (n.length > 0 && n.length <= 50) me.name = n;
      }
      if (typeof profile.cp === 'number' && profile.cp >= 0 && profile.cp <= 9999999) {
        me.cp = Math.floor(profile.cp);
      }
      if (typeof profile.cls === 'string' && profile.cls.length <= 30) {
        me.cls = profile.cls;
      }
      if (typeof profile.note === 'string' && profile.note.length <= 200) {
        me.note = profile.note;
      }
    }

    /* ── Update attend status (ถ้าส่งมา) ── */
    if (attend !== undefined) {
      const memberAllowed = ['ready', 'leave'];
      if (!memberAllowed.includes(attend)) {
        return new Response(JSON.stringify({
          error: 'forbidden_status',
          message: 'Member สามารถเลือกได้แค่ "พร้อมเล่น" หรือ "ลา" เท่านั้น'
        }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      me.attend = attend;
      /* NOTE: ไม่ filter zone อัตโนมัติแล้ว — admin เป็นคนจัดการ zone */
    }

    await KV.put(STATE_KEY, JSON.stringify(state));
    return new Response(JSON.stringify({ ok: true, linkedName: me.name }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
