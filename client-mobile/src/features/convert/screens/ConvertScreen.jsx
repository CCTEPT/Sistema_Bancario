import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { convertCurrency, getCurrencies, getExchangeRates } from '../../../shared/api/financialClient';
import { getUserAccounts } from '../../../shared/api/bankClient';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const FALLBACK_CURRENCIES = [
  { code: 'GTQ', name: 'Quetzal guatemalteco', symbol: 'Q' },
  { code: 'USD', name: 'Dolar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: 'EUR' },
];

const ConvertScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const canManageRates = user?.role === 'ADMIN_ROLE' || user?.role === 'EMPLOYEE_ROLE';
  
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const availableCurrencies = currencies.length > 0 ? currencies : FALLBACK_CURRENCIES;

  const formatAmount = (value, currency) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value);
    } catch {
      return `${Number(value).toFixed(6)} ${currency}`;
    }
  };

  const findLocalRate = (from, to) => {
    if (from === to) return 1;

    const direct = rates.find((rate) => rate.from === from && rate.to === to);
    if (direct) return direct.rate;

    const inverse = rates.find((rate) => rate.from === to && rate.to === from);
    if (inverse?.rate) return 1 / inverse.rate;

    return null;
  };

  const showToast = (title, description, variant = 'default') => {
    setToastMsg({ title, description, variant });
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    const loadFinancialConfig = async () => {
      try {
        setLoading(true);
        const [currencyResponse, rateResponse] = await Promise.all([
          getCurrencies().catch(() => []),
          getExchangeRates().catch(() => []),
        ]);

        const loadedCurrencies = (currencyResponse || []).map((currency) => ({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol || currency.code,
        }));

        setCurrencies(loadedCurrencies);
        setRates(rateResponse || []);

        const defaultFrom =
          loadedCurrencies.find((currency) => currency.code === 'USD')?.code ||
          loadedCurrencies[0]?.code ||
          'USD';
        const defaultTo =
          loadedCurrencies.find((currency) => currency.code === 'GTQ')?.code ||
          loadedCurrencies[1]?.code ||
          defaultFrom;

        setFromCurrency((current) => current || defaultFrom);
        setToCurrency((current) => current || defaultTo);
      } catch (error) {
        setCurrencies(FALLBACK_CURRENCIES);
        setFromCurrency((current) => current || 'USD');
        setToCurrency((current) => current || 'GTQ');
        showToast(
          'No se pudo cargar FinancialConfig',
          error.message || 'Verifica que el servicio esté activo',
          'destructive'
        );
      } finally {
        setLoading(false);
      }
    };

    loadFinancialConfig();
  }, []);

  useEffect(() => {
    setResult(null);
  }, [fromCurrency, toCurrency, amount]);

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (!fromCurrency || !toCurrency || Number.isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Completa las monedas y un monto mayor a 0');
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult({ toAmount: numAmount, rate: 1, source: 'local' });
      return;
    }

    setConverting(true);

    try {
      const response = await convertCurrency({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
      });

      const converted = Number(response.converted);
      setResult({
        toAmount: converted,
        rate: converted / numAmount,
        source: 'service',
      });
    } catch (error) {
      const localRate = findLocalRate(fromCurrency, toCurrency);

      if (localRate) {
        setResult({
          toAmount: numAmount * localRate,
          rate: localRate,
          source: 'local',
        });
        showToast('Conversión local', 'Se usó la tasa disponible en la lista de tasas');
      } else {
        Alert.alert(
          'Error',
          error.message || 'No hay tasa configurada para esta conversión'
        );
      }
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando configuración financiera..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="swap-horiz" size={28} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Conversión de Divisas</Text>
            <Text style={styles.subtitle}>Convierte montos entre diferentes monedas</Text>
          </View>
        </View>

        {toastMsg && (
          <View style={[
            styles.toastBanner,
            toastMsg.variant === 'destructive' ? styles.toastBannerError : styles.toastBannerSuccess
          ]}>
            <MaterialIcons 
              name={toastMsg.variant === 'destructive' ? 'error' : 'info'} 
              size={20} 
              color={toastMsg.variant === 'destructive' ? theme.colors.danger : theme.colors.success} 
            />
            <View style={styles.toastContent}>
              <Text style={[
                styles.toastTitle,
                toastMsg.variant === 'destructive' ? styles.toastTitleError : styles.toastTitleSuccess
              ]}>{toastMsg.title}</Text>
              <Text style={styles.toastDescription}>{toastMsg.description}</Text>
            </View>
          </View>
        )}

        <Card padding="lg" style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Moneda Origen</Text>
            <View style={styles.currencySelector}>
              {availableCurrencies.map((currency) => (
                <Button
                  key={currency.code}
                  title={`${currency.code}`}
                  subtitle={currency.name}
                  onPress={() => setFromCurrency(currency.code)}
                  variant={fromCurrency === currency.code ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.currencyButton}
                />
              ))}
            </View>
          </View>

          <View style={styles.swapContainer}>
            <MaterialIcons name="arrow-downward" size={24} color={theme.colors.primary} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Moneda Destino</Text>
            <View style={styles.currencySelector}>
              {availableCurrencies.map((currency) => (
                <Button
                  key={currency.code}
                  title={`${currency.code}`}
                  subtitle={currency.name}
                  onPress={() => setToCurrency(currency.code)}
                  variant={toCurrency === currency.code ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.currencyButton}
                />
              ))}
            </View>
          </View>

          <Input
            label="Monto"
            placeholder="100"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            leftIcon="attach-money"
            style={styles.input}
          />

          <Button
            title="Convertir"
            onPress={handleConvert}
            loading={converting}
            variant="primary"
            size="large"
            style={styles.convertButton}
          />

          {result && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
                <Text style={styles.resultTitle}>Resultado</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monto original:</Text>
                <Text style={styles.resultValue}>{formatAmount(amount, fromCurrency)}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tasa usada:</Text>
                <Text style={styles.resultValue}>{result.rate.toFixed(6)}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monto convertido:</Text>
                <Text style={[styles.resultValue, styles.resultValueHighlight]}>
                  {formatAmount(result.toAmount, toCurrency)}
                </Text>
              </View>

              <View style={styles.resultSource}>
                <MaterialIcons 
                  name={result.source === 'service' ? 'cloud' : 'storage'} 
                  size={16} 
                  color={theme.colors.textMuted} 
                />
                <Text style={styles.resultSourceText}>
                  {result.source === 'service' ? 'Usando servicio de conversión' : 'Usando tasa local'}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {rates.length > 0 && (
          <Card padding="lg" style={styles.card}>
            <Text style={styles.sectionTitle}>Tasas de cambio disponibles</Text>
            {rates.map((rate, index) => (
              <View key={index} style={styles.rateRow}>
                <Text style={styles.rateText}>{rate.from} → {rate.to}</Text>
                <Text style={styles.rateValue}>{rate.rate?.toFixed(6) || 'N/A'}</Text>
              </View>
            ))}
          </Card>
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
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  toastBannerSuccess: {
    backgroundColor: `${theme.colors.success}20`,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30}`,
  },
  toastBannerError: {
    backgroundColor: `${theme.colors.danger}20`,
    borderWidth: 1,
    borderColor: `${theme.colors.danger}30}`,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  toastTitleSuccess: {
    color: theme.colors.success,
  },
  toastTitleError: {
    color: theme.colors.danger,
  },
  toastDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  card: {
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
  currencySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  currencyButton: {
    flex: 1,
    minWidth: 80,
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  convertButton: {
    marginTop: theme.spacing.md,
  },
  resultCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30}`,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  resultTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  resultValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  resultValueHighlight: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  resultSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.success}20`,
  },
  resultSourceText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  rateValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});

export default ConvertScreen;
