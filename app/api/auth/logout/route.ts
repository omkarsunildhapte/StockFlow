export async function POST() {
  const headers = new Headers();
  headers.set("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
