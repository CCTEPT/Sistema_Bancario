import authClient from "../services/authServiceClient.service.js";
import accountService from "../services/account.service.js";

async function createAccount(request, reply) {
    try {
        const token = request.token || request.headers.authorization?.replace(/^Bearer\s+/i, "");
        if (!token) {
            return reply.code(401).send({ error: "Token faltante" });
        }

        const userRole = request.user.role;

        if (userRole === "USER_ROLE") {
            const idUsuario = request.user.sub;

            const profile = await authClient.getProfile(token);
            if (!profile?.isEmailVerified) {
                return reply.code(403).send({
                    message: "Debes verificar tu correo antes de solicitar una cuenta bancaria"
                });
            }

            const accountRequest = await accountService.createAccountRequest({
                idUsuario,
                tipoCuenta: request.body.tipoCuenta,
                divisa: request.body.divisa || "GTQ",
                requestedByRole: userRole
            });

            return reply.code(202).send({
                message: "Solicitud de cuenta enviada. Un administrador o empleado debe aprobarla.",
                request: accountRequest
            });
        }

        const idUsuario = request.body.idUsuario || request.user.sub;

        const account = await accountService.createAccount({
            idUsuario,
            tipoCuenta: request.body.tipoCuenta,
            divisa: request.body.divisa || "GTQ"
        });

        return reply.code(201).send({
            message: "Cuenta creada correctamente",
            account
        });

    } catch (error) {
        request.log.error({ err: error }, "Error al crear cuenta bancaria");
        const message = error.response?.data?.message || error.message || "Error al crear la cuenta";
        const statusCode = error.response?.status || 400;
        return reply.code(statusCode >= 500 ? 500 : statusCode).send({ message });
    }
}

async function getAccounts(request) {
    const userAccounts = await accountService.getAccountsByUser(request.user.sub);
    return {
        message: "Listado de cuentas del usuario",
        accounts: userAccounts
    };
}

async function getAllAccounts(request) {
    const token = request.token || request.headers.authorization?.replace(/^Bearer\s+/i, "");
    const accounts = await accountService.getAccounts({ token });
    return {
        message: "Listado de cuentas de gestión",
        accounts
    };
}

async function getAccountRequests(request) {
    const requests = await accountService.getAccountRequests({
        role: request.user.role,
        userId: request.user.sub
    });
    return {
        message: "Solicitudes de cuenta",
        requests
    };
}

async function approveAccountRequest(request, reply) {
    try {
        const result = await accountService.approveAccountRequest({
            requestId: request.params.requestId,
            reviewerId: request.user.sub
        });
        return reply.send({
            message: "Solicitud aprobada y cuenta creada",
            ...result
        });
    } catch (error) {
        request.log.error({ err: error }, "Error al aprobar solicitud de cuenta");
        return reply.code(400).send({
            message: error.message || "No se pudo aprobar la solicitud"
        });
    }
}

async function rejectAccountRequest(request, reply) {
    try {
        const accountRequest = await accountService.rejectAccountRequest({
            requestId: request.params.requestId,
            reviewerId: request.user.sub,
            reason: request.body?.reason
        });
        return reply.send({
            message: "Solicitud rechazada",
            request: accountRequest
        });
    } catch (error) {
        request.log.error({ err: error }, "Error al rechazar solicitud de cuenta");
        return reply.code(400).send({
            message: error.message || "No se pudo rechazar la solicitud"
        });
    }
}

async function getAccountById(request, reply) {
    try {
        const { idCuenta } = request.params;
        const account = await accountService.getAccountById(idCuenta);

        if (request.user.role === "USER_ROLE" && account.idUsuario !== request.user.sub) {
            return reply.code(403).send({
                error: "No tienes permiso para ver esta cuenta"
            });
        }

        return reply.send({
            message: "Detalle de cuenta",
            account
        });
    } catch (error) {
        return reply.code(404).send({
            error: error.message
        });
    }
}

async function updateAccountStatus(request, reply) {
    try {
        const account = await accountService.updateAccountStatus({
            accountId: request.params.idCuenta,
            estado: request.body?.estado,
            userId: request.user?.id || request.user?._id || request.user?.sub,
            userRole: request.user?.role
        });
        return reply.send({
            message: "Estado de cuenta actualizado",
            account
        });
    } catch (error) {
        return reply.code(400).send({
            message: error.message || "No se pudo actualizar el estado de la cuenta"
        });
    }
}

const accountController = {
    createAccount,
    getAccounts,
    getAllAccounts,
    getAccountById,
    updateAccountStatus,
    getAccountRequests,
    approveAccountRequest,
    rejectAccountRequest
};

export default accountController;