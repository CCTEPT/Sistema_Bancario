import { useAuthStore } from '../../features/auth/store/authStore.js'
export const DashboardContent = () => {
    const { user } = useAuthStore();
    if (user.role === "ADMIN_ROLE") {
    return (
      <div className="p-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-[#83fb7f]">Panel de Administración</h1>
        <p className="text-gray-400 mt-2">Bienvenido, aquí puedes gestionar usuarios, cuentas y operaciones.</p>
      </div>
    );
  }

  if (user.role === "USER_ROLE") {
    return (
      <div className="p-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-[#83fb7f]">Dashboard Usuario</h1>
        <p className="text-gray-400 mt-2">Bienvenido, aquí puedes consultar tus movimientos y datos personales.</p>
      </div>
    );
  }

  return null;
}
