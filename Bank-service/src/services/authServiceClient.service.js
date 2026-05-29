import axios from "axios";
 
class AuthServiceClient {
    constructor() {
        const baseURL = process.env.AUTH_SERVICE_URL;
        if (!baseURL) {
            throw new Error("AUTH_SERVICE_URL no configurada en el .env");
        }
        this.client = axios.create({ baseURL });
    }
 
    async getProfile(token) {
        const response = await this.client.get("/api/v1/Auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    }
 
    // Devuelve todos los usuarios con el rol indicado.
    // Requiere el token del admin/employee para que el AuthService autorice la petición.
    async getUsersByRole(roleName, token) {
        const response = await this.client.get(`/api/v1/User/by-role/${roleName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // El endpoint devuelve un array directamente según la documentación
        return response.data;
    }
}
 
export default new AuthServiceClient();
 