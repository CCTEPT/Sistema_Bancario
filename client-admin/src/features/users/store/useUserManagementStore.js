import { create } from 'zustand';
import {
    createUser as createUserRequest,
    getAllUsers as getAllUsersRequest,
    updateUserRole as updateUserRoleRequest,
    updateUserStatus as updateUserStatusRequest,
    getUserRoles as getUserRolesRequest,
    getUsersByRole as getUsersByRoleRequest
} from '../../../shared/apis';

const normalizeUsers = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getUserId = (user) => user?.id || user?._id || user?.Id;

const buildUserFormData = (values) => {
    const formData = new FormData();
    formData.append('Name', values.name);
    formData.append('Surname', values.surname);
    formData.append('Username', values.username);
    formData.append('Email', values.email);
    formData.append('Password', values.password);
    formData.append('Phone', values.phone);

    const profilePicture = values.profilePicture?.[0];
    if (profilePicture) {
        formData.append('ProfilePicture', profilePicture);
    }

    return formData;
};

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
                users: normalizeUsers(response),
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
            const response = await updateUserRoleRequest(id, roleName);
            set({
                users: get().users.map((u) => (getUserId(u) === id ? { ...u, ...response } : u)),
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

    updateUserStatus: async (id, status) => {
        try {
            set({ loading: true, error: null });
            const response = await updateUserStatusRequest(id, status);
            set({
                users: get().users.map((u) => (getUserId(u) === id ? { ...u, ...response } : u)),
                loading: false,
            });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al actualizar estado';
            set({
                loading: false,
                error: message,
            });
            return { success: false, error: message };
        }
    },

    createUser: async (values) => {
        try {
            set({ loading: true, error: null });

            const roleName = values.roleName || 'USER_ROLE';
            const response = await createUserRequest(buildUserFormData(values));
            let user = response.data?.user || response.data?.User;
            const userId = getUserId(user);

            if (userId && roleName !== 'USER_ROLE') {
                try {
                    user = await updateUserRoleRequest(userId, roleName);
                } catch (roleError) {
                    const createdUser = {
                        ...user,
                        role: user.role || 'USER_ROLE',
                        pendingRoleName: roleName,
                    };

                    set({
                        users: [createdUser, ...get().users],
                        loading: false,
                        error:
                            roleError.response?.data?.message ||
                            roleError.message ||
                            'Usuario creado, pero no se pudo asignar el rol',
                    });

                    return {
                        success: false,
                        user: createdUser,
                        created: true,
                        rolePending: true,
                        pendingRoleName: roleName,
                        error:
                            roleError.response?.data?.message ||
                            roleError.message ||
                            'Usuario creado, pero no se pudo asignar el rol',
                    };
                }
            }

            const createdUser = user ? { ...user, role: user.role || roleName } : null;

            set({
                users: createdUser ? [createdUser, ...get().users] : get().users,
                loading: false,
            });

            return { success: true, user: createdUser };
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al crear usuario';
            set({
                loading: false,
                error: message,
            });
            return { success: false, error: message };
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
