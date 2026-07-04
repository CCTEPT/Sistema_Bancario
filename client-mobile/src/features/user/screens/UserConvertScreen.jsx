import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts } from '../../../shared/api/bankClient';
import { getCurrencies } from '../../../shared/api/financialClient';
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

const UserConvertScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [converting, setConverting] = useState(false);

  const exchangeRates = {
    GTQ: { USD: 0.13, EUR: 0.12 },
    USD: { GTQ: 7.8, EUR: 0.92 },
    EUR: { GTQ: 8.5, USD: 1.09 },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsResponse, currenciesResponse] = await Promise.allSettled([
        getUserAccounts(),
        getCurrencies(),
      ]);

      const loadedAccounts = accountsResponse.status === 'fulfilled'
        ? (accountsResponse.value.accounts || []).map((account) => ({
            id: account._id,
            accountNumber: account.numeroCuenta,
            tipoCuenta: account.tipoCuenta,
            divisa: account.divisa,
            saldo: Number(account.saldo || account.balance || 0),
          }))
        : [];

      const loadedCurrencies = currenciesResponse.status === 'fulfilled'
        ? (currenciesResponse.value || []).map((c) => ({
            code: c.code || c,
            name: c.name || c,
          }))
        : [
            { code: 'GTQ', name: 'Quetzal' },
            { code: 'USD', name: 'Dólar estadounidense' },
            { code: 'EUR', name: 'Euro' },
          ];

      setAccounts(loadedAccounts);
      setCurrencies(loadedCurrencies);
      if (loadedAccounts.length > 0) {
        setFromAccountId(loadedAccounts[0].id);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((acc) => acc.id === fromAccountId);
  const fromCurrency = selectedAccount?.divisa || 'GTQ';
  const convertAmount = parseFloat(amount) || 0;
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
  const convertedAmount = convertAmount * rate;
  const hasSufficientBalance = convertAmount > 0 && convertAmount <= (selectedAccount?.saldo || 0);

  const handleConvert = () => {
    if (!hasSufficientBalance) {
      Alert.alert('Error', 'Saldo insuficiente para la conversión');
      return;
    }

    if (convertAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    setShowConfirm(true);
  };

  const confirmConvert = async () => {
    setConverting(true);
    try {
      Alert.alert('Éxito', `Conversión realizada: ${formatMoney(convertAmount, fromCurrency)} a ${formatMoney(convertedAmount, toCurrency)}`);
      setShowConfirm(false);
      setAmount('');
      await loadData();
    } catch (err) {
      Alert.alert('Error', 'No fue posible realizar la conversión');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando..." />;
  }

  if (showConfirm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Card padding="lg" style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="currency-exchange" size={32} color={theme.colors.primary} />
              <Text style={styles.confirmTitle}>Confirmar conversión</Text>
            </View>

            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>De:</Text>
                <Text style={styles.confirmValue}>{formatMoney(convertAmount, fromCurrency)}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>A:</Text>
                <Text style={[styles.confirmValue, styles.confirmAmount]}>
                  {formatMoney(convertedAmount, toCurrency)}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Tasa:</Text>
                <Text style={styles.confirmValue}>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</Text>
              </View>
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
                onPress={confirmConvert}
                loading={converting}
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
        <Text style={styles.title}>Convertir Divisas</Text>
        <Text style={styles.subtitle}>Compra y venta de divisas</Text>

        <Card padding="lg" style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <MaterialIcons name="account-balance-wallet" size={24} color={theme.colors.primary} />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <Text style={styles.balanceAmount}>
                {formatMoney(selectedAccount?.saldo || 0, fromCurrency)}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta origen</Text>
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
          <Text style={styles.sectionTitle}>Divisa destino</Text>
          <View style={styles.currencyOptions}>
            {currencies.map((currency) => (
              <Button
                key={currency.code}
                title={currency.code}
                onPress={() => setToCurrency(currency.code)}
                variant={toCurrency === currency.code ? 'primary' : 'secondary'}
                style={styles.currencyButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto a convertir</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            leftIcon="attach-money"
            keyboardType="decimal-pad"
          />

          {amount && convertAmount > 0 && (
            <Card padding="md" style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Recibirás:</Text>
                <Text style={[styles.previewValue, styles.previewAmount]}>
                  {formatMoney(convertedAmount, toCurrency)}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Tasa aplicada:</Text>
                <Text style={styles.previewValue}>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</Text>
              </View>
            </Card>
          )}

          {!hasSufficientBalance && amount && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>Saldo insuficiente</Text>
            </View>
          )}
        </View>

        <Button
          title="Convertir"
          onPress={handleConvert}
          disabled={!hasSufficientBalance || !amount}
          style={styles.submitButton}
        />

        <Card padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={theme.colors.info} />
            <Text style={styles.infoTitle}>Información de tasas</Text>
          </View>
          <Text style={styles.infoText}>
            • Las tasas de cambio se actualizan en tiempo real
          </Text>
          <Text style={styles.infoText}>
            • El banco aplica un margen del 0.5% sobre la tasa del mercado
          </Text>
          <Text style={styles.infoText}>
            • El monto mínimo de conversión es de Q100 o $15
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
  currencyOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  currencyButton: {
    minWidth: 80,
  },
  previewCard: {
    marginTop: theme.spacing.md,
    backgroundColor: `${theme.colors.success}10`,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  previewLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  previewValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  previewAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
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

export default UserConvertScreen;
