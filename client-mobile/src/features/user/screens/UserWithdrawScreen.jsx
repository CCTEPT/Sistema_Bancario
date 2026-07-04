import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts } from '../../../shared/api/bankClient';
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

const UserWithdrawScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');

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
        setSelectedAccountId(loadedAccounts[0].id);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const availableBalance = selectedAccount?.saldo || 0;
  const withdrawAmount = parseFloat(amount) || 0;
  const hasSufficientBalance = withdrawAmount > 0 && withdrawAmount <= availableBalance;

  const generateQRCode = () => {
    if (!hasSufficientBalance) {
      Alert.alert('Error', 'Monto inválido o saldo insuficiente');
      return;
    }

    const code = `NOVA|WITHDRAW|${selectedAccount.accountNumber}|${withdrawAmount}|${Date.now()}`;
    setQrCode(code);
    setShowQR(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cuentas..." />;
  }

  if (showQR) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Card padding="lg" style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <MaterialIcons name="qr-code-2" size={48} color={theme.colors.primary} />
              <Text style={styles.qrTitle}>Código QR generado</Text>
            </View>

            <View style={styles.qrPlaceholder}>
              <MaterialIcons name="qr-code" size={120} color={theme.colors.text} />
            </View>

            <View style={styles.qrDetails}>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Cuenta:</Text>
                <Text style={styles.qrDetailValue}>{selectedAccount?.accountNumber}</Text>
              </View>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Monto:</Text>
                <Text style={[styles.qrDetailValue, styles.qrDetailAmount]}>
                  {formatMoney(withdrawAmount, selectedAccount?.divisa)}
                </Text>
              </View>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Válido por:</Text>
                <Text style={styles.qrDetailValue}>15 minutos</Text>
              </View>
            </View>

            <View style={styles.qrInstructions}>
              <Text style={styles.instructionsTitle}>Instrucciones:</Text>
              <Text style={styles.instructionsText}>
                1. Ve a cualquier cajero automático de NovaBank
              </Text>
              <Text style={styles.instructionsText}>
                2. Selecciona "Retiro sin tarjeta"
              </Text>
              <Text style={styles.instructionsText}>
                3. Escanea este código QR
              </Text>
              <Text style={styles.instructionsText}>
                4. Retira tu dinero
              </Text>
            </View>

            <View style={styles.qrActions}>
              <Button
                title="Generar nuevo código"
                onPress={() => {
                  setShowQR(false);
                  setAmount('');
                }}
                variant="secondary"
                style={styles.qrButton}
              />
              <Button
                title="Finalizar"
                onPress={() => {
                  setShowQR(false);
                  setAmount('');
                }}
                variant="primary"
                style={styles.qrButton}
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
        <Text style={styles.title}>Retirar</Text>
        <Text style={styles.subtitle}>Genera un código QR para retiro sin tarjeta</Text>

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
          <Text style={styles.sectionTitle}>Selecciona cuenta</Text>
          {accounts.map((account) => (
            <Card
              key={account.id}
              padding="md"
              style={[
                styles.accountOption,
                selectedAccountId === account.id && styles.accountOptionSelected,
              ]}
              onPress={() => setSelectedAccountId(account.id)}
            >
              <View style={styles.accountOptionRow}>
                <MaterialIcons
                  name="account-balance"
                  size={20}
                  color={selectedAccountId === account.id ? theme.colors.primary : theme.colors.textSecondary}
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
          <Text style={styles.sectionTitle}>Monto a retirar</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            leftIcon="attach-money"
            keyboardType="decimal-pad"
          />

          {!hasSufficientBalance && amount && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>Saldo insuficiente</Text>
            </View>
          )}

          <View style={styles.amountOptions}>
            <Button
              title="Q100"
              onPress={() => setAmount('100')}
              variant="secondary"
              size="small"
              style={styles.amountButton}
            />
            <Button
              title="Q500"
              onPress={() => setAmount('500')}
              variant="secondary"
              size="small"
              style={styles.amountButton}
            />
            <Button
              title="Q1000"
              onPress={() => setAmount('1000')}
              variant="secondary"
              size="small"
              style={styles.amountButton}
            />
          </View>
        </View>

        <Button
          title="Generar código QR"
          onPress={generateQRCode}
          disabled={!hasSufficientBalance || !amount}
          style={styles.submitButton}
        />

        <Card padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={theme.colors.info} />
            <Text style={styles.infoTitle}>Información importante</Text>
          </View>
          <Text style={styles.infoText}>
            • El código QR es válido por 15 minutos
          </Text>
          <Text style={styles.infoText}>
            • Solo puedes retirar en cajeros automáticos de NovaBank
          </Text>
          <Text style={styles.infoText}>
            • El monto máximo por retiro es Q10,000
          </Text>
          <Text style={styles.infoText}>
            • El código es de un solo uso
          </Text>
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
  amountOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  amountButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.info,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  qrCard: {
    marginTop: theme.spacing.xl,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  qrDetails: {
    marginBottom: theme.spacing.lg,
  },
  qrDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  qrDetailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  qrDetailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  qrDetailAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  qrInstructions: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.info}10`,
    borderRadius: theme.borderRadius.md,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.info,
    marginBottom: theme.spacing.sm,
  },
  instructionsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  qrActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  qrButton: {
    flex: 1,
  },
});

export default UserWithdrawScreen;
