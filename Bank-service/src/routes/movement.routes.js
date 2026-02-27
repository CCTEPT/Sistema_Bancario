import { authenticate } from '../../middlewares/authMidleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'
import {
    depositController,
    transferController,
    withdrawController
} from '../controllers/movement.controller.js'

export default async function movementRoutes(fastify, options) {
    fastify.post('/deposit', {
        preHandler: [authenticate, authorizeRoles('EMPLOYEE')]
    }, depositController)

    fastify.post('/transfer', {
        preHandler: [authenticate, authorizeRoles('CLIENT')]
    }, transferController)

    fastify.post('/withdraw', {
        preHandler: [authenticate, authorizeRoles('CLIENT')]
    }, withdrawController)
}