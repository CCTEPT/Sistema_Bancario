import { axiosAuth } from './api.js';

//funcion para iniciar sesion, la consume
//se obtiene la respuesta, hace la peticion
export const login = async (data) => {
    return await axiosAuth.post('/Auth/login', data);
};