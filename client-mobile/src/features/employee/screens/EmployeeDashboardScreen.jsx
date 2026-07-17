import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { getClients, getAllMovements, getLoans } from '../../../shared/api/employeeClient';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const screenWidth = Dimensions.get('window').width;

const TX_TYPE = {
  DEPOSIT: { label: 'Depósito', color: theme.colors.success, bg: `${theme.colors.success}20` },
  WITHDRAW: { label: 'Retiro', color: theme.colors.danger, bg: `${theme.colors.danger}20` },
  TRANSFER_OUT: { label: 'Transferencia', color: theme.colors.info, bg: `${theme.colors.info}20` },
  TRANSFER_IN: { label: 'Transferencia', color: theme.colors.info, bg: `${theme.colors.info}20` },
  CHECK_CASH: { label: 'Cheque cobrado', color: theme.colors.purple, bg: `${theme.colors.purple}20` },
  CHECK_ISSUE: { label: 'Cheque emitido', color: theme.colors.textMuted, bg: `${theme.colors.textMuted}20` },
};

const buildChartData = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { labels: [''], datasets: [{ data: [0] }] };
  }

  const byDay = {};

  transactions.forEach((tx) => {
    const date = tx.date || tx.createdAt || tx.updatedAt;
    if (!date) return;
    const day = new Date(date).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
    if (!byDay[day]) byDay[day] = { day, amount: 0 };
    byDay[day].amount += Number(tx.amount || 0);
  });

  const sortedDays = Object.values(byDay).slice(-7);
  const labels = sortedDays.map((d) => d.day);
  const data = sortedDays.map((d) => d.amount);

  return { labels, datasets: [{ data }] };
};

const EmployeeDashboardScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ clients: 0, movements: 0, pendingLoans: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buen día';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, movementsRes] = await Promise.allSettled([
          getClients(),
          getAllMovements({ limit: 20 }),
        ]);

        let loansPending = 0;
        try {
          const loansRes = await getLoans();
          loansPending = (loansRes.loans || []).filter(
            (l) => l.status === 'PENDING' || l.estado === 'PENDIENTE'
          ).length;
        } catch {
          loansPending = 0;
        }

        const rawClients = clientsRes.status === 'fulfilled' ? clientsRes.value : {};
        const clients = Array.isArray(rawClients?.clients) ? rawClients.clients
          : Array.isArray(rawClients?.data) ? rawClients.data
          : Array.isArray(rawClients) ? rawClients
          : [];

        const rawMov = movementsRes.status === 'fulfilled' ? movementsRes.value : {};
        const movements = Array.isArray(rawMov?.movements) ? rawMov.movements
          : Array.isArray(rawMov?.data?.movements) ? rawMov.data.movements
          : Array.isArray(rawMov?.data) ? rawMov.data
          : Array.isArray(rawMov) ? rawMov
          : [];

        setStats({
          clients: clients.length,
          movements: movements.length,
          pendingLoans: loansPending,
        });
        setRecentTx(movements.slice(0, 6));
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleString();
  };

  const renderStatCard = (title, value, subtitle, icon, iconBg, iconColor, onPress) => (
    <Card padding="md" style={styles.statCard} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );

  const renderTransactionItem = (tx, index) => {
    const cfg = TX_TYPE[tx.movementType] || {
      label: tx.movementType || 'Movimiento',
      color: theme.colors.textMuted,
      bg: `${theme.colors.textMuted}20`,
    };

    const iconName = cfg.label === 'Depósito'
      ? 'arrow-downward'
      : cfg.label === 'Retiro'
      ? 'arrow-upward'
      : 'swap-horiz';

    return (
      <View key={tx._id || tx.id || index} style={styles.transactionItem}>
        <View style={[styles.txIcon, { backgroundColor: cfg.bg }]}>
          <MaterialIcons name={iconName} size={16} color={cfg.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txType}>{cfg.label}</Text>
          <Text style={styles.txMeta}>{tx.accountNumber || tx.channel || 'APP'}</Text>
          <Text style={styles.txDate}>{formatDate(tx.date || tx.createdAt)}</Text>
        </View>
        <Text style={[styles.txAmount, { color: cfg.color }]}>
          {formatMoney(tx.amount, tx.currency || 'GTQ')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando panel..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.userName}>
            {user?.name ? user.name.split(' ')[0] : user?.username || 'Empleado'}
          </Text>
          <Text style={styles.userRole}>
            Panel de operaciones — gestiona clientes y operaciones del banco
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {renderStatCard(
            'Clientes registrados',
            stats.clients,
            'Usuarios con rol cliente',
            'people',
            `${theme.colors.primary}20`,
            theme.colors.primary,
            () => navigation.navigate('Clients')
          )}
          {renderStatCard(
            'Operaciones recientes',
            stats.movements,
            'Últimas transacciones',
            'swap-horiz',
            `${theme.colors.info}20`,
            theme.colors.info,
            () => navigation.navigate('TransactionSupport')
          )}
          {renderStatCard(
            'Préstamos pendientes',
            stats.pendingLoans,
            'Requieren aprobación',
            'description',
            `${theme.colors.warning}20`,
            theme.colors.warning,
            () => navigation.navigate('EmployeeLoans')
          )}
        </View>

        <Card padding="lg" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Actividad de Transacciones</Text>
            <Text style={styles.chartSubtitle}>Últimos 7 días</Text>
          </View>
          {recentTx.length > 0 ? (
            <LineChart
              data={buildChartData(recentTx)}
              width={screenWidth - theme.spacing.lg * 4}
              height={180}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: () => theme.colors.primary,
                labelColor: () => theme.colors.textSecondary,
                style: { borderRadius: theme.borderRadius.md },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyChart}>
              <MaterialIcons name="show-chart" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyChartText}>Sin datos para mostrar</Text>
            </View>
          )}
        </Card>

        <Card padding="lg" style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Actividad reciente</Text>
          </View>
          {recentTx.length === 0 ? (
            <View style={styles.emptyActivity}>
              <MaterialIcons name="swap-horiz" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Sin actividad reciente</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTx.map((tx, i) => renderTransactionItem(tx, i))}
            </View>
          )}
        </Card>

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Acciones rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <Button
              title="Ver Clientes"
              onPress={() => navigation.navigate('Clients')}
              leftIcon={<MaterialIcons name="people" size={20} color={theme.colors.text} />}
              variant="secondary"
              style={styles.quickActionButton}
            />
            <Button
              title="Gestionar Préstamos"
              onPress={() => navigation.navigate('EmployeeLoans')}
              leftIcon={<MaterialIcons name="description" size={20} color={theme.colors.text} />}
              variant="secondary"
              style={styles.quickActionButton}
            />
            <Button
              title="Soporte Transaccional"
              onPress={() => navigation.navigate('TransactionSupport')}
              leftIcon={<MaterialIcons name="support-agent" size={20} color={theme.colors.text} />}
              variant="secondary"
              style={styles.quickActionButton}
            />
            <Button
              title="Abrir Cuenta"
              onPress={() => navigation.navigate('CreateAccount')}
              leftIcon={<MaterialIcons name="add-card" size={20} color={theme.colors.text} />}
              variant="secondary"
              style={styles.quickActionButton}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  header: { marginBottom: theme.spacing.lg },
  greeting: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  userName: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  userRole: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  statCard: { flex: 1, minWidth: 140 },
  statHeader: { marginBottom: theme.spacing.sm },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statTitle: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  statValue: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  statSubtitle: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  chartCard: { marginBottom: theme.spacing.lg },
  chartHeader: { marginBottom: theme.spacing.md },
  chartTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  chartSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  chart: { borderRadius: theme.borderRadius.md },
  emptyChart: { alignItems: 'center', padding: theme.spacing.xl },
  emptyChartText: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.sm },
  activityCard: { marginBottom: theme.spacing.lg },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  activityTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  emptyActivity: { alignItems: 'center', padding: theme.spacing.xl },
  emptyText: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.sm },
  transactionsList: { gap: theme.spacing.sm },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.sm, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md },
  txIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.sm },
  txInfo: { flex: 1 },
  txType: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium, color: theme.colors.text, marginBottom: theme.spacing.xs },
  txMeta: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  txDate: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  txAmount: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold },
  quickActions: { marginBottom: theme.spacing.lg },
  quickActionsTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, marginBottom: theme.spacing.md },
  quickActionsGrid: { gap: theme.spacing.sm },
  quickActionButton: { flex: 1 },
});

export default EmployeeDashboardScreen;