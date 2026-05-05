import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from "./routes/AppRoutes"
import { useAuthStore } from '../features/auth/store/authStore'

export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() =>{
    checkAuth();
  }), [checkAuth]
  return (
    <>
    <Toaster
      position= "top-right"
      toastOptions={{
        style:{
          fontFamily: 'Inter sans-serif',
          fontWeight: '500',
          fontSize: '1rem',
          borderRadius: "8px"
        }
      }}
    />
    <AppRoutes />
    </>
  )
}
