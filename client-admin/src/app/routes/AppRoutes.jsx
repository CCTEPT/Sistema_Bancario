import { Routes, Route } from 'react-router-dom'
import { AuthPage } from '../../features/auth/pages/AuthPage'
import { DashboardPage } from '../layouts/DashboardPage.jsx'
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx'
import { UserPage} from '../../features/users/pages/UserPage.jsx'
import { ProtectedRoutes } from './ProtectedRoutes.jsx'
import { Accounts } from '../../features/account/components/Accounts.jsx'
import { Checks } from '../../features/check/components/Checks.jsx'
import { Movements } from '../../features/movement/components/Movements.jsx'
import { RoleGuard } from './RoleGuard.jsx'

export const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<AuthPage />}/>
        <Route path='/unauthorized' element={<UnauthorizedPage />} />
        {/*vista para usuarios */}
        <Route path= '/users'element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={["USER_ROLE"]}>
              <UserPage />
            </RoleGuard>
          </ProtectedRoutes>
        } />

        <Route
          path='/dashboard/*'
          element={
            <ProtectedRoutes>
              <RoleGuard allowedRoles={["ADMIN_ROLE"]}>
                <DashboardPage />
              </RoleGuard>
            </ProtectedRoutes>
          }
        >
          <Route path='accounts' element={<Accounts />} />
          <Route path='checks' element={<Checks />} />
          <Route path='movements' element={<Movements />} />
        </Route>
    </Routes>
  );
};
