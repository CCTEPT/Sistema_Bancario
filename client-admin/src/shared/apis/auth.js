import { axiosAuth } from "./apis";

export const login = async (data) => {
    return await axiosAuth.post('/Auth/login', data);
}