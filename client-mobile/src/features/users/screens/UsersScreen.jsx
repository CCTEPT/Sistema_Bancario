import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { getAllUsers, createUser, updateUserRole, updateUserStatus } from '../../../shared/api/authClient';
import { getApiErrorMessage } from '../../../shared/utils/apiErrorMessage';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const ROLES = ['USER_ROLE', 'EMPLOYEE_ROLE', 'ADMIN_ROLE'];
const CREATE_ROLES = ['USER_ROLE', 'EMPLOYEE_ROLE'];

const ROLE_STYLES = {
  ADMIN_ROLE: {
    label: 'Admin',
    bgColor: `${theme.colors.info}20`,
    textColor: theme.colors.info,
    borderColor: theme.colors.info,
  },
  EMPLOYEE_ROLE: {
    label: 'Empleado',
    bgColor: `${theme.colors.primary}20`,
    textColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  USER_ROLE: {
    label: 'Cliente',
    bgColor: `${theme.colors.purple}20`,
    textColor: theme.colors.purple,
    borderColor: theme.colors.purple,
  },
};

const UsersScreen = ({ navigation }) => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

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
      email: '',
      password: '',
      phone: '',
      roleName: 'USER_ROLE',
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      const normalizedUsers = (response.users || []).map(normalizeUser);
      setUsers(normalizedUsers);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const normalizeUser = (user) => ({
    ...user,
    displayName: `${user.name || ''} ${user.surname || ''}`.trim() || user.username || user.email,
    isActive: user.status === 'ACTIVE' || user.active !== false,
  });

  const filterUsers = () => {
    let filtered = users;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.surname && user.surname.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (data) => {
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('Name', data.name);
      formData.append('Surname', data.surname);
      formData.append('Username', data.username);
      formData.append('Email', data.email);
      formData.append('Password', data.password);
      formData.append('Phone', data.phone);
      formData.append('RoleName', data.roleName);

      await createUser(formData);
      Alert.alert('Éxito', 'Usuario creado exitosamente');
      setShowCreateModal(false);
      reset();
      await loadUsers();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al crear usuario'));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (userId === currentUser?._id || userId === currentUser?.id) {
      Alert.alert('Error', 'No puedes cambiar tu propio rol');
      return;
    }

    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
      Alert.alert('Éxito', 'Rol actualizado exitosamente');
      await loadUsers();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al actualizar rol'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (userId === currentUser?._id || userId === currentUser?.id) {
      Alert.alert('Error', 'No puedes cambiar tu propio estado');
      return;
    }

    const newStatus = currentStatus ? 'INACTIVE' : 'ACTIVE';
    setUpdatingUserId(userId);
    try {
      await updateUserStatus(userId, newStatus);
      Alert.alert('Éxito', `Usuario ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'} exitosamente`);
      await loadUsers();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al actualizar estado'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const renderUserCard = ({ item }) => {
    const roleStyle = ROLE_STYLES[item.role] || ROLE_STYLES.USER_ROLE;
    const isUpdating = updatingUserId === item._id || updatingUserId === item.id;

    return (
      <Card padding="md" style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <MaterialIcons name="person" size={24} color={theme.colors.primary} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.displayName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userUsername}>@{item.username}</Text>
            </View>
          </View>
          <Badge
            variant={item.role === 'ADMIN_ROLE' ? 'info' : item.role === 'EMPLOYEE_ROLE' ? 'primary' : 'purple'}
            size="small"
          >
            {roleStyle.label}
          </Badge>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="phone" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{item.phone || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name={item.isActive ? "check-circle" : "cancel"} size={16} color={item.isActive ? theme.colors.success : theme.colors.danger} />
            <Text style={[styles.metaText, item.isActive ? styles.activeText : styles.inactiveText]}>
              {item.isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {(currentUser.role === 'ADMIN_ROLE' || currentUser.role === 'EMPLOYEE_ROLE') && item._id !== currentUser?._id && item.id !== currentUser?.id && (
          <View style={styles.userActions}>
            <View style={styles.roleSelector}>
              <Text style={styles.actionLabel}>Cambiar rol:</Text>
              <View style={styles.roleButtons}>
                {ROLES.map((role) => (
                  <Button
                    key={role}
                    title={ROLE_STYLES[role].label}
                    onPress={() => handleUpdateRole(item._id || item.id, role)}
                    variant={item.role === role ? 'primary' : 'secondary'}
                    size="small"
                    disabled={isUpdating}
                    style={styles.roleButton}
                  />
                ))}
              </View>
            </View>
            
            <Button
              title={item.isActive ? 'Desactivar' : 'Activar'}
              onPress={() => handleToggleStatus(item._id || item.id, item.isActive)}
              variant={item.isActive ? 'danger' : 'primary'}
              size="small"
              disabled={isUpdating}
              style={styles.actionButton}
            />
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando usuarios..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Usuarios</Text>
          <Button
            title="Crear Usuario"
            onPress={() => setShowCreateModal(true)}
            leftIcon={<MaterialIcons name="person-add" size={20} color={theme.colors.text} />}
            style={styles.createButton}
          />
        </View>

        <Input
          placeholder="Buscar por nombre, username o email"
          value={searchText}
          onChangeText={setSearchText}
          leftIcon="search"
          style={styles.searchInput}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por rol:</Text>
          <View style={styles.filterButtons}>
            <Button
              title="Todos"
              onPress={() => setRoleFilter('all')}
              variant={roleFilter === 'all' ? 'primary' : 'secondary'}
              size="small"
            />
            {ROLES.map((role) => (
              <Button
                key={role}
                title={ROLE_STYLES[role].label}
                onPress={() => setRoleFilter(role)}
                variant={roleFilter === role ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {showCreateModal && (
          <Card padding="lg" style={styles.modal}>
            <Text style={styles.modalTitle}>Crear Nuevo Usuario</Text>
            
            <Input
              label="Nombre"
              placeholder="Nombre"
              control={control}
              name="name"
              rules={{ required: 'El nombre es requerido' }}
              error={errors.name?.message}
              leftIcon="person"
            />

            <Input
              label="Apellido"
              placeholder="Apellido"
              control={control}
              name="surname"
              rules={{ required: 'El apellido es requerido' }}
              error={errors.surname?.message}
              leftIcon="person"
            />

            <Input
              label="Username"
              placeholder="usuario"
              control={control}
              name="username"
              rules={{ required: 'El username es requerido' }}
              error={errors.username?.message}
              leftIcon="alternate-email"
              autoCapitalize="none"
            />

            <Input
              label="Email"
              placeholder="correo@example.com"
              control={control}
              name="email"
              rules={{
                required: 'El email es requerido',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido',
                },
              }}
              error={errors.email?.message}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              placeholder="********"
              control={control}
              name="password"
              rules={{
                required: 'La contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              }}
              error={errors.password?.message}
              leftIcon="lock"
              secureTextEntry
            />

            <Input
              label="Teléfono"
              placeholder="12345678"
              control={control}
              name="phone"
              rules={{
                required: 'El teléfono es requerido',
                pattern: { value: /^[0-9]{8}$/, message: 'Debe tener exactamente 8 dígitos' },
              }}
              error={errors.phone?.message}
              leftIcon="phone"
              keyboardType="numeric"
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.roleOptions}>
                {CREATE_ROLES.map((role) => (
                  <Button
                    key={role}
                    title={ROLE_STYLES[role].label}
                    onPress={() => reset({ ...control._formValues, roleName: role })}
                    variant={control._formValues.roleName === role ? 'primary' : 'secondary'}
                    size="small"
                    style={styles.roleOptionButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setShowCreateModal(false);
                  reset();
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Crear"
                onPress={handleSubmit(handleCreateUser)}
                loading={creating}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        )}

        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item._id || item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            </View>
          }
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  createButton: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  filterContainer: {
    marginBottom: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  userCard: {
    marginBottom: theme.spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  userUsername: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  userMeta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  activeText: {
    color: theme.colors.success,
  },
  inactiveText: {
    color: theme.colors.danger,
  },
  userActions: {
    gap: theme.spacing.md,
  },
  roleSelector: {
    marginBottom: theme.spacing.sm,
  },
  actionLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  roleButton: {
    flex: 1,
    minWidth: 70,
  },
  actionButton: {
    width: '100%',
  },
  modal: {
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  roleOptionButton: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.danger}20`,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
});

export default UsersScreen;
