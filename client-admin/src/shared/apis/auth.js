import { axiosAuth } from './api.js';

//funcion para iniciar sesion, la consume
//se obtiene la respuesta, hace la peticion
export const login = async (data) => {
    return await axiosAuth.post('/Auth/login', data);
};

export const createUser = async (data) => {
  return await axiosAuth.post('/Auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }); //expone la api de .net, lo ultimo /
};

export const verifyEmail = async (token) =>{
    return axiosAuth.post('/Auth/verify-email', { token });
}

export const forgotPassword = async (email) => {
    return await axiosAuth.post('/Auth/forgot-password',{email} )
}

export const resetPassword = async (token, newPassword) =>{
    return await axiosAuth.post('/Auth/reset-password', { token, newPassword })
}