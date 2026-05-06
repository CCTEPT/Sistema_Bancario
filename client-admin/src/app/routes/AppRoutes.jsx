import { Routes, Route } from 'react-router-dom'
import { AuthPage } from '../../features/auth/pages/AuthPage'
import { DashboardPage } from '../layouts/DashboardPage.jsx'
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx'
import { ProtectedRoutes } from './ProtectedRoutes.jsx'
export const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<AuthPage />}/>
        <Route path='/unauthorized' element={<UnauthorizedPage />} />
        <Route
          path='/dashboard/*'
          element={
            <ProtectedRoutes>
              <DashboardPage />
            </ProtectedRoutes>
          }
        />
    </Routes>
  )
}
