export async function onRequestPost({ request, env }) {
  const { word_id, correct } = await request.json()

  if (!word_id || typeof correct !== "boolean") {
    return new Response("Missing word_id or correct", { status: 400 })
  }

  await env.DB.prepare(
    `UPDATE words SET
       correct_count = correct_count + ?1,
       total_count = total_count + 1
     WHERE id = ?2`
  ).bind(correct ? 1 : 0, word_id).run()

  return Response.json({ ok: true })
}
