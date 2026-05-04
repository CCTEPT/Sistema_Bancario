import { Routes, Route } from 'react-router-dom'
import { AuthPage } from '../../features/auth/pages/AuthPage'

export const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<AuthPage />}/>
    </Routes>
  )
}
