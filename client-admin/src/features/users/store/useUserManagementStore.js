import { create } from 'zustand';
import {
    getAllUsers as getAllUsersRequest,
    updateUserRole as updateUserRoleRequest,
    getUserRoles as getUserRolesRequest,
    getUsersByRole as getUsersByRoleRequest
} from '../../../shared/apis';

export const useUserManagementStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,

    //listar todos los usuarios
    getAllUsers: async (apiFn = getAllUsersRequest, options = {}) => {
        try {
            const { force = false } = options;
            const state = get();

            if (state.loading) return;
            if (!force && state.users.length > 0) return;

            set({ loading: true, error: null });

            const fetcher = typeof apiFn === 'function' ? apiFn : getAllUsersRequest;
            const response = await fetcher();

            set({
                users: response.users || response,
                loading: false
            })

        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al listar usuarios',
                loading: false,
            });
        }
    },

    //actualizar el rol de un usuario
    updateUserRole: async (id, roleName) => {
        try {
            set({ loading: true, error: null });
            const response = await updateUserRoleRequest(id, { roleName });
            set({
                users: get().users.map((u) => (u.id === id ? { ...u, role: response.role } : u)),
                loading: false,
            });
            return { success: true };
        } catch (err) {
            set({
                loading: false,
                error: err.response?.data?.message || 'Error al actualizar rol',
            });
            return { success: false, error: err.response?.data?.message };
        }
    },
    getUserRoles: async (id) => {
        try {
            const response = await getUserRolesRequest(id);
            return response.roles;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error al obtener roles' });
            return [];
        }
    },

    getUsersByRole: async (roleName) => {
        try {
            const response = await getUsersByRoleRequest(roleName);
            return response.users;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error al obtener usuarios por rol' });
            return [];
        }
    },
}))