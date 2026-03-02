import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeRole  from '../middlewares/role.middleware.js'
import {
    depositController,
    transferController
} from '../controllers/movement.controller.js'

export default async function movementRoutes(fastify, options) {
    fastify.post('/deposit', {
        preHandler: [authMiddleware, authorizeRole('EMPLOYEE')]
    }, depositController)

    fastify.post('/transfer', {
        preHandler: [authMiddleware, authorizeRole('CLIENT')]
    }, transferController)
}