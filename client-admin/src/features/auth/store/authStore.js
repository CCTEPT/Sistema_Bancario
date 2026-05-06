//archivo para la configuracion de estados gloabales
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginReq } from '../../../shared/apis';
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
                const role = get().user?.role; // ? forzar a intentar desestructurar el role, si no existe, devuelve undefined

                    set({
                        isLoadingAuth: false,
                        isAuthenticated: Boolean(token),
                        role,
                    });
                    return; //que se interrumpa el flujo
                },

            //funcion para cerrar sesion
            logout: () => {
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

                    const role = data?.userDetails?.role;
                    if (role !== 'ADMIN_ROLE') {

                        set({
                            user: data.userDetails,
                            token: data.accessToken,
                            refreshToken: data.refreshToken,
                            expiresAt: data.expiresIn,
                            isLoadingAuth: false,
                            isAuthenticated: true,
                            role: data.userDetails.role,
                        });
                        
                    }

                    set({
                        user: data.userDetails,
                        token: data.accessToken,
                        refreshToken: data.refreshToken,
                        expiresAt: data.expiresIn,
                        isAuthenticated: true,
                        loading: false,
                    });
                    return { success: true };
                } catch (err) {
                    const message = err.response?.data?.message || 'Error al iniciar sesión';
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

        }),
        { name: 'auth-novabank' }
    )
);