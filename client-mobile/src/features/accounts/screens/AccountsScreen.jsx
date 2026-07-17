import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  Alert, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getAllAccounts,
  updateAccountStatus,
  getAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
} from '../../../shared/api/bankClient';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const STATUS_CONFIG = {
  ACTIVE:   { label: 'Activa',    color: theme.colors.success, bg: `${theme.colors.success}20`, variant: 'success' },
  INACTIVE: { label: 'Inactiva',  color: theme.colors.danger,  bg: `${theme.colors.danger}20`,  variant: 'danger' },
  BLOCKED:  { label: 'Bloqueada', color: theme.colors.warning, bg: `${theme.colors.warning}20`, variant: 'warning' },
  PENDING:  { label: 'Pendiente', color: theme.colors.warning, bg: `${theme.colors.warning}20`, variant: 'warning' },
};

const normalizeAccount = (account) => ({
  ...account,
  accountNumber: account.numeroCuenta || account.accountNumber || account.number || '',
  tipoCuenta:    account.tipoCuenta || account.accountType || 'cuenta',
  divisa:        (account.divisa || account.currency || 'GTQ').toUpperCase(),
  saldo:         Number(account.saldo ?? account.balance ?? 0),
  estado:        (account.estado || account.status || 'ACTIVE').toUpperCase(),
  ownerName:     account.ownerName || account.nombrePropietario || '',
});

const formatMoney = (amount, currency = 'GTQ') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
};

const AccountsScreen = () => {
  const { isAdmin, isEmployee } = useAuthStore();
  const canManage = isAdmin() || isEmployee();

  const [accounts, setAccounts] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('accounts'); // 'accounts' | 'requests'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const accountsResponse = await getAllAccounts();
      const raw = accountsResponse.accounts || accountsResponse || [];
      setAccounts(Array.isArray(raw) ? raw.map(normalizeAccount) : []);

      if (canManage) {
        try {
          const requestsResponse = await getAccountRequests();
          setAccountRequests(requestsResponse.requests || []);
        } catch {
          setAccountRequests([]);
        }
      }
    } catch (err) {
      setError(err.message || 'Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(q) ||
        (a._id || '').toLowerCase().includes(q) ||
        (a.ownerName || '').toLowerCase().includes(q)
    );
  }, [accounts, search]);

  const handleToggleStatus = async (accountId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateAccountStatus(accountId, newStatus);
      Alert.alert('Éxito', `Cuenta ${newStatus === 'ACTIVE' ? 'activada' : 'desactivada'}`);
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await approveAccountRequest(requestId);
      Alert.alert('Éxito', 'Solicitud aprobada');
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al aprobar solicitud');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectAccountRequest(requestId, 'Solicitud rechazada por el empleado');
      Alert.alert('Éxito', 'Solicitud rechazada');
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al rechazar solicitud');
    }
  };

  const renderAccountCard = ({ item }) => {
    const cfg = STATUS_CONFIG[item.estado] || STATUS_CONFIG.ACTIVE;

    return (
      <Card padding="md" style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <View style={[styles.accountIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <MaterialIcons name="account-balance" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountNumber}>{item.accountNumber || '—'}</Text>
              <Text style={styles.accountType}>{item.tipoCuenta} · {item.divisa}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Saldo</Text>
          <Text style={styles.balanceAmount}>{formatMoney(item.saldo, item.divisa)}</Text>
        </View>

        {item.ownerName ? (
          <Text style={styles.ownerName}>
            <MaterialIcons name="person" size={12} color={theme.colors.textMuted} /> {item.ownerName}
          </Text>
        ) : null}

        {canManage && (
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

  const renderRequestCard = ({ item }) => (
    <Card padding="md" style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.accountInfo}>
          <View style={[styles.accountIcon, { backgroundColor: `${theme.colors.warning}20` }]}>
            <MaterialIcons name="pending-actions" size={20} color={theme.colors.warning} />
          </View>
          <View style={styles.accountDetails}>
            <Text style={styles.accountNumber}>Solicitud #{item.idSolicitud || item.id}</Text>
            <Text style={styles.accountType}>{item.tipoCuenta} · {item.divisa}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG.PENDING.bg }]}>
          <Text style={[styles.statusText, { color: STATUS_CONFIG.PENDING.color }]}>Pendiente</Text>
        </View>
      </View>

      {item.usuario && (
        <Text style={styles.ownerName}>
          Solicitante: {item.usuario?.name || item.usuario?.username}
        </Text>
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cuentas..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cuentas</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ID, número de cuenta o titular..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <MaterialIcons
              name="close"
              size={18}
              color={theme.colors.textMuted}
              onPress={() => setSearch('')}
              style={styles.searchClear}
            />
          )}
        </View>

        {/* Tabs */}
        {canManage && accountRequests.length > 0 && (
          <View style={styles.tabs}>
            <Button
              title={`Cuentas (${filteredAccounts.length})`}
              onPress={() => setTab('accounts')}
              variant={tab === 'accounts' ? 'primary' : 'ghost'}
              size="small"
              style={styles.tabButton}
            />
            <Button
              title={`Solicitudes (${accountRequests.length})`}
              onPress={() => setTab('requests')}
              variant={tab === 'requests' ? 'primary' : 'ghost'}
              size="small"
              style={styles.tabButton}
            />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Reintentar" onPress={loadData} variant="ghost" size="small" />
          </View>
        )}

        {tab === 'requests' ? (
          <FlatList
            data={accountRequests}
            renderItem={renderRequestCard}
            keyExtractor={(item) => String(item.idSolicitud || item._id)}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="pending-actions" size={36} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Sin solicitudes pendientes</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={filteredAccounts}
            renderItem={renderAccountCard}
            keyExtractor={(item) => String(item._id || item.accountNumber)}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="account-balance" size={36} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>
                  {search ? 'Sin resultados para tu búsqueda' : 'No hay cuentas disponibles'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    height: 44,
  },
  searchIcon: { marginRight: theme.spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  searchClear: { marginLeft: theme.spacing.sm },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tabButton: { flex: 1 },
  accountCard: { marginBottom: theme.spacing.md },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  accountInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  accountDetails: { flex: 1 },
  accountNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  accountType: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold },
  balanceRow: { marginBottom: theme.spacing.sm },
  balanceLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  balanceAmount: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  ownerName: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
  accountActions: { marginTop: theme.spacing.sm },
  requestActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: { flex: 1 },
  errorContainer: {
    backgroundColor: `${theme.colors.danger}20`,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  errorText: { color: theme.colors.danger, fontSize: theme.fontSize.sm, textAlign: 'center' },
  empty: { alignItems: 'center', padding: theme.spacing.xxl },
  emptyText: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.md },
});

export default AccountsScreen;