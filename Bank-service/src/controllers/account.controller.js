import authClient from "../services/authServiceClient.service.js";
import accountService from "../services/account.service.js";

async function createAccount(request, reply) {
    try {

        const idUsuario = request.user.sub;

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
        return reply.code(500).send({
            message: error.message
        });
    }
}

async function getAccounts(request, reply) {
    return {
        message: "Listado de Cuentas",
        accounts: await accountService.getAccounts()
    }
}



const getAccountById = async (request, reply) => {
    try {

        const { idCuenta } = request.params;

        const account = await accountService.getAccountById(idCuenta);

        // 🔐 Validar propiedad de la cuenta
        if (
            request.user.role === "USER_ROLE" &&
            account.idUsuario !== request.user.sub
        ) {
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
};

// 2. Creamos el objeto que tus rutas están esperando
const accountController = {
    createAccount,
    getAccounts,
    getAccountById
};

// 3. Exportamos ese objeto por defecto
export default accountController;