import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from "./routes/AppRoutes"
import { useAuthStore } from '../features/auth/store/authStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter sans-serif',
            fontWeight: '500',
            fontSize: '1rem',
            borderRadius: "8px"
          },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </>
  )
};
