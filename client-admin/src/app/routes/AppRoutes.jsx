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
import { RegisterForm } from '../../features/auth/components/RegisterForm.jsx'
import { LoginForm } from '../../features/auth/components/LoginForm.jsx'
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx'
import { ForgotPassPage } from '../../features/auth/pages/ForgotPassPage.jsx'
import { ForgotPass } from '../../features/auth/components/ForgotPass.jsx'

export const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<AuthPage />}/>
        <Route path='/login' element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path='/unauthorized' element={<UnauthorizedPage />} />
        <Route path='/verify-email' element={<VerifyEmailPage />} />
        
        <Route path='/forgot-password' element={<ForgotPass />} />
        <Route path='/reset-password' element={<ForgotPassPage />} />

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
