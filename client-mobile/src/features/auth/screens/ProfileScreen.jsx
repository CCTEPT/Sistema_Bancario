import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { getUserProfile, updateProfile } from '../../../shared/api/authClient';
import Input from '../../../shared/components/common/Input';
import Button from '../../../shared/components/common/Button';
import Card from '../../../shared/components/common/Card';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, updateUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      phone: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res?.data) {
        reset({
          name: res.data.name ?? '',
          surname: res.data.surname ?? '',
          username: res.data.username ?? '',
          phone: res.data.phone ?? '',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('Surname', values.surname);
      formData.append('Username', values.username);
      formData.append('Phone', values.phone);

      const res = await updateProfile(formData);
      if (res?.status === 200) {
        Alert.alert('Éxito', '¡Perfil actualizado exitosamente!');
        updateUser(values);
        setEditing(false);
        await loadProfile();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // AppNavigator redirige automáticamente al AuthStack
          },
        },
      ]
    );
  };

  if (fetching) {
    return <LoadingSpinner fullScreen text="Cargando perfil..." />;
  }

  const avatarSource = user?.profilePicture;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card padding="lg">
          {!editing ? (
            <View style={styles.viewMode}>
              <View style={styles.avatarContainer}>
                {avatarSource ? (
                  <Image source={{ uri: avatarSource }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={48} color={theme.colors.textSecondary} />
                  </View>
                )}
              </View>

              <Text style={styles.name}>
                {user?.name} {user?.surname}
              </Text>
              <Text style={styles.username}>@{user?.username}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.role}>{user?.role}</Text>

              <View style={styles.actions}>
                <Button
                  title="Editar perfil"
                  onPress={() => setEditing(true)}
                  leftIcon={<MaterialIcons name="edit" size={20} color={theme.colors.text} />}
                  style={styles.editButton}
                />
                <Button
                  title="Cerrar sesión"
                  onPress={handleLogout}
                  variant="danger"
                  leftIcon={<MaterialIcons name="logout" size={20} color={theme.colors.text} />}
                  style={styles.logoutButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.editMode}>
              <Text style={styles.editTitle}>Editar perfil</Text>

              <Input
                label="Nombre"
                placeholder="Nombre"
                control={control}
                name="name"
                rules={{
                  required: 'Este campo es requerido',
                  minLength: { value: 3, message: 'Debe contener al menos 3 caracteres' },
                  maxLength: { value: 25, message: 'Máximo 25 caracteres' },
                }}
                error={errors.name?.message}
                leftIcon="person"
              />

              <Input
                label="Apellido"
                placeholder="Apellido"
                control={control}
                name="surname"
                rules={{
                  required: 'Este campo es requerido',
                  minLength: { value: 3, message: 'Debe contener al menos 3 caracteres' },
                  maxLength: { value: 25, message: 'Máximo 25 caracteres' },
                }}
                error={errors.surname?.message}
                leftIcon="person"
              />

              <Input
                label="Username"
                placeholder="Nombre de Usuario"
                control={control}
                name="username"
                rules={{
                  required: 'Este campo es requerido',
                  minLength: { value: 3, message: 'Debe contener al menos 3 caracteres' },
                  maxLength: { value: 30, message: 'Máximo 30 caracteres' },
                }}
                error={errors.username?.message}
                leftIcon="alternate-email"
                autoCapitalize="none"
              />

              <Input
                label="Número de Teléfono"
                placeholder="12345678"
                control={control}
                name="phone"
                rules={{
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: 'Debe ser numérico y exactamente 8 dígitos',
                  },
                }}
                error={errors.phone?.message}
                leftIcon="phone"
                keyboardType="numeric"
              />

              <View style={styles.editActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  variant="secondary"
                  style={styles.cancelButton}
                />
                <Button
                  title="Guardar"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  style={styles.saveButton}
                />
              </View>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  viewMode: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  username: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  role: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xl,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  editButton: {
    width: '100%',
  },
  logoutButton: {
    width: '100%',
  },
  editMode: {
    width: '100%',
  },
  editTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default ProfileScreen;