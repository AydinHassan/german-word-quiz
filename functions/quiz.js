export async function onRequestGet({ env }) {
  const allWords = await env.DB.prepare("SELECT * FROM words").all()

  const words = allWords.results.map(w => {
    let weight = 1
    if (w.total_count >= 3) {
      const accuracy = w.correct_count / w.total_count
      weight = Math.max(0.1, 1 - accuracy * 0.8)
    }
    return { ...w, weight }
  })

  const selected = []
  const remaining = [...words]
  const count = Math.min(15, remaining.length)

  while (selected.length < count) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0)
    let r = Math.random() * totalWeight
    for (let i = 0; i < remaining.length; i++) {
      r -= remaining[i].weight
      if (r <= 0) {
        selected.push(remaining.splice(i, 1)[0])
        break
      }
    }
  }

  const questions = selected.map(word => {
    const otherWords = selected.filter(w => w.id !== word.id)
    const wrong = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english)

    const options = [word.english, ...wrong].sort(() => Math.random() - 0.5)

    return {
      word_id: word.id,
      german: word.german,
      correct: word.english,
      options
    }
  })

  return Response.json({ questions })
}

export async function onRequestPost({ request, env }) {
  const { results } = await request.json()

  if (!Array.isArray(results) || results.length === 0) {
    return new Response("Missing results", { status: 400 })
  }

  const stmt = env.DB.prepare(
    `UPDATE words SET
       correct_count = correct_count + ?1,
       total_count = total_count + 1
     WHERE id = ?2`
  )

  await env.DB.batch(results.map(r => stmt.bind(r.correct ? 1 : 0, r.word_id)))

  return Response.json({ ok: true })
}
