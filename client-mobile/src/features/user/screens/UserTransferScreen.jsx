import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts, transferBetweenAccounts } from '../../../shared/api/bankClient';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const formatMoney = (amount, currency = 'GTQ') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
};

const UserTransferScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [fromAccountId, setFromAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferType, setTransferType] = useState('own'); // 'own' | 'other'

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await getUserAccounts();
      const loadedAccounts = (response.accounts || []).map((account) => ({
        id: account._id,
        accountNumber: account.numeroCuenta,
        tipoCuenta: account.tipoCuenta,
        divisa: account.divisa,
        saldo: Number(account.saldo || account.balance || 0),
      }));
      setAccounts(loadedAccounts);
      if (loadedAccounts.length > 0) {
        setFromAccountId(loadedAccounts[0].id);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((acc) => acc.id === fromAccountId);
  const availableBalance = selectedAccount?.saldo || 0;
  const transferAmount = parseFloat(amount) || 0;
  const hasSufficientBalance = transferAmount > 0 && transferAmount <= availableBalance;

  const handleTransfer = async () => {
    if (!hasSufficientBalance) {
      Alert.alert('Error', 'Saldo insuficiente para realizar la transferencia');
      return;
    }

    if (!destinationAccountId.trim()) {
      Alert.alert('Error', 'Ingresa el número de cuenta destino');
      return;
    }

    if (transferAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    setShowConfirm(true);
  };

  const confirmTransfer = async () => {
    setSubmitting(true);
    try {
      await transferBetweenAccounts({
        fromAccountId,
        toAccountId: destinationAccountId,
        amount: transferAmount,
        description: description || 'Transferencia móvil',
      });

      Alert.alert('Éxito', 'Transferencia realizada exitosamente');
      setShowConfirm(false);
      setAmount('');
      setDestinationAccountId('');
      setDescription('');
      await loadAccounts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error al realizar transferencia');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cuentas..." />;
  }

  if (showConfirm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Card padding="lg" style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="info" size={32} color={theme.colors.primary} />
              <Text style={styles.confirmTitle}>Confirmar transferencia</Text>
            </View>

            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Cuenta origen:</Text>
                <Text style={styles.confirmValue}>{selectedAccount?.accountNumber}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Cuenta destino:</Text>
                <Text style={styles.confirmValue}>{destinationAccountId}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Monto:</Text>
                <Text style={[styles.confirmValue, styles.confirmAmount]}>
                  {formatMoney(transferAmount, selectedAccount?.divisa)}
                </Text>
              </View>
              {description && (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Descripción:</Text>
                  <Text style={styles.confirmValue}>{description}</Text>
                </View>
              )}
            </View>

            <View style={styles.confirmActions}>
              <Button
                title="Cancelar"
                onPress={() => setShowConfirm(false)}
                variant="secondary"
                style={styles.confirmButton}
              />
              <Button
                title="Confirmar"
                onPress={confirmTransfer}
                loading={submitting}
                variant="primary"
                style={styles.confirmButton}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transferir</Text>
        <Text style={styles.subtitle}>Realiza transferencias entre cuentas</Text>

        <Card padding="lg" style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <MaterialIcons name="account-balance-wallet" size={24} color={theme.colors.primary} />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <Text style={styles.balanceAmount}>
                {formatMoney(availableBalance, selectedAccount?.divisa || 'GTQ')}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de transferencia</Text>
          <View style={styles.typeButtons}>
            <Button
              title="Cuentas propias"
              onPress={() => setTransferType('own')}
              variant={transferType === 'own' ? 'primary' : 'secondary'}
              style={styles.typeButton}
            />
            <Button
              title="A terceros"
              onPress={() => setTransferType('other')}
              variant={transferType === 'other' ? 'primary' : 'secondary'}
              style={styles.typeButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta de origen</Text>
          {accounts.map((account) => (
            <Card
              key={account.id}
              padding="md"
              style={[
                styles.accountOption,
                fromAccountId === account.id && styles.accountOptionSelected,
              ]}
              onPress={() => setFromAccountId(account.id)}
            >
              <View style={styles.accountOptionRow}>
                <MaterialIcons
                  name="account-balance"
                  size={20}
                  color={fromAccountId === account.id ? theme.colors.primary : theme.colors.textSecondary}
                />
                <View style={styles.accountOptionInfo}>
                  <Text style={styles.accountOptionType}>{account.tipoCuenta}</Text>
                  <Text style={styles.accountOptionNumber}>{account.accountNumber}</Text>
                </View>
                <Text style={styles.accountOptionBalance}>
                  {formatMoney(account.saldo, account.divisa)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de la transferencia</Text>
          
          <Input
            label="Cuenta destino"
            placeholder="Número de cuenta"
            value={destinationAccountId}
            onChangeText={setDestinationAccountId}
            leftIcon="account-balance"
            keyboardType="numeric"
          />

          <Input
            label="Monto"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            leftIcon="attach-money"
            keyboardType="decimal-pad"
          />

          <Input
            label="Descripción (opcional)"
            placeholder="Referencia o concepto"
            value={description}
            onChangeText={setDescription}
            leftIcon="description"
          />

          {!hasSufficientBalance && amount && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>Saldo insuficiente</Text>
            </View>
          )}
        </View>

        <Button
          title="Continuar"
          onPress={handleTransfer}
          disabled={!hasSufficientBalance || !destinationAccountId || !amount}
          style={styles.submitButton}
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
  balanceCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  balanceInfo: {
    flex: 1,
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
  },
  accountOption: {
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  accountOptionSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  accountOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountOptionInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  accountOptionType: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  accountOptionNumber: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  accountOptionBalance: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  confirmCard: {
    marginTop: theme.spacing.xl,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  confirmTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  confirmDetails: {
    marginBottom: theme.spacing.lg,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  confirmLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  confirmValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  confirmAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  confirmButton: {
    flex: 1,
  },
});

export default UserTransferScreen;
