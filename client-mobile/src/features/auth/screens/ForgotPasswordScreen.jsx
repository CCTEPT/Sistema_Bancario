import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../../shared/api/authClient';
import { getApiErrorMessage } from '../../../shared/utils/apiErrorMessage';
import Input from '../../../shared/components/common/Input';
import Button from '../../../shared/components/common/Button';
import theme from '../../../shared/constants/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const result = await forgotPassword({ email: data.email });

      const success = result?.success ?? result?.Success;
      const message = result?.message ?? result?.Message;

      if (success) {
        Alert.alert(
          'Correo enviado',
          'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', message || 'Error al enviar correo de recuperación');
      }
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al enviar correo de recuperación'));
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
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
            </Text>
          </View>

          <View style={styles.form}>
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

            <Button
              title={submitting ? 'Enviando...' : 'Enviar instrucciones'}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              size="large"
            />

            <View style={styles.backSection}>
              <Text
                onPress={() => navigation.navigate('Login')}
                style={styles.backLink}
              >
                ← Volver a iniciar sesión
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  backSection: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  backLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default ForgotPasswordScreen;
