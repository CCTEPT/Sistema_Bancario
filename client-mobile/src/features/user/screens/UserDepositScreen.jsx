import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const formatMoney = (amount, currency = 'GTQ') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
};

const UserDepositScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('');

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

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando cuentas..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Depositar</Text>
        <Text style={styles.subtitle}>Opciones para depositar dinero a tu cuenta</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona cuenta destino</Text>
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

        <Card padding="lg" style={styles.methodCard}>
          <Text style={styles.methodTitle}>Opciones de depósito</Text>

          <View style={styles.methodItem}>
            <View style={styles.methodIcon}>
              <MaterialIcons name="phone-android" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>Transferencia SPEI/ACH</Text>
              <Text style={styles.methodDesc}>
                Realiza una transferencia desde otra cuenta bancaria usando los datos SPEI/ACH
              </Text>
            </View>
          </View>

          {selectedAccount && (
            <View style={styles.speiData}>
              <Text style={styles.speiLabel}>Datos para transferencia:</Text>
              <View style={styles.speiRow}>
                <Text style={styles.speiKey}>Banco:</Text>
                <Text style={styles.speiValue}>NovaBank</Text>
              </View>
              <View style={styles.speiRow}>
                <Text style={styles.speiKey}>Cuenta:</Text>
                <Text style={styles.speiValue}>{selectedAccount.accountNumber}</Text>
              </View>
              <View style={styles.speiRow}>
                <Text style={styles.speiKey}>CLABE:</Text>
                <Text style={styles.speiValue}>000000000000000000</Text>
              </View>
              <View style={styles.speiRow}>
                <Text style={styles.speiKey}>Referencia:</Text>
                <Text style={styles.speiValue}>{selectedAccount.accountNumber}</Text>
              </View>
            </View>
          )}

          <View style={styles.methodItem}>
            <View style={styles.methodIcon}>
              <MaterialIcons name="store" size={24} color={theme.colors.info} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>Corresponsal bancario</Text>
              <Text style={styles.methodDesc}>
                Acude a cualquier corresponsal autorizado y genera una referencia de depósito
              </Text>
            </View>
          </View>

          <Button
            title="Generar referencia de depósito"
            onPress={() => Alert.alert('Información', 'La función de generar referencia estará disponible próximamente')}
            variant="secondary"
            style={styles.generateButton}
          />
        </Card>

        <Card padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={theme.colors.info} />
            <Text style={styles.infoTitle}>Información importante</Text>
          </View>
          <Text style={styles.infoText}>
            • Los depósitos por SPEI/ACH pueden tardar hasta 24 horas en reflejarse
          </Text>
          <Text style={styles.infoText}>
            • Los depósitos en corresponsales se acreditan de inmediato
          </Text>
          <Text style={styles.infoText}>
            • El banco no cobra comisiones por depósitos
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
  methodCard: {
    marginBottom: theme.spacing.lg,
  },
  methodTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  methodItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  methodDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  speiData: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  speiLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  speiRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  speiKey: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    width: 80,
  },
  speiValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  generateButton: {
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
});

export default UserDepositScreen;
