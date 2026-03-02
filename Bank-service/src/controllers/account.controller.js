// 1. Cambiamos require por import para ser consistentes con ESM
import authClient from "../services/authServiceClient.service.js";
import accountService from "../services/account.service.js";

async function createAccount(request, reply) {
    try {
        // extrae id directamente del payload del JWT (sub viene de AuthService)
        const idUsuario = request.user?.sub;

        if (!idUsuario) {
            // si por alguna razón no tiene sub, intenta con el token y el cliente
            const authHeader = request.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

            if (!token) {
                return reply.code(401).send({ message: "Token no proporcionado" });
            }

            const user = await authClient.getProfile(token);
            if (!user || !user.id) {
                return reply.code(404).send({ message: "Usuario no encontrado" });
            }
            request.user = { sub: user.id, ...user };
        }

        const account = await accountService.createAccount({
            idUsuario: request.user.sub,
            tipoCuenta: request.body.tipoCuenta,
            divisa: request.body.divisa || "GTQ"
        });

        return reply.code(201).send({
            message: "Cuenta creada correctamente",
            account
        });
    } catch (error) {
        return reply.code(500).send({ message: error.message });
    }
}

// 2. Creamos el objeto que tus rutas están esperando
const accountController = {
    createAccount
};

// 3. Exportamos ese objeto por defecto
export default accountController;