export async function onRequest(context) {
  const { env } = context;
  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    redirect_uri: env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds.members.read',
    prompt: 'none',
  });
  return Response.redirect(
    `https://discord.com/api/oauth2/authorize?${params}`,
    302
  );
}
