export async function onRequestGet({ env }) {
  const allWords = await env.DB.prepare(
    "SELECT * FROM words"
  ).all()

  const shuffled = allWords.results.sort(() => Math.random() - 0.5)

  const quizWords = shuffled.slice(0, 15)

  const questions = quizWords.map(word => {
    const otherWords = quizWords.filter(w => w.id !== word.id)
    const wrong = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english)

    const options = [word.english, ...wrong].sort(() => Math.random() - 0.5)

    return {
      german: word.german,
      correct: word.english,
      options
    }
  })

  return Response.json({ questions })
}

