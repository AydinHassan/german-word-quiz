export async function onRequestPost({ request, env }) {
  const { german, english } = await request.json()

  await env.DB.prepare(
    "INSERT INTO words (german, english) VALUES (?, ?)"
  ).bind(german, english).run()

  return Response.json({ ok: true })
}

