import { useAuthStore } from "../../../features/auth/store/authStore";

export const Accounts = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6 animate-fadeIn">
      {user.role === "ADMIN_ROLE" ? (
        <>
          <h1 className="text-2xl font-bold text-[#83fb7f]">Gestión de Cuentas (Admin)</h1>
          <p className="text-gray-400 mb-4">Aquí está el apartado de cuentas de admin</p>
          {/* Tabla de cuentas con acciones de crear/editar/eliminar */}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-[#83fb7f]">Mis Cuentas</h1>
          <p className="text-gray-400 mb-4">Aquí está el apartado de cuentas de clientes</p>
          {/* Tabla de cuentas solo lectura */}
        </>
      )}
    </div>
  );
};
