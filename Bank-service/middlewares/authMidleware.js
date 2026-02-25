export async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Token inválido o expirado' })
  }
}