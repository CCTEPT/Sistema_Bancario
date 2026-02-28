import { emitCheck, cashCheck } from "../controllers/check.controller.js";

export default async function checkRoutes(fastify, options) {

    fastify.post(
        "/",
        {
            preHandler: [
                fastify.authenticate,
                fastify.authorizeRole("CLIENT")
            ]
        },
        emitCheck
    );

    fastify.post(
        "/:id/cash",
        {
            preHandler: [
                fastify.authenticate,
                fastify.authorizeRole("EMPLOYEE")
            ]
        },
        cashCheck
    );

}