export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return Response.redirect('/?error=no_code', 302);
  }

  try {
    /* 1. แลก code เป็น access token */
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.DISCORD_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return Response.redirect('/?error=token_fail', 302);

    /* 2. ดึงข้อมูล user */
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    /* 3. ตรวจสอบว่าอยู่ใน Guild */
    const memberRes = await fetch(
      `https://discord.com/api/users/@me/guilds/${env.GUILD_SERVER_ID}/member`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!memberRes.ok) {
      return Response.redirect('/?error=not_member', 302);
    }
    const member = await memberRes.json();

    /* 4. กำหนด role: admin / sub_admin / member */
    const adminIds = (env.ADMIN_IDS || '').split(',').map(s => s.trim());
    const subAdminIds = (env.SUB_ADMIN_IDS || '').split(',').map(s => s.trim());
    let role = 'member';
    if (adminIds.includes(user.id)) role = 'admin';
    else if (subAdminIds.includes(user.id)) role = 'sub_admin';

    /* 5. สร้าง session token (simple JWT-like) */
    const sessionData = {
      userId: user.id,
      username: user.username,
      displayName: member.nick || user.global_name || user.username,
      avatar: user.avatar,
      role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 วัน
    };

    // Unicode-safe base64 encoding
    const jsonStr = JSON.stringify(sessionData);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
    const sessionToken = btoa(binaryString);

    /* 6. set cookie แล้ว redirect ไป app */
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/app',
        'Set-Cookie': `gwm_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 3600}`,
      },
    });

  } catch (e) {
    console.error('Callback error:', e.message, e.stack);
    return Response.redirect('/?error=server_error&msg=' + encodeURIComponent(e.message), 302);
  }
}
