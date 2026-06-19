import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts, getAllAccounts, createBankAccount, updateAccountStatus, getAccountRequests, approveAccountRequest, rejectAccountRequest } from '../../../shared/api/bankClient';
import { getCurrencies } from '../../../shared/api/financialClient';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const ACCOUNT_TYPES = [
  { value: 'ahorro', label: 'Ahorro' },
  { value: 'corriente', label: 'Corriente' },
];

const STATUS_COLORS = {
  ACTIVE: { color: theme.colors.success, bg: `${theme.colors.success}20` },
  INACTIVE: { color: theme.colors.danger, bg: `${theme.colors.danger}20` },
  PENDING: { color: theme.colors.warning, bg: `${theme.colors.warning}20` },
};

const AccountsScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState('ahorro');
  const [selectedCurrency, setSelectedCurrency] = useState('GTQ');
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState('my'); // 'my' | 'manage' | 'requests'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [accountsResponse, currenciesResponse] = await Promise.all([
        isAdmin ? getAllAccounts() : getUserAccounts(),
        getCurrencies(),
      ]);

      const normalizedAccounts = (accountsResponse.accounts || accountsResponse || []).map(normalizeAccount);
      setAccounts(normalizedAccounts);

      const normalizedCurrencies = (currenciesResponse || []).map(c => ({
        code: c.code || c,
        name: c.name || c,
      }));
      setCurrencies(normalizedCurrencies.length > 0 ? normalizedCurrencies : [
        { code: 'GTQ', name: 'Quetzal guatemalteco' },
        { code: 'USD', name: 'Dolar estadounidense' },
        { code: 'EUR', name: 'Euro' },
      ]);

      if (isAdmin) {
        try {
          const requestsResponse = await getAccountRequests();
          setAccountRequests(requestsResponse.data || requestsResponse || []);
        } catch (err) {
          console.error('Error loading account requests:', err);
        }
      }
    } catch (err) {
      setError(err.message || 'Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  };

  const normalizeAccount = (account) => ({
    ...account,
    accountNumber: account.numeroCuenta || account.accountNumber || account.number || '',
    tipoCuenta: account.tipoCuenta || account.accountType || 'cuenta',
    divisa: (account.divisa || account.currency || 'GTQ').toUpperCase(),
    saldo: Number(account.saldo ?? account.balance ?? 0),
    estado: account.estado || account.status || 'ACTIVE',
    ownerName: account.ownerName || account.nombrePropietario || 'Propietario',
  });

  const formatMoney = (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      await createBankAccount({
        tipoCuenta: selectedAccountType,
        divisa: selectedCurrency,
      });
      Alert.alert('Éxito', 'Cuenta creada exitosamente');
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al crear cuenta');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (accountId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateAccountStatus(accountId, newStatus);
      Alert.alert('Éxito', `Cuenta ${newStatus === 'ACTIVE' ? 'activada' : 'desactivada'} exitosamente`);
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al actualizar estado');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await approveAccountRequest(requestId);
      Alert.alert('Éxito', 'Solicitud aprobada');
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al aprobar solicitud');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectAccountRequest(requestId, 'Solicitud rechazada');
      Alert.alert('Éxito', 'Solicitud rechazada');
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al rechazar solicitud');
    }
  };

  const renderAccountCard = ({ item }) => {
    const statusConfig = STATUS_COLORS[item.estado] || STATUS_COLORS.ACTIVE;

    return (
      <Card padding="md" style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <MaterialIcons name="account-balance" size={24} color={theme.colors.primary} />
            <View style={styles.accountDetails}>
              <Text style={styles.accountNumber}>{item.accountNumber}</Text>
              <Text style={styles.accountType}>{item.tipoCuenta} - {item.divisa}</Text>
            </View>
          </View>
          <Badge variant={item.estado === 'ACTIVE' ? 'success' : 'danger'} size="small">
            {item.estado === 'ACTIVE' ? 'Activo' : 'Inactivo'}
          </Badge>
        </View>
        
        <View style={styles.accountBalance}>
          <Text style={styles.balanceLabel}>Saldo</Text>
          <Text style={styles.balanceAmount}>{formatMoney(item.saldo, item.divisa)}</Text>
        </View>

        {isAdmin && item.ownerName && (
          <Text style={styles.ownerName}>Propietario: {item.ownerName}</Text>
        )}

        {isAdmin && (
          <View style={styles.accountActions}>
            <Button
              title={item.estado === 'ACTIVE' ? 'Desactivar' : 'Activar'}
              onPress={() => handleToggleStatus(item._id, item.estado)}
              variant={item.estado === 'ACTIVE' ? 'danger' : 'primary'}
              size="small"
            />
          </View>
        )}
      </Card>
    );
  };

  const renderRequestCard = ({ item }) => {
    return (
      <Card padding="md" style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <MaterialIcons name="pending-actions" size={24} color={theme.colors.warning} />
            <View style={styles.accountDetails}>
              <Text style={styles.accountNumber}>Solicitud #{item.idSolicitud || item.id}</Text>
              <Text style={styles.accountType}>{item.tipoCuenta} - {item.divisa}</Text>
            </View>
          </View>
          <Badge variant="warning" size="small">Pendiente</Badge>
        </View>

        {item.usuario && (
          <Text style={styles.ownerName}>Solicitante: {item.usuario?.name || item.usuario?.username}</Text>
        )}

        <View style={styles.requestActions}>
          <Button
            title="Aprobar"
            onPress={() => handleApproveRequest(item.idSolicitud || item._id)}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="Rechazar"
            onPress={() => handleRejectRequest(item.idSolicitud || item._id)}
            variant="danger"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cuentas..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuentas</Text>
          {isAdmin && (
            <View style={styles.tabs}>
              <Button
                title="Mis Cuentas"
                onPress={() => setTab('my')}
                variant={tab === 'my' ? 'primary' : 'ghost'}
                size="small"
              />
              <Button
                title="Gestionar"
                onPress={() => setTab('manage')}
                variant={tab === 'manage' ? 'primary' : 'ghost'}
                size="small"
              />
              {accountRequests.length > 0 && (
                <Button
                  title="Solicitudes"
                  onPress={() => setTab('requests')}
                  variant={tab === 'requests' ? 'primary' : 'ghost'}
                  size="small"
                />
              )}
            </View>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Button
          title="Nueva Cuenta"
          onPress={() => setShowCreateModal(true)}
          leftIcon={<MaterialIcons name="add" size={20} color={theme.colors.text} />}
          style={styles.createButton}
        />

        {showCreateModal && (
          <Card padding="lg" style={styles.modal}>
            <Text style={styles.modalTitle}>Crear Nueva Cuenta</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Cuenta</Text>
              <View style={styles.optionsContainer}>
                {ACCOUNT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    title={type.label}
                    onPress={() => setSelectedAccountType(type.value)}
                    variant={selectedAccountType === type.value ? 'primary' : 'secondary'}
                    size="small"
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Divisa</Text>
              <View style={styles.optionsContainer}>
                {currencies.map((currency) => (
                  <Button
                    key={currency.code}
                    title={currency.code}
                    onPress={() => setSelectedCurrency(currency.code)}
                    variant={selectedCurrency === currency.code ? 'primary' : 'secondary'}
                    size="small"
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setShowCreateModal(false);
                  setSelectedAccountType('ahorro');
                  setSelectedCurrency('GTQ');
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Crear"
                onPress={handleCreateAccount}
                loading={creating}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        )}

        {tab === 'requests' && accountRequests.length > 0 ? (
          <FlatList
            data={accountRequests}
            renderItem={renderRequestCard}
            keyExtractor={(item) => item.idSolicitud || item._id}
            scrollEnabled={false}
          />
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccountCard}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        )}
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
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  createButton: {
    marginBottom: theme.spacing.lg,
  },
  accountCard: {
    marginBottom: theme.spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountDetails: {
    marginLeft: theme.spacing.md,
  },
  accountNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  accountType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  accountBalance: {
    marginBottom: theme.spacing.md,
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  balanceAmount: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  ownerName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  accountActions: {
    marginTop: theme.spacing.sm,
  },
  requestActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
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
});

export default AccountsScreen;
