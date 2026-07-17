import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setStoredToken, setUnauthorizedHandler } from "../shared/api/httpClient";
import { login as loginReq } from "../shared/api/authClient";
import { getProfile } from "../shared/api/authClient";

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

        // Si hay token, intentar refrescar perfil de forma NO-BLOQUEANTE
        if (token && user) {
          // Intentar cargar perfil en background sin bloquear
          getProfile()
            .then((profile) => {
              const profileData = profile?.data || profile;
              set((state) => ({
                user: {
                  ...state.user,
                  ...profileData,
                },
              }));
            })
            .catch((error) => {
              console.warn(
                "No se pudo refrescar el perfil en background:",
                error?.message,
              );
              // No destruir la sesión solo porque falló getProfile
              // El token sigue siendo válido
            });
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

          const data = await loginReq({ emailOrUsername, password });

          const token = data?.token;
          const role = data?.userDetails?.role;

          if (!token) {
            throw new Error(
              "El servicio de autenticación no devolvió un token válido",
            );
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

          // Cargar perfil completo de forma asíncrona sin bloquear el flujo
          getProfile()
            .then((profile) => {
              const profileData = profile?.data || profile;
              const fullUser = {
                ...data.userDetails,
                ...profileData,
              };
              set({
                user: fullUser,
                role: fullUser.role || role,
              });
            })
            .catch((error) => {
              console.warn(
                "No se pudo cargar el perfil completo:",
                error?.message,
              );
              // No es bloqueante - el usuario ya está autenticado
            });

          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.message ||
            err.message ||
            "Error al iniciar sesión";
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        await setStoredToken(null);
        await AsyncStorage.removeItem("auth-novabank");
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          role: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          error: null,
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
        return role === "ADMIN_ROLE";
      },

      isEmployee: () => {
        const { role } = get();
        return role === "EMPLOYEE_ROLE";
      },

      isUser: () => {
        const { role } = get();
        return role === "USER_ROLE";
      },
    }),
    {
      name: "auth-novabank",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehidratando authStore:", error);
        }

        if (!useAuthStore.getState()._hasHydrated) {
          useAuthStore.setState({ _hasHydrated: true });
        }

        const { token, checkAuth } = useAuthStore.getState();
        if (token && typeof checkAuth === "function") {
          checkAuth();
        }
      },
    },
  ),
);

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
