//archivo para la configuracion de estados gloabales
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginReq } from '../../../shared/apis';
import { getProfile } from '../../../shared/apis/auth.js';
import { createBankAccount } from '../../../shared/apis/bank.js';
//import { showError } from '../../../shared/utils/toast.js';

//gestionar la persistencia del estado global de la app
export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            role: null,
            loading: false, //feedback de carga para el usuario, indicar que esta realizando una accion - se oculta el spinner
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,
            checkAuth: async () => {
                const token = get().token;
                let user = get().user;

                if (token) {
                    try {
                        const profile = await getProfile();
                        user = {
                            ...user,
                            ...(profile?.data || profile),
                        };
                    } catch (error) {
                        console.error('No se pudo refrescar el perfil:', error);
                    }
                }

                const role = user?.role; // ? forzar a intentar desestructurar el role, si no existe, devuelve undefined

                    set({
                        isLoadingAuth: false,
                        isAuthenticated: Boolean(token),
                        user,
                        role,
                    });
                    return; //que se interrumpa el flujo
                },

            //funcion para cerrar sesion
            logout: () => {
                localStorage.removeItem('banking_token');
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false,
                });
            },
            //funcion para iniciar sesion+
            login: async ({ emailOrUsername, password }) => {
                try {
                    set({ loading: true, error: null });

                    const { data } = await loginReq({ emailOrUsername, password });

                    const token = data?.token;
                    const role = data?.userDetails?.role;

                    if (!token) {
                        throw new Error('El servicio de autenticación no devolvió un token válido');
                    }

                    set({
                        user: data.userDetails,
                        token,
                        refreshToken: data.refreshToken || null,
                        expiresAt: data.expiresAt,
                        isLoadingAuth: false,
                        isAuthenticated: true,
                        loading: false,
                        role,
                    });
                    localStorage.setItem('banking_token', token);

                    try {
                        const profile = await getProfile();
                        const fullUser = {
                            ...data.userDetails,
                            ...(profile?.data || profile),
                        };

                        set({
                            user: fullUser,
                            role: fullUser.role,
                        });
                    } catch (error) {
                        console.error('No se pudo cargar el perfil completo:', error);
                    }

                    const pending = JSON.parse(localStorage.getItem('pending_bank_account') || 'null');
                    if (pending?.tipoCuenta && pending?.divisa) {
                        try {
                            await createBankAccount({
                                tipoCuenta: pending.tipoCuenta,
                                divisa: pending.divisa,
                            });
                            localStorage.removeItem('pending_bank_account');
                        } catch (error) {
                            console.error('No se pudo crear la cuenta pendiente tras el login:', error);
                        }
                    }

                    return { success: true };
                } catch (err) {
                    const message = err.response?.data?.message || err.message || 'Error al iniciar sesión';
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

        }),
        { name: 'auth-novabank' }
    )
);
