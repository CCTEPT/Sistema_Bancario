import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from '../features/auth/store/authStore';
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
        position='top-right'
        toastOptions={{
          // Estilo base para todos
          style: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '0.95rem',
            borderRadius: '8px',
            padding: '12px 16px',
            background: '#141823', // fondo oscuro
            color: '#fff', // texto blanco
            border: '1px solid #83fb7f', // borde verde
          },
          // Estilos específicos por tipo
          success: {
            style: {
              background: '#0d1f35',
              border: '1px solid #68e865',
              color: '#68e865',
            },
            iconTheme: {
              primary: '#68e865',
              secondary: '#141823',
            },
          },
          error: {
            style: {
              background: '#2a0d0d',
              border: '1px solid #ff4d4f',
              color: '#ff4d4f',
            },
            iconTheme: {
              primary: '#ff4d4f',
              secondary: '#141823',
            },
          },
          loading: {
            style: {
              background: '#11151c',
              border: '1px solid #83fb7f',
              color: '#83fb7f',
            },
          },
        }}
      />

      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </>
  );
};
