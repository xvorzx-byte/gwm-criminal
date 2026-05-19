export async function onRequest() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': 'gwm_session=; Path=/; HttpOnly; Secure; Max-Age=0',
    },
  });
}
