import axios from "axios"; // 1. Cambiar require por import

class AuthServiceClient {
    constructor() {
        const baseURL = process.env.AUTH_SERVICE_URL;
        if (!baseURL) {
            throw new Error("AUTH_SERVICE_URL no configurada en el .env");
        }
        this.client = axios.create({
            baseURL
        });
    }

    async getProfile(token) {
        const response = await this.client.get(
            "/api/v1/Auth/profile",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data.data;
    }
}


export default new AuthServiceClient();