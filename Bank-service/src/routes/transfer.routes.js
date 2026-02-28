import transfer from "../controllers/transfer.controller.js"
import authMiddleware from '../middlewares/authMiddleware.js'

export default async function transferRoutes(fastify, options) {

    fastify.post(
        '/',
        { preHandler: [authMiddleware] },
        transferir
    )

}