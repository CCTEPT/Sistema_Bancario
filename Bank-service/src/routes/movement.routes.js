import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeRole  from '../middlewares/role.middleware.js'
import {
    depositController,
    withdrawController,
    transferController,
    historyController,
    userHistoryController
} from '../controllers/movement.controller.js'
import {
    depositSchema,
    withdrawSchema,
    transferSchema,
    historySchema
} from '../schemas/movement.schema.js'

export default async function movementRoutes(fastify, options) {
    fastify.post('/deposit', {
        preHandler: [authMiddleware, authorizeRole('USER_ROLE', 'EMPLOYEE_ROLE', 'ADMIN_ROLE')],
        schema: {
            ...depositSchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, depositController)

    fastify.post('/withdraw', {
        preHandler: [authMiddleware, authorizeRole('USER_ROLE')],
        schema: {
            ...withdrawSchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, withdrawController)

    fastify.post('/transfer', {
        preHandler: [authMiddleware, authorizeRole('USER_ROLE')],
        schema: {
            ...transferSchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, transferController)

    fastify.get('/history', {
        preHandler: [authMiddleware],
        schema: {
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, userHistoryController)

    fastify.get('/history/:accountId', {
        preHandler: [authMiddleware],
        schema: {
            ...historySchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, historyController)
}
