import accountController from "../controllers/account.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createAccountSchema, getAccountsSchema, getAccountByIdSchema } from "../schemas/account.schema.js";

async function routes(fastify, options) {

    fastify.post(
        "/",
        {
            preHandler: fastify.authorizeRole("USER_ROLE", "ADMIN_ROLE", "EMPLOYEE_ROLE"),
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
            preHandler: fastify.authorizeRole("USER_ROLE", "EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                ...getAccountsSchema,
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.getAccounts
    );

    fastify.get(
        "/manage",
        {
            preHandler: fastify.authorizeRole("EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.getAllAccounts
    );

    fastify.get(
        "/requests",
        {
            preHandler: fastify.authorizeRole("USER_ROLE", "EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.getAccountRequests
    );

    fastify.post(
        "/requests/:requestId/approve",
        {
            preHandler: fastify.authorizeRole("EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.approveAccountRequest
    );

    fastify.post(
        "/requests/:requestId/reject",
        {
            preHandler: fastify.authorizeRole("EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.rejectAccountRequest
    );

    fastify.get(
        "/:idCuenta",
        {
            preHandler: fastify.authorizeRole("USER_ROLE", "EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                ...getAccountByIdSchema,
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.getAccountById
    );

    fastify.patch(
        "/:idCuenta/status",
        {
            preHandler: fastify.authorizeRole("USER_ROLE", "EMPLOYEE_ROLE", "ADMIN_ROLE"),
            schema: {
                tags: ["Accounts"],
                security: [{ bearerAuth: [] }]
            }
        },
        accountController.updateAccountStatus
    );

}

export default routes;
