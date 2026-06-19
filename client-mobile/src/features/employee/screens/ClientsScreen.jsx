import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getClients, getClientAccounts, getClientMovements } from '../../../shared/api/employeeClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const ClientsScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [modalTab, setModalTab] = useState('accounts'); // 'accounts' | 'movements'
  const [clientAccounts, setClientAccounts] = useState([]);
  const [clientMovements, setClientMovements] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchText]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await getClients();
      const list = Array.isArray(response?.clients) ? response.clients : Array.isArray(response) ? response : [];
      setClients(list);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchText) {
      setFilteredClients(clients);
      return;
    }

    const q = searchText.trim().toLowerCase();
    const filtered = clients.filter((c) => {
      const name = `${c.name || ''} ${c.surname || ''}`.toLowerCase();
      const username = (c.username || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return name.includes(q) || username.includes(q) || email.includes(q);
    });
    setFilteredClients(filtered);
  };

  const handleClientPress = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
    setModalTab('accounts');
    loadClientAccounts(client);
  };

  const loadClientAccounts = async (client) => {
    const clientId = client?.id || client?._id;
    if (!clientId) return;

    try {
      setLoadingAccounts(true);
      const response = await getClientAccounts(clientId);
      setClientAccounts(response.accounts || []);
    } catch (err) {
      setClientAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadClientMovements = async (accountId) => {
    if (!accountId) return;

    try {
      setLoadingMovements(true);
      const response = await getClientMovements(accountId, { limit: 30 });
      setClientMovements(response.movements || []);
    } catch (err) {
      setClientMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleAccountPress = (account) => {
    setSelectedAccount(account);
    setModalTab('movements');
    const accountId = account._id || account.idCuenta || account.id;
    loadClientMovements(accountId);
  };

  const formatMoney = (amount, currency = 'GTQ') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
  };

  const renderClientCard = ({ item }) => {
    const displayName = [item.name, item.surname].filter(Boolean).join(' ') || item.username || '—';

    return (
      <Card padding="md" style={styles.clientCard} onPress={() => handleClientPress(item)}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <MaterialIcons name="person" size={24} color={theme.colors.primary} />
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{displayName}</Text>
              <Text style={styles.clientUsername}>@{item.username}</Text>
              <Text style={styles.clientEmail}>{item.email || 'N/A'}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
        </View>
      </Card>
    );
  };

  const renderAccountCard = (account) => {
    const isSelected = selectedAccount && (selectedAccount._id || selectedAccount.idCuenta) === (account._id || account.idCuenta);

    return (
      <TouchableOpacity
        style={[styles.accountCard, isSelected && styles.accountCardSelected]}
        onPress={() => handleAccountPress(account)}
      >
        <Text style={styles.accountType}>{account.tipoCuenta || 'Cuenta'} · {account.divisa || 'GTQ'}</Text>
        <Text style={styles.accountNumber}>{account.numeroCuenta || '—'}</Text>
        <Text style={styles.accountBalance}>{formatMoney(account.saldo ?? account.balance ?? 0, account.divisa || 'GTQ')}</Text>
        <Badge variant={account.estado === 'ACTIVE' ? 'success' : 'danger'} size="small">
          {account.estado === 'ACTIVE' ? 'Activo' : 'Inactivo'}
        </Badge>
      </TouchableOpacity>
    );
  };

  const renderMovementItem = (movement) => {
    const config = {
      DEPOSIT: { label: 'Depósito', icon: 'arrow-downward', color: theme.colors.success },
      WITHDRAW: { label: 'Retiro', icon: 'arrow-upward', color: theme.colors.danger },
      TRANSFER_OUT: { label: 'Transferencia', icon: 'swap-horiz', color: theme.colors.info },
      TRANSFER_IN: { label: 'Transferencia', icon: 'swap-horiz', color: theme.colors.info },
      CHECK_CASH: { label: 'Cheque', icon: 'description', color: theme.colors.purple },
    };

    const cfg = config[movement.movementType] || config.TRANSFER_OUT;

    return (
      <View style={styles.movementItem}>
        <View style={[styles.movementIcon, { backgroundColor: `${cfg.color}20` }]}>
          <MaterialIcons name={cfg.icon} size={16} color={cfg.color} />
        </View>
        <View style={styles.movementInfo}>
          <Text style={styles.movementType}>{cfg.label}</Text>
          <Text style={styles.movementDate}>
            {movement.date || movement.createdAt ? new Date(movement.date || movement.createdAt).toLocaleString() : 'Sin fecha'}
          </Text>
        </View>
        <Text style={[styles.movementAmount, { color: cfg.color }]}>
          {formatMoney(movement.amount, movement.currency || 'GTQ')}
        </Text>
      </View>
    );
  };

  const totalBalance = clientAccounts.reduce((sum, a) => sum + Number(a.saldo || a.balance || 0), 0);

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando clientes..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>Gestiona los clientes del banco</Text>

        <Input
          placeholder="Buscar por nombre, username o email"
          value={searchText}
          onChangeText={setSearchText}
          leftIcon="search"
          style={styles.searchInput}
        />

        <FlatList
          data={filteredClients}
          renderItem={renderClientCard}
          keyExtractor={(item) => item.id || item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No se encontraron clientes</Text>
            </View>
          }
        />

        <Modal
          visible={showClientModal}
          animationType="slide"
          onRequestClose={() => {
            setShowClientModal(false);
            setSelectedClient(null);
            setClientAccounts([]);
            setClientMovements([]);
            setSelectedAccount(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowClientModal(false)}>
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <View style={styles.modalClientInfo}>
                <Text style={styles.modalClientName}>
                  {[selectedClient?.name, selectedClient?.surname].filter(Boolean).join(' ') || selectedClient?.username || '—'}
                </Text>
                <Text style={styles.modalClientUsername}>@{selectedClient?.username} · {selectedClient?.email}</Text>
              </View>
            </View>

            <View style={styles.balanceHeader}>
              <MaterialIcons name="account-balance-wallet" size={20} color={theme.colors.primary} />
              <View>
                <Text style={styles.balanceLabel}>Saldo total aproximado (GTQ)</Text>
                <Text style={styles.balanceValue}>{formatMoney(totalBalance, 'GTQ')}</Text>
              </View>
            </View>

            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={[styles.modalTab, modalTab === 'accounts' && styles.modalTabActive]}
                onPress={() => setModalTab('accounts')}
              >
                <MaterialIcons name="account-balance" size={20} color={modalTab === 'accounts' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.modalTabText, modalTab === 'accounts' && styles.modalTabTextActive]}>Cuentas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTab, modalTab === 'movements' && styles.modalTabActive]}
                onPress={() => setModalTab('movements')}
              >
                <MaterialIcons name="history" size={20} color={modalTab === 'movements' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.modalTabText, modalTab === 'movements' && styles.modalTabTextActive]}>Transacciones</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {modalTab === 'accounts' && (
                loadingAccounts ? (
                  <LoadingSpinner text="Cargando cuentas..." />
                ) : clientAccounts.length === 0 ? (
                  <View style={styles.emptyModal}>
                    <MaterialIcons name="account-balance" size={32} color={theme.colors.textMuted} />
                    <Text style={styles.emptyModalText}>Este cliente no tiene cuentas</Text>
                  </View>
                ) : (
                  clientAccounts.map(renderAccountCard)
                )
              )}

              {modalTab === 'movements' && (
                loadingMovements ? (
                  <LoadingSpinner text="Cargando movimientos..." />
                ) : !selectedAccount ? (
                  <View style={styles.emptyModal}>
                    <MaterialIcons name="history" size={32} color={theme.colors.textMuted} />
                    <Text style={styles.emptyModalText}>Selecciona una cuenta para ver movimientos</Text>
                  </View>
                ) : clientMovements.length === 0 ? (
                  <View style={styles.emptyModal}>
                    <MaterialIcons name="history" size={32} color={theme.colors.textMuted} />
                    <Text style={styles.emptyModalText}>Sin movimientos</Text>
                  </View>
                ) : (
                  clientMovements.map((movement, i) => (
                    <View key={i}>{renderMovementItem(movement)}</View>
                  ))
                )
              )}
            </ScrollView>
          </View>
        </Modal>
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
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    marginBottom: theme.spacing.lg,
  },
  clientCard: {
    marginBottom: theme.spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  clientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clientUsername: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  clientEmail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
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
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalClientInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  modalClientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalClientUsername: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  balanceValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  modalTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  modalTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  modalTabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  modalTabTextActive: {
    color: theme.colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  accountCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  accountCardSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  accountType: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  accountNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  accountBalance: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  movementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  movementInfo: {
    flex: 1,
  },
  movementType: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  movementDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  movementAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  emptyModal: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyModalText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});

export default ClientsScreen;
