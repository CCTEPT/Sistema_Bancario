export default function authorizeRole(roles = []) {

    return async function (request, reply) {

        if (!request.user) {

            return reply.code(401).send({
                message: "No autenticado"
            })

        }

        if (!roles.includes(request.user.role)) {

            return reply.code(403).send({
                message: "No autorizado"
            })

        }

    }

}