export async function onRequestPost({ request, env }) {
  const { german, english } = await request.json()

  await env.DB.prepare(
    "INSERT INTO words (german, english) VALUES (?, ?)"
  ).bind(german, english).run()

  return Response.json({ ok: true })
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json()
  await env.DB.prepare("DELETE FROM words WHERE id = ?").bind(id).run()
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  })
}

export async function onRequestGet({ env }) {
  const words = await env.DB.prepare("SELECT * FROM words ORDER BY created_at DESC").all()
  return new Response(JSON.stringify(words.results), {
    headers: { "Content-Type": "application/json" }
  })
}