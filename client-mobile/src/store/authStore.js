import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStoredToken } from '../shared/api/httpClient';
import { login as loginReq } from '../shared/api/authClient';
import { getProfile } from '../shared/api/authClient';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      role: null,
      refreshToken: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,
      _hasHydrated: false,

      // Actions
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },

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

        const role = user?.role;

        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token),
          user,
          role,
        });
      },

      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });

          const { data } = await loginReq({ emailOrUsername, password });

          const token = data?.token;
          const role = data?.userDetails?.role;

          if (!token) {
            throw new Error('El servicio de autenticación no devolvió un token válido');
          }

          await setStoredToken(token);

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

          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || err.message || 'Error al iniciar sesión';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        await setStoredToken(null);
        await AsyncStorage.clear();
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          role: null,
          isAuthenticated: false,
          isLoadingAuth: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      setAccessToken: async (token) => {
        await setStoredToken(token);
        set({ token });
      },

      isAdmin: () => {
        const { role } = get();
        return role === 'ADMIN_ROLE';
      },

      isEmployee: () => {
        const { role } = get();
        return role === 'EMPLOYEE_ROLE';
      },

      isUser: () => {
        const { role } = get();
        return role === 'USER_ROLE';
      },
    }),
    {
      name: 'auth-novabank',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.checkAuth();
      },
    }
  )
);

export default useAuthStore;
