import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoadingSpinner from '../shared/components/common/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import AdminDrawer from './AdminDrawer';
import UserDrawer from './UserDrawer';

const AppNavigator = () => {
  const { isAuthenticated, isAdmin, isEmployee, isUser, _hasHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setIsReady(true);
      return;
    }

    const hydrationTimeout = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(hydrationTimeout);
  }, [_hasHydrated]);

  if (!isReady) {
    return <LoadingSpinner fullScreen text="Cargando..." />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : isUser() ? (
        <UserDrawer />
      ) : !isAdmin() && !isEmployee() ? (
        <AuthStack />
      ) : (
        <AdminDrawer />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;