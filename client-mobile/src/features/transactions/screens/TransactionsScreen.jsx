import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts, getUserMovements } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const TYPE_CONFIG = {
  DEPOSIT: {
    label: 'Depósito',
    filter: 'deposit',
    icon: 'arrow-downward',
    iconBg: `${theme.colors.success}20`,
    iconColor: theme.colors.success,
    amountColor: theme.colors.success,
    prefix: '+',
  },
  WITHDRAW: {
    label: 'Retiro',
    filter: 'withdrawal',
    icon: 'arrow-upward',
    iconBg: `${theme.colors.danger}20`,
    iconColor: theme.colors.danger,
    amountColor: theme.colors.danger,
    prefix: '-',
  },
  TRANSFER_OUT: {
    label: 'Transferencia enviada',
    filter: 'transfer',
    icon: 'swap-horiz',
    iconBg: `${theme.colors.info}20`,
    iconColor: theme.colors.info,
    amountColor: theme.colors.danger,
    prefix: '-',
  },
  TRANSFER_IN: {
    label: 'Transferencia recibida',
    filter: 'transfer',
    icon: 'swap-horiz',
    iconBg: `${theme.colors.info}20`,
    iconColor: theme.colors.info,
    amountColor: theme.colors.success,
    prefix: '+',
  },
  CHECK_CASH: {
    label: 'Cheque cobrado',
    filter: 'check',
    icon: 'description',
    iconBg: `${theme.colors.info}20`,
    iconColor: theme.colors.info,
    amountColor: theme.colors.success,
    prefix: '+',
  },
};

const TransactionsScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const accountById = new Map(accounts.map(account => [account._id, account]));

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const accountsResponse = await getUserAccounts();
      const loadedAccounts = accountsResponse.accounts || [];
      setAccounts(loadedAccounts);

      const historyResponse = await getUserMovements({ limit: 100 });
      const loadedTransactions = (historyResponse.data || [])
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      setTransactions(loadedTransactions);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleString();
  };

  const filteredTransactions = transactions.filter(tx => {
    const config = TYPE_CONFIG[tx.movementType];
    const matchesType = typeFilter === 'all' || config?.filter === typeFilter;
    const matchesAccount = accountFilter === 'all' || String(tx.accountId) === accountFilter;
    return matchesType && matchesAccount;
  });

  const renderTransactionCard = ({ item }) => {
    const config = TYPE_CONFIG[item.movementType] || TYPE_CONFIG.TRANSFER_OUT;
    const account = accountById.get(String(item.accountId));
    const currency = item.currency || account?.divisa || 'GTQ';

    return (
      <Card padding="md" style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
            <MaterialIcons name={config.icon} size={20} color={config.iconColor} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>{config.label}</Text>
            {item.description && (
              <Text style={styles.transactionDescription}>{item.description}</Text>
            )}
            <Text style={styles.transactionMeta}>
              {item.accountNumber || account?.numeroCuenta || 'Cuenta'} · {item.channel || 'APP'}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.date || item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.transactionFooter}>
          <Text style={[styles.transactionAmount, { color: config.amountColor }]}>
            {config.prefix}
            {formatMoney(item.amount, currency)}
          </Text>
          <Badge
            variant="default"
            size="small"
          >
            {item.status || 'CONFIRMED'}
          </Badge>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando movimientos..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Historial de Movimientos</Text>
        <Text style={styles.subtitle}>Revisa tu historial de movimientos en todas las cuentas</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.filters}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filtrar por cuenta:</Text>
            <View style={styles.filterButtons}>
              <Button
                title="Todas"
                onPress={() => setAccountFilter('all')}
                variant={accountFilter === 'all' ? 'primary' : 'secondary'}
                size="small"
              />
              {accounts.map(account => (
                <Button
                  key={account._id}
                  title={`${account.divisa}`}
                  onPress={() => setAccountFilter(account._id)}
                  variant={accountFilter === account._id ? 'primary' : 'secondary'}
                  size="small"
                />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filtrar por tipo:</Text>
            <View style={styles.filterButtons}>
              <Button
                title="Todos"
                onPress={() => setTypeFilter('all')}
                variant={typeFilter === 'all' ? 'primary' : 'secondary'}
                size="small"
              />
              <Button
                title="Depósitos"
                onPress={() => setTypeFilter('deposit')}
                variant={typeFilter === 'deposit' ? 'primary' : 'secondary'}
                size="small"
              />
              <Button
                title="Retiros"
                onPress={() => setTypeFilter('withdrawal')}
                variant={typeFilter === 'withdrawal' ? 'primary' : 'secondary'}
                size="small"
              />
              <Button
                title="Transferencias"
                onPress={() => setTypeFilter('transfer')}
                variant={typeFilter === 'transfer' ? 'primary' : 'secondary'}
                size="small"
              />
            </View>
          </View>
        </View>

        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionCard}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Card padding="lg">
              <View style={styles.emptyContainer}>
                <MaterialIcons name="receipt-long" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>
                  {transactions.length === 0
                    ? 'No hay movimientos registrados. Realiza un depósito, retiro o transferencia para ver historial.'
                    : 'No hay movimientos que coincidan con los filtros seleccionados.'}
                </Text>
              </View>
            </Card>
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
  filters: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  filterGroup: {
    marginBottom: theme.spacing.sm,
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
  transactionCard: {
    marginBottom: theme.spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  transactionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  transactionMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  transactionDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
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

export default TransactionsScreen;
