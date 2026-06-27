import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoadingSpinner from '../shared/components/common/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import AdminDrawer from './AdminDrawer';

const AppNavigator = () => {
  const { isAuthenticated, isAdmin, isEmployee, _hasHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setIsReady(true);
    }
  }, [_hasHydrated]);

  if (!isReady) {
    return <LoadingSpinner fullScreen text="Cargando..." />;
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  if (!isAdmin() && !isEmployee()) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AdminDrawer />
    </NavigationContainer>
  );
};

export default AppNavigator;