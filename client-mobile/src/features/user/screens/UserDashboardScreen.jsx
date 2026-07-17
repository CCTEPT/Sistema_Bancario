import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts, getUserMovements } from '../../../shared/api/bankClient';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const screenWidth = Dimensions.get('window').width;

const UserDashboardScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buen día';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsResponse, movementsResponse] = await Promise.allSettled([
        getUserAccounts(),
        getUserMovements({ limit: 5 }),
      ]);

      const accountsData = accountsResponse.status === 'fulfilled' 
        ? (accountsResponse.value.accounts || []) 
        : [];
      
      const movementsData = movementsResponse.status === 'fulfilled'
        ? (movementsResponse.value.data || [])
        : [];

      setAccounts(accountsData);
      setRecentMovements(movementsData);

      const total = accountsData.reduce((sum, acc) => {
        return sum + Number(acc.saldo || acc.balance || 0);
      }, 0);
      setTotalBalance(total);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount, currency = 'GTQ') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-GT');
  };

  const renderMovementItem = (movement) => {
    const config = {
      DEPOSIT: { label: 'Depósito', icon: 'arrow-downward', color: theme.colors.success, prefix: '+' },
      WITHDRAW: { label: 'Retiro', icon: 'arrow-upward', color: theme.colors.danger, prefix: '-' },
      TRANSFER_OUT: { label: 'Transferencia enviada', icon: 'swap-horiz', color: theme.colors.danger, prefix: '-' },
      TRANSFER_IN: { label: 'Transferencia recibida', icon: 'swap-horiz', color: theme.colors.success, prefix: '+' },
      CHECK_CASH: { label: 'Cheque cobrado', icon: 'description', color: theme.colors.purple, prefix: '+' },
      CHECK_ISSUE: { label: 'Cheque emitido', icon: 'description', color: theme.colors.textMuted, prefix: '' },
    };

    const cfg = config[movement.movementType] || { label: movement.movementType, icon: 'receipt', color: theme.colors.textMuted, prefix: '' };

    return (
      <View style={styles.movementItem}>
        <View style={[styles.movementIcon, { backgroundColor: `${cfg.color}20` }]}>
          <MaterialIcons name={cfg.icon} size={16} color={cfg.color} />
        </View>
        <View style={styles.movementInfo}>
          <Text style={styles.movementType}>{cfg.label}</Text>
          <Text style={styles.movementDate}>{formatDate(movement.date || movement.createdAt)}</Text>
        </View>
        <Text style={[styles.movementAmount, { color: cfg.color }]}>
          {cfg.prefix}{formatMoney(movement.amount, movement.currency || 'GTQ')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando dashboard..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.userName}>
            {user?.name ? user.name.split(' ')[0] : user?.username || 'Cliente'}
          </Text>
          <Text style={styles.userSubtitle}>Bienvenido a tu banca móvil</Text>
        </View>

        <Card padding="lg" style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialIcons name="account-balance-wallet" size={28} color={theme.colors.primary} />
            <Text style={styles.balanceLabel}>Balance total</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatMoney(totalBalance, 'GTQ')}</Text>
          <View style={styles.accountsSummary}>
            <Text style={styles.accountsCount}>{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}</Text>
          </View>
        </Card>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="Transferir"
              onPress={() => navigation.navigate('UserTransfer')}
              leftIcon={<MaterialIcons name="swap-horiz" size={20} color={theme.colors.text} />}
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="Depositar"
              onPress={() => navigation.navigate('UserDeposit')}
              leftIcon={<MaterialIcons name="add-circle-outline" size={20} color={theme.colors.text} />}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Retirar"
              onPress={() => navigation.navigate('UserWithdraw')}
              leftIcon={<MaterialIcons name="remove-circle-outline" size={20} color={theme.colors.text} />}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </View>

        <Card padding="lg" style={styles.movementsCard}>
          <View style={styles.movementsHeader}>
            <Text style={styles.movementsTitle}>Últimos movimientos</Text>
            <Button
              title="Ver todos"
              onPress={() => navigation.navigate('UserTransactions')}
              variant="ghost"
              size="small"
            />
          </View>

          {recentMovements.length === 0 ? (
            <View style={styles.emptyMovements}>
              <MaterialIcons name="receipt-long" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Sin movimientos recientes</Text>
            </View>
          ) : (
            <View style={styles.movementsList}>
              {recentMovements.map((movement, index) => (
                <View key={index}>{renderMovementItem(movement)}</View>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Mis cuentas</Text>
          {accounts.length === 0 ? (
            <Card padding="md" style={styles.emptyAccounts}>
              <MaterialIcons name="account-balance" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No tienes cuentas activas</Text>
            </Card>
          ) : (
            accounts.slice(0, 3).map((account) => (
              <Card key={account._id} padding="md" style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <View style={styles.accountInfo}>
                    <MaterialIcons name="account-balance" size={20} color={theme.colors.primary} />
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountType}>{account.tipoCuenta || 'Cuenta'}</Text>
                      <Text style={styles.accountNumber}>{account.numeroCuenta || '—'}</Text>
                    </View>
                  </View>
                  <Text style={styles.accountBalance}>
                    {formatMoney(account.saldo || account.balance, account.divisa || 'GTQ')}
                  </Text>
                </View>
              </Card>
            ))
          )}
          {accounts.length > 0 && (
            <Button
              title="Ver todas las cuentas"
              onPress={() => navigation.navigate('UserAccounts')}
              variant="ghost"
              style={styles.viewAllButton}
            />
          )}
        </View>
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
  greeting: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  userSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  balanceCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  balanceAmount: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  accountsSummary: {
    marginTop: theme.spacing.sm,
  },
  accountsCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  quickActions: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionsGrid: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  movementsCard: {
    marginBottom: theme.spacing.lg,
  },
  movementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  movementsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  emptyMovements: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  movementsList: {
    gap: theme.spacing.sm,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
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
  },
  movementDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  movementAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  accountsSection: {
    marginBottom: theme.spacing.lg,
  },
  emptyAccounts: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  accountCard: {
    marginBottom: theme.spacing.sm,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountDetails: {
    marginLeft: theme.spacing.sm,
  },
  accountType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  accountNumber: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  accountBalance: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  viewAllButton: {
    marginTop: theme.spacing.sm,
  },
});

export default UserDashboardScreen;
