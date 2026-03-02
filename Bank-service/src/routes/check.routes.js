import { emitCheck, cashCheck } from '../controllers/check.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeRole from '../middlewares/role.middleware.js'

export default async function checkRoutes(fastify, options) {

    fastify.post(
        '/',
        {
            preHandler: [authMiddleware, authorizeRole(["ADMIN", "EMPLOYEE"])]
        },
        emitCheck
    )

    fastify.post(
        '/:id/cash',
        {
            preHandler: [authMiddleware, authorizeRole(["ADMIN", "EMPLOYEE"])]
        },
        cashCheck
    )

}