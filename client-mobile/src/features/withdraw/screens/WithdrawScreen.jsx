import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts, withdrawFromAccount } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const CHANNELS = ['APP', 'ATM', 'CASHIER'];

const WithdrawScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('APP');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await getUserAccounts();
      const loadedAccounts = (response.accounts || []).map((account) => ({
        id: account._id,
        currency: account.divisa,
        accountNumber: account.numeroCuenta,
        balance: account.saldo,
      }));
      setAccounts(loadedAccounts);
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar las cuentas');
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

  const selectedAccount = accounts.find((a) => String(a.id) === accountId);
  const numAmount = parseFloat(amount);
  const hasInsufficientFunds = selectedAccount && !Number.isNaN(numAmount) && numAmount > selectedAccount.balance;

  const handleSubmit = async () => {
    if (!accountId || !amount) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    if (Number.isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto mayor a 0');
      return;
    }

    if (hasInsufficientFunds) {
      Alert.alert('Error', 'No tienes saldo suficiente en esta cuenta');
      return;
    }

    setSubmitting(true);
    try {
      await withdrawFromAccount({
        accountId: selectedAccount.id,
        amount: numAmount,
        description,
        channel,
      });

      const newBalance = selectedAccount.balance - numAmount;
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === selectedAccount.id ? { ...account, balance: newBalance } : account
        )
      );

      setSuccess(true);
      setAmount('');
      setDescription('');
      Alert.alert('Éxito', `Retiro de ${formatMoney(numAmount, selectedAccount.currency)} exitoso`);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'No se pudo procesar el retiro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cuentas..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="arrow-upward" size={28} color={theme.colors.danger} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Retiro</Text>
            <Text style={styles.subtitle}>Retira fondos de una de tus cuentas activas</Text>
          </View>
        </View>

        <Card padding="lg" style={styles.card}>
          {success && (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
              <Text style={styles.successText}>Retiro exitoso</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cuenta</Text>
            <View style={styles.accountSelector}>
              {accounts.map((account) => (
                <Button
                  key={account.id}
                  title={`${account.currency} - ${account.accountNumber}`}
                  subtitle={formatMoney(account.balance, account.currency)}
                  onPress={() => setAccountId(String(account.id))}
                  variant={accountId === String(account.id) ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.accountButton}
                />
              ))}
            </View>
          </View>

          {selectedAccount && (
            <View style={[styles.accountInfo, hasInsufficientFunds && styles.accountInfoError]}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Saldo disponible</Text>
                <Text style={[styles.infoValue, hasInsufficientFunds && styles.infoValueError]}>
                  {formatMoney(selectedAccount.balance, selectedAccount.currency)}
                </Text>
              </View>
              {hasInsufficientFunds && (
                <View style={styles.warningBanner}>
                  <MaterialIcons name="warning" size={16} color={theme.colors.danger} />
                  <Text style={styles.warningText}>Saldo insuficiente</Text>
                </View>
              )}
            </View>
          )}

          <Input
            label="Monto"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            leftIcon="attach-money"
            error={hasInsufficientFunds ? 'Saldo insuficiente' : undefined}
            style={styles.input}
          />

          <Input
            label="Descripción (opcional)"
            placeholder="Descripción del retiro"
            value={description}
            onChangeText={setDescription}
            leftIcon="description"
            style={styles.input}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Canal</Text>
            <View style={styles.channelSelector}>
              {CHANNELS.map((ch) => (
                <Button
                  key={ch}
                  title={ch}
                  onPress={() => setChannel(ch)}
                  variant={channel === ch ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.channelButton}
                />
              ))}
            </View>
          </View>

          <Button
            title="Realizar Retiro"
            onPress={handleSubmit}
            loading={submitting}
            disabled={hasInsufficientFunds}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.success}20`,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30}`,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  successText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.success,
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
    gap: theme.spacing.sm,
  },
  accountButton: {
    flex: 1,
    minWidth: 140,
  },
  accountInfo: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  accountInfoError: {
    backgroundColor: `${theme.colors.danger}10`,
    borderColor: theme.colors.danger,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  infoValueError: {
    color: theme.colors.danger,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  channelSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  channelButton: {
    flex: 1,
    minWidth: 80,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});

export default WithdrawScreen;
