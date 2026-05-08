import { useAuthStore } from "../../features/auth/store/authStore"
import { Dashboard } from "../../shared/components/layout/Dashboard"

const DashboardContent = ({ user }) => {
  if (user.role === 'ADMIN_ROLE') {
    return (
      <>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p>Gestión de usuarios, cuentas y operaciones</p>
      </>
    )
  }

  if (user.role === 'USER_ROLE') {
    return (
      <>
        <h1 className="text-2xl font-bold">Dashboard Usuario</h1>
        <p>Consulta tus movimientos y datos personales</p>
        {/* componentes user */}
      </>
    )
  }

  return null
}

export const DashboardPage = () => {
  const { user, logout } = useAuthStore()

  return (
    <Dashboard user={user} onLogout={logout}>
      <DashboardContent user={user} />
    </Dashboard>
  )
}