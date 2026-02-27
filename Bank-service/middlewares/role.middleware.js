export function authorizeRoles(...allowedRoles) {
    return async function (request, reply) {
        const userRole = request.user.role

        if (!allowedRoles.includes(userRole)) {
        return reply.code(403).send({
            message: 'No autorizado'
        })
        }
    }
}