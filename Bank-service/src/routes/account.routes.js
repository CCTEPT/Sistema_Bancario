import accountController from "../controllers/account.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createAccountSchema } from "../schemas/account.schema.js";

async function routes(fastify, options) {

    fastify.post(
        "/",
        {
            preHandler: authMiddleware,
            schema: {
                ...createAccountSchema,
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.createAccount
    );

}

export default routes;