import { useAuthStore } from "../../features/auth/store/authStore";
import { Dashboard } from "../../shared/components/layout/Dashboard";
import { Outlet } from "react-router-dom";

export const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <Dashboard user={user} onLogout={logout}>
      <Outlet /> {/* Aquí se renderizan las rutas hijas */}
    </Dashboard>
  );
};
