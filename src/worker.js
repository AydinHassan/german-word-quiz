export default {
  async fetch(req, env) {
    const url = new URL(req.url)

    if (req.method === "POST" && url.pathname === "/words") {
      const { german, english } = await req.json()
      await env.DB.prepare(
        "INSERT INTO words (german, english) VALUES (?, ?)"
      ).bind(german, english).run()
      return Response.json({ ok: true })
    }

    if (url.pathname === "/quiz") {
      const correct = await env.DB.prepare(
        "SELECT * FROM words ORDER BY RANDOM() LIMIT 1"
      ).first()

      const wrong = await env.DB.prepare(
        "SELECT english FROM words WHERE id != ? ORDER BY RANDOM() LIMIT 3"
      ).bind(correct.id).all()

      const options = [
        correct.english,
        ...wrong.results.map(r => r.english),
      ].sort(() => Math.random() - 0.5)

      return Response.json({
        german: correct.german,
        correct: correct.english,
        options,
      })
    }

    return new Response("Not found", { status: 404 })
  }
}

