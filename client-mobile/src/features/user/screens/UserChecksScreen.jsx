import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserAccounts } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import theme from '../../../shared/constants/theme';

const CHECK_STATUS = {
  CASHED: { label: 'Cobrado', color: theme.colors.success, bg: `${theme.colors.success}20`, variant: 'success' },
  PENDING: { label: 'Pendiente', color: theme.colors.warning, bg: `${theme.colors.warning}20`, variant: 'warning' },
  REJECTED: { label: 'Rechazado', color: theme.colors.danger, bg: `${theme.colors.danger}20`, variant: 'danger' },
  CANCELLED: { label: 'Cancelado', color: theme.colors.textMuted, bg: `${theme.colors.textMuted}20`, variant: 'secondary' },
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

const UserChecksScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('issued'); // 'issued' | 'received'
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getUserAccounts();
      const loadedAccounts = (response.accounts || []).map((account) => ({
        id: account._id,
        accountNumber: account.numeroCuenta,
        tipoCuenta: account.tipoCuenta,
        divisa: account.divisa,
      }));
      setAccounts(loadedAccounts);

      const mockChecks = [
        {
          id: '1',
          checkNumber: '001234',
          amount: 1500,
          currency: 'GTQ',
          status: 'CASHED',
          issueDate: '2024-01-15',
          dueDate: '2024-01-30',
          payee: 'Juan Pérez',
          accountNumber: loadedAccounts[0]?.accountNumber || '12345678',
        },
        {
          id: '2',
          checkNumber: '001235',
          amount: 3200,
          currency: 'GTQ',
          status: 'PENDING',
          issueDate: '2024-01-20',
          dueDate: '2024-02-05',
          payee: 'María García',
          accountNumber: loadedAccounts[0]?.accountNumber || '12345678',
        },
        {
          id: '3',
          checkNumber: '001236',
          amount: 500,
          currency: 'GTQ',
          status: 'REJECTED',
          issueDate: '2024-01-10',
          dueDate: '2024-01-25',
          payee: 'Carlos López',
          accountNumber: loadedAccounts[0]?.accountNumber || '12345678',
        },
      ];
      setChecks(mockChecks);
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckCard = ({ item }) => {
    const statusConfig = CHECK_STATUS[item.status] || CHECK_STATUS.PENDING;

    return (
      <Card padding="md" style={styles.checkCard}>
        <View style={styles.checkHeader}>
          <View style={styles.checkInfo}>
            <MaterialIcons name="description" size={24} color={theme.colors.primary} />
            <View style={styles.checkDetails}>
              <Text style={styles.checkNumber}>Cheque #{item.checkNumber}</Text>
              <Text style={styles.checkAccount}>Cuenta {item.accountNumber}</Text>
            </View>
          </View>
          <Badge variant={statusConfig.variant} size="small">
            {statusConfig.label}
          </Badge>
        </View>

        <View style={styles.checkAmount}>
          <Text style={styles.amountLabel}>Monto</Text>
          <Text style={styles.amountValue}>{formatMoney(item.amount, item.currency)}</Text>
        </View>

        <View style={styles.checkMeta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Beneficiario:</Text>
            <Text style={styles.metaValue}>{item.payee}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Emisión:</Text>
            <Text style={styles.metaValue}>{formatDate(item.issueDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Vencimiento:</Text>
            <Text style={styles.metaValue}>{formatDate(item.dueDate)}</Text>
          </View>
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
        <Text style={styles.subtitle}>Gestiona tus chequeras y cheques</Text>

        <View style={styles.tabs}>
          <Button
            title="Emitidos"
            onPress={() => setSelectedTab('issued')}
            variant={selectedTab === 'issued' ? 'primary' : 'secondary'}
            style={styles.tabButton}
          />
          <Button
            title="Recibidos"
            onPress={() => setSelectedTab('received')}
            variant={selectedTab === 'received' ? 'primary' : 'secondary'}
            style={styles.tabButton}
          />
        </View>

        {selectedTab === 'issued' && (
          <>
            <Button
              title="Solicitar nueva chequera"
              onPress={() => setShowRequestModal(true)}
              leftIcon={<MaterialIcons name="add" size={20} color={theme.colors.text} />}
              style={styles.requestButton}
            />

            {checks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="description" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No tienes cheques emitidos</Text>
              </View>
            ) : (
              <FlatList
                data={checks}
                renderItem={renderCheckCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        )}

        {selectedTab === 'received' && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No tienes cheques recibidos</Text>
            <Text style={styles.emptySubtext}>Los cheques recibidos aparecerán aquí</Text>
          </View>
        )}

        {showRequestModal && (
          <Card padding="lg" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar nueva chequera</Text>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Una nueva chequera contiene 50 cheques y tiene un costo de Q25.
              </Text>
              <Text style={styles.modalText}>
                La chequera estará disponible en 3-5 días hábiles.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => setShowRequestModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Solicitar"
                onPress={() => {
                  Alert.alert('Éxito', 'Solicitud de chequera enviada');
                  setShowRequestModal(false);
                }}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        )}

        <Card padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={theme.colors.info} />
            <Text style={styles.infoTitle}>Información importante</Text>
          </View>
          <Text style={styles.infoText}>
            • Los cheques tienen validez de 6 meses desde la fecha de emisión
          </Text>
          <Text style={styles.infoText}>
            • Puedes depositar cheques en cualquier sucursal o corresponsal
          </Text>
          <Text style={styles.infoText}>
            • Los cheques rechazados generan una comisión de Q50
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
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
  },
  requestButton: {
    marginBottom: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  checkCard: {
    marginBottom: theme.spacing.md,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  checkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkDetails: {
    marginLeft: theme.spacing.md,
  },
  checkNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  checkAccount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  checkAmount: {
    marginBottom: theme.spacing.md,
  },
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  amountValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  checkMeta: {
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
  modalCard: {
    marginBottom: theme.spacing.lg,
  },
  modalHeader: {
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalContent: {
    marginBottom: theme.spacing.lg,
  },
  modalText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
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

export default UserChecksScreen;
