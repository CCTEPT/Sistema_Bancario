import { emitCheck, cashCheck } from '../controllers/check.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeRole from '../middlewares/role.middleware.js'
import { emitCheckSchema, cashCheckSchema } from '../schemas/check.schema.js'

export default async function checkRoutes(fastify, options) {

    fastify.post(
        '/',
        {
            preHandler: [authMiddleware, authorizeRole(["ADMIN", "EMPLOYEE"])],
            schema: {
                ...emitCheckSchema,
                tags: ["Checks"],
                security: [{ bearerAuth: [] }]
            }
        },
        emitCheck
    )

    fastify.post(
        '/:id/cash',
        {
            preHandler: [authMiddleware, authorizeRole(["ADMIN", "EMPLOYEE"])],
            schema: {
                ...cashCheckSchema,
                tags: ["Checks"],
                security: [{ bearerAuth: [] }]
            }
        },
        cashCheck
    )

}