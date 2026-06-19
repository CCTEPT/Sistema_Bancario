import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../../shared/components/common/Button';
import theme from '../../../shared/constants/theme';
import { useAuthStore } from '../../../store/authStore';

const UnauthorizedScreen = ({ navigation }) => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="block" size={80} color={theme.colors.danger} />
      <Text style={styles.title}>Acceso No Autorizado</Text>
      <Text style={styles.message}>
        No tienes permisos suficientes para acceder a esta aplicación.
      </Text>
      <Text style={styles.submessage}>
        Esta aplicación es solo para administradores.
      </Text>
      <Button
        title="Cerrar sesión"
        onPress={handleLogout}
        variant="danger"
        size="large"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  submessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
});

export default UnauthorizedScreen;
