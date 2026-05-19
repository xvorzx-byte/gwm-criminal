// /api/stats — save, load, list player stats
// KV binding: SOJ_STATS (ต้อง bind ใน wrangler.toml)

const SUPER_ADMIN_IDS = (env) =>
  (env.SUPER_ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

function fp(request) {
  // fingerprint จาก header combination
  const ua = request.headers.get('user-agent') || '';
  const lang = request.headers.get('accept-language') || '';
  const enc = request.headers.get('accept-encoding') || '';
  const raw = ua + '|' + lang + '|' + enc;
  // simple hash
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = Math.imul(31, h) + raw.charCodeAt(i) | 0;
  }
  return 'fp_' + Math.abs(h).toString(36);
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Player-FP,X-Player-Name,X-Admin-Key',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  const KV = env.SOJ_STATS;
  if (!KV) return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  // ── SAVE ── POST /api/stats?action=save
  if (request.method === 'POST' && action === 'save') {
    const body = await request.json().catch(() => ({}));
    const playerFP = request.headers.get('X-Player-FP') || fp(request);
    const playerName = (request.headers.get('X-Player-Name') || body.displayName || '').trim().slice(0, 30);
    const stats = body.stats || {};

    const record = {
      fp: playerFP,
      displayName: playerName || 'ไม่ระบุชื่อ',
      updatedAt: new Date().toISOString(),
      stats: {
        atk: Number(stats.atk) || 0,
        pen: Number(stats.pen) || 0,
        sb:  Number(stats.sb)  || 0,
        sa:  Number(stats.sa)  || 0,
        ea:  Number(stats.ea)  || 0,
        acc: Number(stats.acc) || 0,
        crit:Number(stats.crit)|| 0,
        cdmg:Number(stats.cdmg)|| 175,
      }
    };

    await KV.put('player_stats:' + playerFP, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90 // 90 วัน
    });

    return json({ ok: true, fp: playerFP, displayName: record.displayName });
  }

  // ── LOAD ── GET /api/stats?action=load
  if (request.method === 'GET' && action === 'load') {
    const playerFP = request.headers.get('X-Player-FP') || fp(request);
    const raw = await KV.get('player_stats:' + playerFP);
    if (!raw) return json({ ok: false, found: false });
    return json({ ok: true, found: true, record: JSON.parse(raw) });
  }

  // ── LIST ── GET /api/stats?action=list (Super Admin เท่านั้น)
  if (request.method === 'GET' && action === 'list') {
    const adminKey = request.headers.get('X-Admin-Key');
    if (!adminKey || adminKey !== env.STATS_ADMIN_KEY) {
      return json({ error: 'Unauthorized' }, 403);
    }
    const list = await KV.list({ prefix: 'player_stats:' });
    const records = await Promise.all(
      list.keys.map(async k => {
        const raw = await KV.get(k.name);
        return raw ? JSON.parse(raw) : null;
      })
    );
    return json({
      ok: true,
      count: records.filter(Boolean).length,
      records: records.filter(Boolean).sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )
    });
  }

  return json({ error: 'Unknown action' }, 400);
}
