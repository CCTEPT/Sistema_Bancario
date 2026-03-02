export default function authorizeRole(...allowedRoles) {

  return async function (request, reply) {

    try {

      await request.jwtVerify()

      const userRole = request.user.role

      if (!allowedRoles.includes(userRole)) {
        return reply.code(403).send({
          error: "No tienes permisos para realizar esta acción"
        })
      }

    } catch (err) {

      return reply.code(401).send({
        error: "No autorizado"
      })

    }

  }

}