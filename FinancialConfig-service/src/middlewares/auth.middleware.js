export default async function authMiddleware(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.code(401).send({ error: 'Token inválido', message: err.message })
  }
}

export function allowRoles(allowedRoles = []) {
  return async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Token inválido', message: err.message })
    }

    const role = request.user?.role
    if (!allowedRoles.includes(role)) {
      return reply.code(403).send({ error: 'No autorizado' })
    }
  }
}
