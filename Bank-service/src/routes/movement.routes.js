import authMiddleware from '../middlewares/authMiddleware.js'
import { authorizeRoles } from '../middlewares/role.middleware.js'
import {
    depositController,
    transferController
} from '../controllers/movement.controller.js'

export default async function movementRoutes(fastify, options) {
    fastify.post('/deposit', {
        preHandler: [authMiddleware, authorizeRoles('EMPLOYEE')]
    }, depositController)

    fastify.post('/transfer', {
        preHandler: [authMiddleware, authorizeRoles('CLIENT')]
    }, transferController)
}