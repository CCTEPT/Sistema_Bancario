import { Routes, Route } from 'react-router-dom'
import { AuthPage } from '../../features/auth/pages/AuthPage'
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx'
import { ProtectedRoutes } from './ProtectedRoutes.jsx'
import { Accounts } from '../../features/account/components/Accounts.jsx'
import { RoleGuard } from './RoleGuard.jsx'
import { RegisterForm } from '../../features/auth/components/RegisterForm.jsx'
import { LoginForm } from '../../features/auth/components/LoginForm.jsx'
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx'
import { ForgotPassPage } from '../../features/auth/pages/ForgotPassPage.jsx'
import { ForgotPass } from '../../features/auth/components/ForgotPass.jsx'
import { UserPage } from '../../features/users/pages/UserPage.jsx'
import { MainLayout } from '@/app/layouts/MainLayout.jsx'
import DashboardPage from '@/features/dashboard/pages/DashboardPage.jsx'
import DepositPage from '@/features/deposit/pages/DepositPage.jsx'
import WithdrawPage from '@/features/withdraw/pages/WithdrawPage.jsx'
import TransferPage from '@/features/transfer/pages/TransferPage.jsx'
import ConvertPage from '@/features/convert/pages/ConvertPage.jsx'
import TransactionPage from '@/features/transactions/pages/TransactionPage.jsx'
import CheckPage from '@/features/check/pages/CheckPage'


export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<AuthPage />} />
      <Route path='/login' element={<AuthPage><LoginForm /></AuthPage>} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />

      <Route path='/forgot-password' element={<ForgotPass />} />
      <Route path='/reset-password' element={<ForgotPassPage />} />

      <Route
        path='/dashboard/*'
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={["ADMIN_ROLE", "USER_ROLE", "EMPLOYEE_ROLE"]}>
              <MainLayout>
                {/* Aquí definimos qué contenido cambia según la URL */}
                <Routes>
                  <Route index element={<DashboardPage />} />
                  <Route path='accounts' element={<Accounts />} />
                  <Route path='checks' element={<CheckPage />} />  
                  <Route path='transactions' element={<TransactionPage />} />
                  <Route path='users' element={<UserPage />} />
                  <Route path='deposit' element={<DepositPage />} />
                  <Route path='withdraw' element={<WithdrawPage />} />
                  <Route path='transfer' element={<TransferPage />} />
                  <Route path='convert' element={<ConvertPage />} />
                </Routes>
              </MainLayout>
            </RoleGuard>
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
};
