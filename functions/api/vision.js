// /api/vision — OpenRouter Vision (free tier)
export async function onRequest({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  // temp: list free vision models
  const url2 = new URL(request.url);
  if (url2.searchParams.get('list') === '1') {
    const apiKey2 = env.OPENROUTER_API_KEY;
    const r = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': 'Bearer '+apiKey2 }
    });
    const d = await r.json();
    const free = (d.data||[])
      .filter(m => m.id.includes(':free') && (m.architecture?.modality||'').includes('image'))
      .map(m => m.id);
    return new Response(JSON.stringify({free_vision_models: free}), {
      headers: {...cors,'Content-Type':'application/json'}
    });
  }

  const json = (data, status=200) => new Response(JSON.stringify(data), {
    status, headers: { ...cors, 'Content-Type': 'application/json' }
  });

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return json({ ok: false, error: 'API key not configured' }, 500);

  const body = await request.json().catch(() => ({}));
  const { imageBase64, mediaType = 'image/jpeg', target = 'self' } = body;
  if (!imageBase64) return json({ ok: false, error: 'No image' }, 400);

  const selfFields  = 'โจมตีกำลังภายนอก/โจมตี→atk, เจาะเกราะ→pen, ทำลายโล่→sb, ข่มสำนัก→sa, โจมตีธาตุ→ea, ความแม่นยำ→acc, คริติคอล→crit, ดาเมจคริติคอล%→cdmg';
  const enemyFields = 'ป้องกันกำลังภายนอก/ป้องกัน→def, โล่พลังชี→sh, ป้องกันสำนัก→sd, ต้านทานธาตุ→er, บล็อก/หลบ→bl, ลดดาเมจ%→dr, ต้านคริติคอล→cr';
  const fields = target === 'self' ? selfFields : enemyFields;

  const prompt = `นี่คือรูป stat screen จากเกม Sword of Justice (剑侠情缘)
อ่านค่าตัวเลขของ stat ต่อไปนี้และ map ตาม key: ${fields}
ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น ไม่มี backtick เช่น {"atk":4577,"pen":586}
ถ้าไม่เห็น field ใดในรูปให้ข้ามไป`;

  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://guild-war-manager.pages.dev',
        'X-Title': 'SOJ Damage Calculator',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout:free',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
            { type: 'text', text: prompt }
          ]
        }],
        max_tokens: 400,
        temperature: 0,
      })
    });

    const data = await resp.json();
    if (!resp.ok) return json({ ok: false, error: data.error?.message || 'OpenRouter error', status: resp.status }, 500);

    const text = data.choices?.[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return json({ ok: true, stats: parsed });
  } catch (e) {
    return json({ ok: false, error: e.message }, 500);
  }
}
