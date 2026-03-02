import transferController from "../controllers/transfer.controller.js"
import authMiddleware from '../middlewares/auth.middleware.js'

export default async function transferRoutes(fastify, options) {

    fastify.post(
        '/',
        { preHandler: [authMiddleware] },
        transferController
    )

}