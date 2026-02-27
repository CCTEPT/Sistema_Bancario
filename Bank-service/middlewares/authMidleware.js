export async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    console.log("JWT ERROR:", err)
    reply.code(401).send({ message: err.message })
  }
}