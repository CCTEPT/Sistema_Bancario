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

export const getAllUsers = async () => {
    const { data } = await axiosAuth.get('/User');
    return { users: data} ;
}

export const getProfile = async () => {
    const { data } = await axiosAuth.get('/Auth/profile');
    return data;
};

//actualizar un usuaro
export const updateUserRole = async (userId, roleName) => {
    const { data } = await axiosAuth.patch(`/User/${userId}/role`, { roleName });
    return data;
};

export const getUserRoles = async (userId) => {
    const { data } = await axiosAuth.get(`/User/${userId}/roles`);
    return { users: data} ;
}

export const getUsersByRole = async (roleName) => {
    const { data } = await axiosAuth.get(`/User/by-role/${roleName}`);
    return { users: data} ;
}