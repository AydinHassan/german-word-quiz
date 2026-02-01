export async function onRequestGet({ env }) {
  // Get all words from the database
  const allWords = await env.DB.prepare(
    "SELECT * FROM words"
  ).all()

  // Shuffle all words to randomize the quiz order
  const shuffled = allWords.results.sort(() => Math.random() - 0.5)

  // Build quiz questions with options
  const questions = shuffled.map((word, index) => {
    // Get 3 other wrong answers (excluding the current word)
    const otherWords = shuffled.filter(w => w.id !== word.id)
    const wrong = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english)

    // Combine correct answer with wrong ones and shuffle
    const options = [word.english, ...wrong].sort(() => Math.random() - 0.5)

    return {
      german: word.german,
      correct: word.english,
      options
    }
  })

  return Response.json({ questions })
}

