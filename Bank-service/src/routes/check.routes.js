import { emitCheck, cashCheck, listChecks } from '../controllers/check.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeRole from '../middlewares/role.middleware.js'
import { emitCheckSchema, cashCheckSchema, cashCheckByNumberSchema } from '../schemas/check.schema.js'

export default async function checkRoutes(fastify, options) {
    fastify.get(
        '/',
        {
            preHandler: [authMiddleware],
            schema: {
                tags: ["Checks"],
                security: [{ bearerAuth: [] }]
            }
        },
        listChecks
    )

    fastify.post(
        '/',
        {
            preHandler: [authMiddleware, authorizeRole("USER_ROLE", "ADMIN_ROLE", "EMPLOYEE_ROLE")],
            schema: {
                ...emitCheckSchema,
                tags: ["Checks"],
                security: [{ bearerAuth: [] }]
            }
        },
        emitCheck
    )

    fastify.post(
        '/cash',
        {
            preHandler: [authMiddleware, authorizeRole("USER_ROLE", "ADMIN_ROLE", "EMPLOYEE_ROLE")],
            schema: {
                ...cashCheckByNumberSchema,
                tags: ["Checks"],
                security: [{ bearerAuth: [] }]
            }
        },
        cashCheck
    )

    fastify.post(
        '/:id/cash',
        {
            preHandler: [authMiddleware, authorizeRole("USER_ROLE", "ADMIN_ROLE", "EMPLOYEE_ROLE")],
            schema: {
                ...cashCheckSchema,
                tags: ["Checks"],
                security: [{ bearerAuth: [] }]
            }
        },
        cashCheck
    )

}
