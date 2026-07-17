import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Activa', color: theme.colors.success, bg: `${theme.colors.success}20`, variant: 'success' },
  INACTIVE: { label: 'Inactiva', color: theme.colors.danger, bg: `${theme.colors.danger}20`, variant: 'danger' },
  BLOCKED: { label: 'Bloqueada', color: theme.colors.warning, bg: `${theme.colors.warning}20`, variant: 'warning' },
  PENDING: { label: 'Pendiente', color: theme.colors.warning, bg: `${theme.colors.warning}20`, variant: 'warning' },
};

const normalizeAccount = (account) => ({
  ...account,
  accountNumber: account.numeroCuenta || account.accountNumber || account.number || '',
  tipoCuenta: account.tipoCuenta || account.accountType || 'cuenta',
  divisa: (account.divisa || account.currency || 'GTQ').toUpperCase(),
  saldo: Number(account.saldo ?? account.balance ?? 0),
  estado: (account.estado || account.status || 'ACTIVE').toUpperCase(),
  clabe: account.clabe || account.iban || '',
});

const formatMoney = (amount, currency = 'GTQ') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
};

const UserAccountsScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await getUserAccounts();
      const normalizedAccounts = (response.accounts || []).map(normalizeAccount);
      setAccounts(normalizedAccounts);
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copiado', `${label} copiado al portapapeles`);
    } catch (err) {
      Alert.alert('Error', 'No fue posible copiar al portapapeles');
    }
  };

  const renderAccountCard = ({ item }) => {
    const statusConfig = STATUS_CONFIG[item.estado] || STATUS_CONFIG.ACTIVE;

    return (
      <Card padding="md" style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <MaterialIcons name="account-balance" size={24} color={theme.colors.primary} />
            <View style={styles.accountDetails}>
              <Text style={styles.accountType}>{item.tipoCuenta}</Text>
              <Text style={styles.accountNumber}>{item.accountNumber}</Text>
            </View>
          </View>
          <Badge variant={statusConfig.variant} size="small">
            {statusConfig.label}
          </Badge>
        </View>

        <View style={styles.accountBalance}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>{formatMoney(item.saldo, item.divisa)}</Text>
        </View>

        {item.clabe && (
          <View style={styles.accountClabe}>
            <Text style={styles.clabeLabel}>CLABE/IBAN</Text>
            <View style={styles.clabeRow}>
              <Text style={styles.clabeValue} numberOfLines={1} ellipsizeMode="middle">
                {item.clabe}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(item.clabe, 'CLABE')}
                style={styles.copyButton}
              >
                <MaterialIcons name="content-copy" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.accountActions}>
          <Button
            title="Copiar número"
            onPress={() => copyToClipboard(item.accountNumber, 'Número de cuenta')}
            variant="secondary"
            size="small"
            leftIcon={<MaterialIcons name="content-copy" size={16} color={theme.colors.text} />}
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Mis Cuentas</Text>
        <Text style={styles.subtitle}>Gestiona todas tus cuentas bancarias</Text>

        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="account-balance" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No tienes cuentas activas</Text>
            <Text style={styles.emptySubtext}>Contacta al banco para abrir una cuenta</Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccountCard}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
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
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
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
  accountType: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  accountNumber: {
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
  accountClabe: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
  },
  clabeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  clabeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clabeValue: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  copyButton: {
    padding: theme.spacing.xs,
  },
  accountActions: {
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});

export default UserAccountsScreen;
