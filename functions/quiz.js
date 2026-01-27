export async function onRequestGet({ env }) {
  const correct = await env.DB.prepare(
    "SELECT * FROM words ORDER BY RANDOM() LIMIT 1"
  ).first()

  const wrong = await env.DB.prepare(
    "SELECT english FROM words WHERE id != ? ORDER BY RANDOM() LIMIT 3"
  ).bind(correct.id).all()

  const options = [
    correct.english,
    ...wrong.results.map(r => r.english)
  ].sort(() => Math.random() - 0.5)

  return Response.json({
    german: correct.german,
    correct: correct.english,
    options
  })
}

