import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore';
import Input from '../../../shared/components/common/Input';
import Button from '../../../shared/components/common/Button';
import theme from '../../../shared/constants/theme';

const DEMO_USERS = {
  EMPLOYEE_ROLE: {
    id: 'demo-emp-001',
    name: 'Laura',
    surname: 'Martínez',
    username: 'lmartinez',
    email: 'laura@novabank.dev',
    role: 'EMPLOYEE_ROLE',
  },
  ADMIN_ROLE: {
    id: 'demo-admin-001',
    name: 'Carlos',
    surname: 'Herrera',
    username: 'cherrera',
    email: 'carlos@novabank.dev',
    role: 'ADMIN_ROLE',
  },
  USER_ROLE: {
    id: 'demo-user-001',
    name: 'Ana',
    surname: 'López',
    username: 'alopez',
    email: 'ana@novabank.dev',
    role: 'USER_ROLE',
  },
};

const LoginScreen = ({ navigation }) => {
  const { login, loading, error } = useAuthStore();
  const [demoMode, setDemoMode] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      // Navigation will be handled by AppNavigator based on auth state
    } else {
      Alert.alert('Error', result.error || 'Error al iniciar sesión');
    }
  };

  const handleForgotPassword = () => {
    // Implement in next phase
    Alert.alert('Próxima fase', 'Recuperación de contraseña se implementará en la siguiente fase');
  };

  const handleRegister = () => {
    // Implement in next phase
    Alert.alert('Próxima fase', 'Registro se implementará en la siguiente fase');
  };

  const enterDemo = (role) => {
    const user = DEMO_USERS[role];
    useAuthStore.setState({
      user,
      token: `demo-token-${role}`,
      isAuthenticated: true,
      isLoadingAuth: false,
      role,
    });
    Alert.alert('Demo', `Entrando como ${user.name} (${role.replace('_ROLE', '')})`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Sistema Bancario</Text>
            <Text style={styles.subtitle}>Iniciar sesión</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email o Username"
              placeholder="correo@example.com o username"
              control={control}
              name="emailOrUsername"
              rules={{ required: 'Este campo es requerido' }}
              error={errors.emailOrUsername?.message}
              leftIcon="email"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              control={control}
              name="password"
              rules={{ required: 'Este campo es requerido' }}
              error={errors.password?.message}
              secureTextEntry
              leftIcon="lock"
            />

            <Text style={styles.forgotPassword}>
              <Text onPress={handleForgotPassword} style={styles.link}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              size="large"
            />

            {/* Demo access */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>— Acceso demo (sin backend) —</Text>
              <View style={styles.demoButtons}>
                <Button
                  title="Empleado"
                  onPress={() => enterDemo('EMPLOYEE_ROLE')}
                  variant="secondary"
                  size="small"
                />
                <Button
                  title="Admin"
                  onPress={() => enterDemo('ADMIN_ROLE')}
                  variant="primary"
                  size="small"
                />
                <Button
                  title="Cliente"
                  onPress={() => enterDemo('USER_ROLE')}
                  variant="ghost"
                  size="small"
                />
              </View>
            </View>

            <Text style={styles.registerText}>
              <Text onPress={handleRegister} style={styles.link}>
                ¿No tienes cuenta? Inicializa una
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  forgotPassword: {
    textAlign: 'right',
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  link: {
    color: theme.colors.primary,
  },
  demoSection: {
    marginTop: theme.spacing.xl,
  },
  demoTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  registerText: {
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.lg,
  },
});

export default LoginScreen;
