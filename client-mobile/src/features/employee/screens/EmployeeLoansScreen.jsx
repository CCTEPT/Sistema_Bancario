import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getLoans, approveLoan, rejectLoan, getClients } from '../../../shared/api/employeeClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', icon: 'schedule', bg: `${theme.colors.warning}20`, textColor: theme.colors.warning, borderColor: theme.colors.warning },
  APPROVED: { label: 'Aprobado', icon: 'check-circle', bg: `${theme.colors.success}20`, textColor: theme.colors.success, borderColor: theme.colors.success },
  ACTIVE: { label: 'Activo', icon: 'check-circle', bg: `${theme.colors.info}20`, textColor: theme.colors.info, borderColor: theme.colors.info },
  REJECTED: { label: 'Rechazado', icon: 'cancel', bg: `${theme.colors.danger}20`, textColor: theme.colors.danger, borderColor: theme.colors.danger },
};

const EmployeeLoansScreen = () => {
  const [loans, setLoans] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loansRes, clientsRes] = await Promise.allSettled([
        getLoans(),
        getClients(),
      ]);

      if (loansRes.status === 'fulfilled') {
        const list = Array.isArray(loansRes.value?.loans)
          ? loansRes.value.loans
          : Array.isArray(loansRes.value)
          ? loansRes.value
          : [];
        setLoans(list);
        setBackendAvailable(true);
      } else {
        const err = loansRes.reason;
        if (err.response?.status === 404 || !err.response) setBackendAvailable(false);
      }

      if (clientsRes.status === 'fulfilled') {
        const clients = clientsRes.value.clients || [];
        const map = {};
        clients.forEach((c) => {
          const id = c.id || c._id;
          const name = [c.name, c.surname].filter(Boolean).join(' ') || c.username || c.email || id;
          if (id) map[id] = name;
        });
        setClientMap(map);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loan) => {
    setLoadingAction(true);
    try {
      await approveLoan(loan._id || loan.id);
      Alert.alert('Éxito', 'Préstamo aprobado y monto desembolsado');
      setLoans((prev) =>
        prev.map((l) =>
          (l._id === loan._id || l.id === loan.id) ? { ...l, status: 'ACTIVE' } : l
        )
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al aprobar');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    setLoadingAction(true);
    try {
      await rejectLoan(rejectTarget._id || rejectTarget.id, rejectReason);
      Alert.alert('Éxito', 'Préstamo rechazado');
      setLoans((prev) =>
        prev.map((l) =>
          (l._id === rejectTarget._id || l.id === rejectTarget.id) ? { ...l, status: 'REJECTED' } : l
        )
      );
      setRejectTarget(null);
      setRejectReason('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al rechazar');
    } finally {
      setLoadingAction(false);
    }
  };

  const filtered = loans.filter((l) => {
    if (filterStatus === 'ALL') return true;
    return (l.status || '').toUpperCase() === filterStatus;
  });

  const counts = {
    pending: loans.filter((l) => l.status === 'PENDING').length,
    active: loans.filter((l) => l.status === 'ACTIVE').length,
    rejected: loans.filter((l) => l.status === 'REJECTED').length,
  };

  const formatMoney = (amount, currency = 'GTQ') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
  };

  const renderLoanCard = ({ item }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const clientName = clientMap[item.idUsuario] || 'Cliente desconocido';

    return (
      <Card padding="md" style={styles.loanCard}>
        <View style={styles.loanHeader}>
          <View style={styles.loanInfo}>
            <View style={[styles.statusIcon, { backgroundColor: config.bg }]}>
              <MaterialIcons name={config.icon} size={20} color={config.textColor} />
            </View>
            <View style={styles.loanDetails}>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.loanId}>Préstamo #{item._id?.slice(-6) || item.id?.slice(-6)}</Text>
            </View>
          </View>
          <Badge variant={item.status === 'PENDING' ? 'warning' : item.status === 'ACTIVE' ? 'info' : item.status === 'APPROVED' ? 'success' : 'danger'} size="small">
            {config.label}
          </Badge>
        </View>

        <View style={styles.loanBody}>
          <View style={styles.loanAmount}>
            <Text style={styles.amountLabel}>Monto solicitado</Text>
            <Text style={styles.amountValue}>{formatMoney(item.amount, item.currency || 'GTQ')}</Text>
          </View>
          {item.interestRate && (
            <View style={styles.loanMeta}>
              <Text style={styles.metaLabel}>Interés:</Text>
              <Text style={styles.metaValue}>{item.interestRate}%</Text>
            </View>
          )}
          {item.term && (
            <View style={styles.loanMeta}>
              <Text style={styles.metaLabel}>Plazo:</Text>
              <Text style={styles.metaValue}>{item.term} meses</Text>
            </View>
          )}
        </View>

        {item.status === 'PENDING' && (
          <View style={styles.loanActions}>
            <Button
              title="Aprobar"
              onPress={() => handleApprove(item)}
              loading={loadingAction}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Rechazar"
              onPress={() => setRejectTarget(item)}
              variant="danger"
              size="small"
              style={styles.actionButton}
            />
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando préstamos..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Préstamos</Text>
        <Text style={styles.subtitle}>Aprueba o rechaza solicitudes de préstamos</Text>

        {!backendAvailable && (
          <Card padding="md" style={styles.warningCard}>
            <View style={styles.warningContent}>
              <MaterialIcons name="warning" size={20} color={theme.colors.warning} />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Módulo de préstamos no disponible</Text>
                <Text style={styles.warningMessage}>El endpoint /loans no está disponible</Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, filterStatus === 'PENDING' && styles.statCardActive]}
            onPress={() => setFilterStatus(filterStatus === 'PENDING' ? 'ALL' : 'PENDING')}
          >
            <Text style={[styles.statValue, filterStatus === 'PENDING' && styles.statValueActive]}>
              {counts.pending}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'PENDING' && styles.statLabelActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, filterStatus === 'ACTIVE' && styles.statCardActive]}
            onPress={() => setFilterStatus(filterStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          >
            <Text style={[styles.statValue, filterStatus === 'ACTIVE' && styles.statValueActive]}>
              {counts.active}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'ACTIVE' && styles.statLabelActive]}>
              Activos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, filterStatus === 'REJECTED' && styles.statCardActive]}
            onPress={() => setFilterStatus(filterStatus === 'REJECTED' ? 'ALL' : 'REJECTED')}
          >
            <Text style={[styles.statValue, filterStatus === 'REJECTED' && styles.statValueActive]}>
              {counts.rejected}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'REJECTED' && styles.statLabelActive]}>
              Rechazados
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filtered}
          renderItem={renderLoanCard}
          keyExtractor={(item) => item._id || item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="description" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>
                {!backendAvailable ? 'Módulo no disponible' : 'No hay préstamos'}
              </Text>
            </View>
          }
        />

        <Modal
          visible={!!rejectTarget}
          animationType="fade"
          transparent
          onRequestClose={() => {
            setRejectTarget(null);
            setRejectReason('');
          }}
        >
          <View style={styles.modalOverlay}>
            <Card padding="lg" style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rechazar solicitud</Text>
              <Text style={styles.modalSubtitle}>
                ¿Estás seguro de rechazar el préstamo de{' '}
                {clientMap[rejectTarget?.idUsuario] || 'este cliente'}?
              </Text>

              <Input
                placeholder="Motivo del rechazo (opcional)..."
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
                style={styles.reasonInput}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setRejectTarget(null);
                    setRejectReason('');
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title="Rechazar"
                  onPress={handleReject}
                  loading={loadingAction}
                  variant="danger"
                  style={styles.modalButton}
                />
              </View>
            </Card>
          </View>
        </Modal>
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
  warningCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.warning}10`,
    borderColor: `${theme.colors.warning}30`,
  },
  warningContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  warningMessage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  statCardActive: {
    backgroundColor: `${theme.colors.warning}10`,
    borderColor: theme.colors.warning,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statValueActive: {
    color: theme.colors.warning,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  statLabelActive: {
    color: theme.colors.warning,
  },
  loanCard: {
    marginBottom: theme.spacing.md,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  loanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  loanDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  loanId: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  loanBody: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  loanAmount: {
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
  loanMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  metaValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  loanActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  reasonInput: {
    marginBottom: theme.spacing.lg,
    height: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default EmployeeLoansScreen;
