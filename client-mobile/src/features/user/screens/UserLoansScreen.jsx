import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts, getUserLoans, requestLoan as requestLoanApi } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const LOAN_STATUS = {
  ACTIVE: { label: 'Activo', color: theme.colors.success, bg: `${theme.colors.success}20`, variant: 'success' },
  PENDING: { label: 'En revisión', color: theme.colors.warning, bg: `${theme.colors.warning}20`, variant: 'warning' },
  APPROVED: { label: 'Aprobado', color: theme.colors.info, bg: `${theme.colors.info}20`, variant: 'info' },
  REJECTED: { label: 'Rechazado', color: theme.colors.danger, bg: `${theme.colors.danger}20`, variant: 'danger' },
  PAID: { label: 'Pagado', color: theme.colors.textMuted, bg: `${theme.colors.textMuted}20`, variant: 'secondary' },
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

const UserLoansScreen = () => {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulation, setSimulation] = useState({
    amount: '',
    term: '12',
    interestRate: '12',
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansResponse, accountsResponse] = await Promise.allSettled([
        getUserLoans(),
        getUserAccounts(),
      ]);

      const loadedLoans = loansResponse.status === 'fulfilled'
        ? (loansResponse.value.loans || [])
        : [];
      const loadedAccounts = accountsResponse.status === 'fulfilled'
        ? (accountsResponse.value.accounts || []).map((account) => ({
            id: account._id,
            accountNumber: account.numeroCuenta,
            tipoCuenta: account.tipoCuenta,
            divisa: account.divisa,
          }))
        : [];

      setLoans(loadedLoans);
      setAccounts(loadedAccounts);
      if (loadedAccounts.length > 0) {
        setAccountId((current) => current || loadedAccounts[0].id);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  const calculateSimulation = () => {
    const amount = parseFloat(simulation.amount) || 0;
    const term = parseInt(simulation.term) || 12;
    const rate = parseFloat(simulation.interestRate) || 12;

    if (amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    setSimulationResult({
      amount,
      term,
      rate,
      monthlyPayment,
      totalPayment,
      totalInterest,
    });
  };

  const handleRequestLoan = async () => {
    if (!simulationResult) return;

    if (!accountId) {
      Alert.alert('Error', 'Selecciona una cuenta para recibir el desembolso');
      return;
    }

    setSubmitting(true);
    try {
      await requestLoanApi({
        accountId,
        amount: simulationResult.amount,
        termMonths: simulationResult.term,
        description: 'Solicitud de préstamo desde la app móvil',
      });

      Alert.alert('Solicitud enviada', 'Tu solicitud de préstamo ha sido enviada para revisión');
      setShowSimulator(false);
      setSimulation({ amount: '', term: '12', interestRate: '12' });
      setSimulationResult(null);
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'No fue posible enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando préstamos..." />;
  }

  if (showSimulator) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Button
            title="← Volver a mis préstamos"
            onPress={() => setShowSimulator(false)}
            variant="ghost"
            style={styles.backButton}
          />

          <Text style={styles.title}>Simulador de Crédito</Text>
          <Text style={styles.subtitle}>Calcula tu cuota mensual antes de solicitar</Text>

          <Card padding="lg" style={styles.simulatorCard}>
            <Input
              label="Monto solicitado (Q)"
              placeholder="10000"
              value={simulation.amount}
              onChangeText={(text) => setSimulation({ ...simulation, amount: text })}
              leftIcon="attach-money"
              keyboardType="decimal-pad"
            />

            <View style={styles.termSection}>
              <Text style={styles.termLabel}>Plazo (meses)</Text>
              <View style={styles.termOptions}>
                {['6', '12', '24', '36'].map((term) => (
                  <Button
                    key={term}
                    title={`${term} meses`}
                    onPress={() => setSimulation({ ...simulation, term })}
                    variant={simulation.term === term ? 'primary' : 'secondary'}
                    size="small"
                    style={styles.termButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.rateSection}>
              <Text style={styles.rateLabel}>Tasa de interés anual</Text>
              <Text style={styles.rateValue}>{simulation.interestRate}%</Text>
              <Text style={styles.rateNote}>Tasa fija para todos los créditos</Text>
            </View>

            {accounts.length > 0 && (
              <View style={styles.termSection}>
                <Text style={styles.termLabel}>Cuenta de desembolso</Text>
                <View style={styles.termOptions}>
                  {accounts.map((account) => (
                    <Button
                      key={account.id}
                      title={`${account.divisa} - ${account.accountNumber}`}
                      onPress={() => setAccountId(account.id)}
                      variant={accountId === account.id ? 'primary' : 'secondary'}
                      size="small"
                      style={styles.termButton}
                    />
                  ))}
                </View>
              </View>
            )}

            <Button
              title="Calcular cuota"
              onPress={calculateSimulation}
              style={styles.calculateButton}
            />
          </Card>

          {simulationResult && (
            <Card padding="lg" style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <MaterialIcons name="calculate" size={24} color={theme.colors.success} />
                <Text style={styles.resultTitle}>Resultado de simulación</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monto solicitado:</Text>
                <Text style={styles.resultValue}>{formatMoney(simulationResult.amount)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Plazo:</Text>
                <Text style={styles.resultValue}>{simulationResult.term} meses</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tasa anual:</Text>
                <Text style={styles.resultValue}>{simulationResult.rate}%</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Cuota mensual:</Text>
                <Text style={[styles.resultValue, styles.resultHighlight]}>
                  {formatMoney(simulationResult.monthlyPayment)}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total a pagar:</Text>
                <Text style={styles.resultValue}>{formatMoney(simulationResult.totalPayment)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Intereses totales:</Text>
                <Text style={[styles.resultValue, styles.resultInterest]}>
                  {formatMoney(simulationResult.totalInterest)}
                </Text>
              </View>

              <Button
                title="Solicitar este crédito"
                onPress={handleRequestLoan}
                loading={submitting}
                variant="primary"
                style={styles.requestButton}
              />
            </Card>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Préstamos</Text>
        <Text style={styles.subtitle}>Gestiona tus créditos y solicita nuevos</Text>

        <Button
          title="Simular nuevo crédito"
          onPress={() => setShowSimulator(true)}
          leftIcon={<MaterialIcons name="calculate" size={20} color={theme.colors.text} />}
          style={styles.simulateButton}
        />

        <Text style={styles.sectionTitle}>Mis préstamos activos</Text>

        {loans.filter((l) => l.status === 'ACTIVE').length === 0 ? (
          <Card padding="md" style={styles.emptyCard}>
            <MaterialIcons name="account-balance-wallet" size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No tienes préstamos activos</Text>
          </Card>
        ) : (
          loans.filter((l) => l.status === 'ACTIVE').map((loan) => (
            <Card key={loan.idLoan} padding="md" style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <View style={styles.loanInfo}>
                  <MaterialIcons name="account-balance-wallet" size={24} color={theme.colors.primary} />
                  <View style={styles.loanDetails}>
                    <Text style={styles.loanAmount}>{formatMoney(loan.amount, loan.currency)}</Text>
                    <Text style={styles.loanTerm}>{loan.termMonths} meses · {loan.annualRate}% anual</Text>
                  </View>
                </View>
                <Badge variant="success" size="small">Activo</Badge>
              </View>

              <View style={styles.loanProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, ((loan.amountPaid || 0) / loan.totalPayment) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Pagado: {formatMoney(loan.amountPaid || 0, loan.currency)} de {formatMoney(loan.totalPayment, loan.currency)}
                </Text>
              </View>

              <View style={styles.loanMeta}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Cuota mensual:</Text>
                  <Text style={styles.metaValue}>{formatMoney(loan.monthlyPayment, loan.currency)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Fecha de aprobación:</Text>
                  <Text style={styles.metaValue}>{formatDate(loan.approvedAt || loan.createdAt)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Saldo restante:</Text>
                  <Text style={[styles.metaValue, styles.metaHighlight]}>
                    {formatMoney(loan.remainingBalance, loan.currency)}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}

        <Text style={styles.sectionTitle}>Historial de préstamos</Text>

        {loans.filter((l) => l.status !== 'ACTIVE').length === 0 ? (
          <Card padding="md" style={styles.emptyCard}>
            <MaterialIcons name="history" size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Sin historial de préstamos</Text>
          </Card>
        ) : (
          loans.filter((l) => l.status !== 'ACTIVE').map((loan) => {
            const statusConfig = LOAN_STATUS[loan.status] || LOAN_STATUS.PENDING;
            return (
              <Card key={loan.idLoan} padding="md" style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View style={styles.loanInfo}>
                    <MaterialIcons name="history" size={24} color={theme.colors.textSecondary} />
                    <View style={styles.loanDetails}>
                      <Text style={styles.loanAmount}>{formatMoney(loan.amount, loan.currency)}</Text>
                      <Text style={styles.loanTerm}>{loan.termMonths} meses · {loan.annualRate}% anual</Text>
                    </View>
                  </View>
                  <Badge variant={statusConfig.variant} size="small">
                    {statusConfig.label}
                  </Badge>
                </View>

                <View style={styles.loanMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Fecha de solicitud:</Text>
                    <Text style={styles.metaValue}>{formatDate(loan.createdAt)}</Text>
                  </View>
                  {loan.status === 'REJECTED' && loan.rejectionReason && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Motivo:</Text>
                      <Text style={styles.metaValue}>{loan.rejectionReason}</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}

        <Card padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={theme.colors.info} />
            <Text style={styles.infoTitle}>Información importante</Text>
          </View>
          <Text style={styles.infoText}>
            • Las tasas de interés varían según tu perfil crediticio
          </Text>
          <Text style={styles.infoText}>
            • El monto mínimo de crédito es Q5,000
          </Text>
          <Text style={styles.infoText}>
            • El plazo máximo es de 60 meses
          </Text>
          <Text style={styles.infoText}>
            • Los pagos puntuales mejoran tu historial crediticio
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
  simulateButton: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  loanCard: {
    marginBottom: theme.spacing.md,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loanDetails: {
    marginLeft: theme.spacing.md,
  },
  loanAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  loanTerm: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loanProgress: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  loanMeta: {
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  metaLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  metaHighlight: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
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
  backButton: {
    marginBottom: theme.spacing.md,
  },
  simulatorCard: {
    marginBottom: theme.spacing.lg,
  },
  termSection: {
    marginTop: theme.spacing.lg,
  },
  termLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  termOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  termButton: {
    minWidth: 70,
  },
  rateSection: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  rateLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  rateValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  rateNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  calculateButton: {
    marginTop: theme.spacing.lg,
  },
  resultCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.success}10`,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  resultTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  resultValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  resultHighlight: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  resultInterest: {
    color: theme.colors.warning,
  },
  resultDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  requestButton: {
    marginTop: theme.spacing.lg,
  },
});

export default UserLoansScreen;
