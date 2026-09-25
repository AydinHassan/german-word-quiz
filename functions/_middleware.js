const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"])

async function digest(value) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
}

async function tokensMatch(given, expected) {
  const [a, b] = await Promise.all([digest(given), digest(expected)])
  return crypto.subtle.timingSafeEqual(a, b)
}

export async function onRequest({ request, env, next }) {
  if (!MUTATING.has(request.method)) return next()

  const expected = env.ADMIN_TOKEN
  const auth = request.headers.get("Authorization") || ""
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : ""

  if (!expected || !given || !(await tokensMatch(given, expected))) {
    return new Response("Unauthorized", { status: 401 })
  }

  return next()
}
