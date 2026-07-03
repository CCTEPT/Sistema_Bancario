import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore';
import { register } from '../../../shared/api/authClient';
import { getApiErrorMessage } from '../../../shared/utils/apiErrorMessage';
import Input from '../../../shared/components/common/Input';
import Button from '../../../shared/components/common/Button';
import theme from '../../../shared/constants/theme';

const RegisterScreen = ({ navigation }) => {
  const { loading, error, login } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const registerData = {
        name: data.name,
        surname: data.surname,
        email: data.email,
        username: data.username,
        password: data.password,
        phone: data.phone,
        role: 'USER_ROLE',
      };

      const result = await register(registerData);

      const success = result?.success ?? result?.Success;
      const message = result?.message ?? result?.Message;

      if (success) {
        Alert.alert(
          'Registro exitoso',
          'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', message || 'Error al registrar usuario');
      }
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al registrar usuario'));
    } finally {
      setSubmitting(false);
    }
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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para comenzar a usar NovaBank</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              control={control}
              name="name"
              rules={{ required: 'Este campo es requerido' }}
              error={errors.name?.message}
              leftIcon="person"
              autoCapitalize="words"
            />

            <Input
              label="Apellido"
              placeholder="Tu apellido"
              control={control}
              name="surname"
              rules={{ required: 'Este campo es requerido' }}
              error={errors.surname?.message}
              leftIcon="person"
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="correo@ejemplo.com"
              control={control}
              name="email"
              rules={{
                required: 'Este campo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              error={errors.email?.message}
              leftIcon="email"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Usuario"
              placeholder="Nombre de usuario"
              control={control}
              name="username"
              rules={{
                required: 'Este campo es requerido',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              }}
              error={errors.username?.message}
              leftIcon="account-circle"
              autoCapitalize="none"
            />

            <Input
              label="Teléfono"
              placeholder="+502 1234-5678"
              control={control}
              name="phone"
              rules={{
                required: 'Este campo es requerido',
                pattern: {
                  value: /^\+?[0-9\s-]{8,15}$/,
                  message: 'Teléfono inválido',
                },
              }}
              error={errors.phone?.message}
              leftIcon="phone"
              keyboardType="phone-pad"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              control={control}
              name="password"
              rules={{
                required: 'Este campo es requerido',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              }}
              error={errors.password?.message}
              secureTextEntry
              leftIcon="lock"
            />

            <Input
              label="Confirmar contraseña"
              placeholder="••••••••"
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Este campo es requerido',
                validate: (value) => value === password || 'Las contraseñas no coinciden',
              }}
              error={errors.confirmPassword?.message}
              secureTextEntry
              leftIcon="lock"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={submitting ? 'Registrando...' : 'Registrarse'}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              size="large"
            />

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <Text
                onPress={() => navigation.navigate('Login')}
                style={styles.loginLink}
              >
                Iniciar sesión
              </Text>
            </View>
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
    textAlign: 'center',
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
  loginSection: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  loginText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
});

export default RegisterScreen;
