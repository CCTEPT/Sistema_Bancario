import accountController from "../controllers/account.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createAccountSchema } from "../schemas/account.schema.js";

async function routes(fastify, options) {

    fastify.post(
        "/",
        {
            preHandler: fastify.authorizeRole("ADMIN_ROLE", "EMPLOYEE_ROLE"),
            schema: {
                ...createAccountSchema,
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.createAccount
    );

    fastify.get(
        "/",
        {
            preHandler: fastify.authorizeRole("EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.getAccounts
    );

    // Ruta para obtener cuenta por ID, solo para ADMIN_ROLE y USER_ROLE
    fastify.get(
        "/:idCuenta",
        {
            preHandler: fastify.authorizeRole("USER_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.getAccountById
    );

}

export default routes;