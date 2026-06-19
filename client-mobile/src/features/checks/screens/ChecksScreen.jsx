import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getChecks, getUserAccounts, issueCheck, cashCheck } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const STATUS_CONFIG = {
  EMITIDO: { label: 'Emitido', color: theme.colors.success, bg: `${theme.colors.success}20` },
  COBRADO: { label: 'Cobrado', color: theme.colors.info, bg: `${theme.colors.info}20` },
  ANULADO: { label: 'Anulado', color: theme.colors.danger, bg: `${theme.colors.danger}20` },
  RECHAZADO: { label: 'Rechazado', color: theme.colors.danger, bg: `${theme.colors.danger}20` },
  PENDING: { label: 'Pendiente', color: theme.colors.warning, bg: `${theme.colors.warning}20` },
};

const ChecksScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('issue'); // 'issue' | 'cash' | 'history'
  
  const [issueAccountId, setIssueAccountId] = useState('');
  const [issueAmount, setIssueAmount] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);
  
  const [checkNumber, setCheckNumber] = useState('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [cashLoading, setCashLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [accountsResponse, checksResponse] = await Promise.all([
        getUserAccounts(),
        getChecks(),
      ]);

      const normalizedAccounts = (accountsResponse.accounts || []).map(account => ({
        id: account._id,
        currency: account.divisa,
        accountNumber: account.numeroCuenta,
        balance: account.saldo,
      }));

      setAccounts(normalizedAccounts);
      setChecks(checksResponse.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar cheques');
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
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString();
  };

  const handleIssue = async () => {
    const issueAccount = accounts.find(a => a.id === issueAccountId);
    const amountNum = parseFloat(issueAmount);

    if (!issueAccountId || Number.isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Selecciona una cuenta e ingresa un monto válido');
      return;
    }

    if (issueAccount && amountNum > issueAccount.balance) {
      Alert.alert('Error', 'Saldo insuficiente en la cuenta emisora');
      return;
    }

    setIssueLoading(true);
    try {
      await issueCheck({
        issuingAccountId: issueAccountId,
        amount: amountNum,
      });
      Alert.alert('Éxito', 'Cheque emitido exitosamente');
      setIssueAmount('');
      setIssueAccountId('');
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al emitir cheque');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleCash = async () => {
    const trimmedCheckNumber = checkNumber.trim();

    if (!trimmedCheckNumber || !cashAccountId) {
      Alert.alert('Error', 'Ingresa el número de cheque y selecciona una cuenta');
      return;
    }

    const ownCheckToCash = checks.find(
      check => check.checkNumber.toLowerCase() === trimmedCheckNumber.toLowerCase()
    );

    if (ownCheckToCash) {
      Alert.alert('Error', 'No puedes cobrar un cheque emitido por tus propias cuentas');
      return;
    }

    setCashLoading(true);
    try {
      await cashCheck({
        checkNumber: trimmedCheckNumber,
        receivingAccountId: cashAccountId,
      });
      Alert.alert('Éxito', 'Cheque cobrado exitosamente');
      setCheckNumber('');
      setCashAccountId('');
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al cobrar cheque');
    } finally {
      setCashLoading(false);
    }
  };

  const renderCheckCard = (item) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;

    return (
      <Card padding="md" style={styles.checkCard}>
        <View style={styles.checkHeader}>
          <View style={styles.checkInfo}>
            <MaterialIcons name="description" size={24} color={theme.colors.primary} />
            <View style={styles.checkDetails}>
              <Text style={styles.checkNumber}>{item.checkNumber || 'N/A'}</Text>
              <Text style={styles.checkMeta}>Cuenta: {item.issuingAccountId?.numeroCuenta || 'N/A'}</Text>
            </View>
          </View>
          <Badge
            variant={item.status === 'EMITIDO' ? 'success' : item.status === 'COBRADO' ? 'info' : item.status === 'PENDING' ? 'warning' : 'danger'}
            size="small"
          >
            {statusConfig.label}
          </Badge>
        </View>

        <View style={styles.checkBody}>
          <View style={styles.checkAmount}>
            <Text style={styles.amountLabel}>Monto</Text>
            <Text style={styles.amountValue}>{formatMoney(item.amount, item.currency)}</Text>
          </View>
          <Text style={styles.checkDate}>Fecha: {formatDate(item.date || item.createdAt)}</Text>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cheques..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cheques</Text>
        <Text style={styles.subtitle}>Emite y cobra cheques desde tus cuentas</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.tabs}>
          <Button
            title="Emitir"
            onPress={() => setTab('issue')}
            variant={tab === 'issue' ? 'primary' : 'secondary'}
            size="small"
          />
          <Button
            title="Cobrar"
            onPress={() => setTab('cash')}
            variant={tab === 'cash' ? 'primary' : 'secondary'}
            size="small"
          />
          <Button
            title="Historial"
            onPress={() => setTab('history')}
            variant={tab === 'history' ? 'primary' : 'secondary'}
            size="small"
          />
        </View>

        {tab === 'issue' && (
          <Card padding="lg">
            <Text style={styles.sectionTitle}>Emitir Cheque</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cuenta Emisora</Text>
              <View style={styles.accountSelector}>
                {accounts.map(account => (
                  <Button
                    key={account.id}
                    title={`${account.currency} - ${account.accountNumber}`}
                    onPress={() => setIssueAccountId(account.id)}
                    variant={issueAccountId === account.id ? 'primary' : 'secondary'}
                    size="small"
                    style={styles.accountButton}
                  />
                ))}
              </View>
            </View>

            <Input
              label="Monto"
              placeholder="0.00"
              value={issueAmount}
              onChangeText={setIssueAmount}
              keyboardType="numeric"
              leftIcon="attach-money"
            />

            {issueAccountId && (
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Saldo disponible:</Text>
                <Text style={styles.balanceValue}>
                  {formatMoney(accounts.find(a => a.id === issueAccountId)?.balance, 
                    accounts.find(a => a.id === issueAccountId)?.currency)}
                </Text>
              </View>
            )}

            <Button
              title="Emitir Cheque"
              onPress={handleIssue}
              loading={issueLoading}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          </Card>
        )}

        {tab === 'cash' && (
          <Card padding="lg">
            <Text style={styles.sectionTitle}>Cobrar Cheque</Text>
            
            <Input
              label="Número de Cheque"
              placeholder="Ingresa el número del cheque"
              value={checkNumber}
              onChangeText={setCheckNumber}
              leftIcon="description"
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cuenta Receptora</Text>
              <View style={styles.accountSelector}>
                {accounts.map(account => (
                  <Button
                    key={account.id}
                    title={`${account.currency} - ${account.accountNumber}`}
                    onPress={() => setCashAccountId(account.id)}
                    variant={cashAccountId === account.id ? 'primary' : 'secondary'}
                    size="small"
                    style={styles.accountButton}
                  />
                ))}
              </View>
            </View>

            <Button
              title="Cobrar Cheque"
              onPress={handleCash}
              loading={cashLoading}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          </Card>
        )}

        {tab === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>Historial de Cheques</Text>
            {checks.length === 0 ? (
              <Card padding="lg">
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="description" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>No hay cheques registrados</Text>
                </View>
              </Card>
            ) : (
              checks.map(renderCheckCard)
            )}
          </View>
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
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
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
  accountSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  accountButton: {
    flex: 1,
    minWidth: 120,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  balanceValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  actionButton: {
    marginTop: theme.spacing.md,
  },
  checkCard: {
    marginBottom: theme.spacing.md,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  checkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  checkNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  checkMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  checkBody: {
    gap: theme.spacing.sm,
  },
  checkAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  amountValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  checkDate: {
    fontSize: theme.fontSize.sm,
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

export default ChecksScreen;
