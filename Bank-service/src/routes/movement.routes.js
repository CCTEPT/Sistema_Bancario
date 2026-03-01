import authMiddleware from '../middlewares/authMiddleware.js'
import { authorizeRoles } from '../middlewares/role.middleware.js'

import {
    depositController,
    transferController,
    getMovementsController,
    getBalanceController
} from '../controllers/movement.controller.js'

export default async function movementRoutes(fastify, options) {

    fastify.post('/deposit', {
        preHandler: [authMiddleware, authorizeRoles('EMPLOYEE')]
    }, depositController)

    fastify.post('/transfer', {
        preHandler: [authMiddleware, authorizeRoles('CLIENT')]
    }, transferController)


    fastify.get('/cuentas/:id/movimientos', {
        preHandler: [authMiddleware]
    }, getMovementsController)

    fastify.get('/cuentas/:id/saldo', {
        preHandler: [authMiddleware]
    }, getBalanceController)
}