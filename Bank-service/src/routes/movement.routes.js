import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeRole  from '../middlewares/role.middleware.js'
import {
    depositController,
    withdrawController,
    transferController,
    historyController
} from '../controllers/movement.controller.js'
import {
    depositSchema,
    withdrawSchema,
    transferSchema,
    historySchema
} from '../schemas/movement.schema.js'

export default async function movementRoutes(fastify, options) {
    fastify.post('/deposit', {
        preHandler: [authMiddleware, authorizeRole('EMPLOYEE')],
        schema: {
            ...depositSchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, depositController)

    fastify.post('/withdraw', {
        preHandler: [authMiddleware, authorizeRole('CLIENT')],
        schema: {
            ...withdrawSchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, withdrawController)

    fastify.post('/transfer', {
        preHandler: [authMiddleware, authorizeRole('CLIENT')],
        schema: {
            ...transferSchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, transferController)

    fastify.get('/history/:accountId', {
        preHandler: [authMiddleware],
        schema: {
            ...historySchema,
            tags: ['Movements'],
            security: [{ bearerAuth: [] }]
        }
    }, historyController)
}