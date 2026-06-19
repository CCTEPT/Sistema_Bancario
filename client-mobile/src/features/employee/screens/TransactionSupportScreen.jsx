import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllMovements } from '../../../shared/api/employeeClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const TX_CONFIG = {
  DEPOSIT: { label: 'Depósito', icon: 'arrow-downward', bg: `${theme.colors.success}20`, color: theme.colors.success, amountColor: theme.colors.success, prefix: '+', badgeBg: `${theme.colors.success}20`, badgeColor: theme.colors.success },
  WITHDRAW: { label: 'Retiro', icon: 'arrow-upward', bg: `${theme.colors.danger}20`, color: theme.colors.danger, amountColor: theme.colors.danger, prefix: '-', badgeBg: `${theme.colors.danger}20`, badgeColor: theme.colors.danger },
  TRANSFER_OUT: { label: 'Transferencia', icon: 'swap-horiz', bg: `${theme.colors.info}20`, color: theme.colors.info, amountColor: theme.colors.info, prefix: '', badgeBg: `${theme.colors.info}20`, badgeColor: theme.colors.info },
  TRANSFER_IN: { label: 'Transferencia', icon: 'swap-horiz', bg: `${theme.colors.info}20`, color: theme.colors.info, amountColor: theme.colors.success, prefix: '', badgeBg: `${theme.colors.info}20`, badgeColor: theme.colors.info },
  CHECK_CASH: { label: 'Cheque', icon: 'description', bg: `${theme.colors.purple}20`, color: theme.colors.purple, amountColor: theme.colors.text, prefix: '', badgeBg: `${theme.colors.purple}20`, badgeColor: theme.colors.purple },
  CONVERSION: { label: 'Conversión', icon: 'sync', bg: `${theme.colors.warning}20`, color: theme.colors.warning, amountColor: theme.colors.text, prefix: '', badgeBg: `${theme.colors.warning}20`, badgeColor: theme.colors.warning },
};

const PAGE_SIZE = 20;

const TransactionSupportScreen = () => {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getAllMovements({ limit: 500 });
      const list = Array.isArray(response?.movements) ? response.movements
        : Array.isArray(response?.data?.movements) ? response.data.movements
        : Array.isArray(response?.data) ? response.data
        : Array.isArray(response) ? response
        : [];
      setAll(list);
    } catch (err) {
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = all.filter((tx) => {
    const matchType = typeFilter === 'ALL' || tx.movementType === typeFilter;
    const matchStatus = statusFilter === 'ALL' || (tx.status || '').toUpperCase() === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || (tx.accountNumber || '').toLowerCase().includes(q)
      || (tx.description || '').toLowerCase().includes(q)
      || (tx._id || '').toLowerCase().includes(q)
      || (tx.amount?.toString() || '').includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  const hasFilters = search || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  const types = ['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER_OUT', 'TRANSFER_IN', 'CHECK_CASH'];
  const statuses = ['ALL', 'COMPLETED', 'PENDING', 'FAILED'];

  const formatMoney = (amount, currency = 'GTQ') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleString();
  };

  const renderTransactionCard = ({ item }) => {
    const config = TX_CONFIG[item.movementType] || TX_CONFIG.TRANSFER_OUT;

    return (
      <Card padding="md" style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={[styles.txIcon, { backgroundColor: config.bg }]}>
            <MaterialIcons name={config.icon} size={20} color={config.color} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>{config.label}</Text>
            <Text style={styles.transactionMeta}>
              {item.accountNumber || item.channel || 'APP'}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.date || item.createdAt)}</Text>
          </View>
          <Text style={[styles.transactionAmount, { color: config.amountColor }]}>
            {config.prefix}{formatMoney(item.amount, item.currency || 'GTQ')}
          </Text>
        </View>
        
        {item.description && (
          <Text style={styles.transactionDescription}>{item.description}</Text>
        )}

        <View style={styles.transactionFooter}>
          <Badge variant="default" size="small">
            {item.status || 'COMPLETED'}
          </Badge>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando operaciones..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Soporte de transacciones</Text>
            <Text style={styles.subtitle}>Consulta y filtra todas las operaciones del sistema</Text>
          </View>
          {!loading && (
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.statusText}>{all.length} operaciones</Text>
            </View>
          )}
        </View>

        <Card padding="lg" style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <MaterialIcons name="filter-list" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.filterTitle}>Filtros</Text>
            {hasFilters && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearFilters}>
                <MaterialIcons name="close" size={16} color={theme.colors.textMuted} />
                <Text style={styles.clearFiltersText}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input
            placeholder="Buscar por cuenta, descripción, ID o monto..."
            value={search}
            onChangeText={(text) => { setSearch(text); setPage(1); }}
            leftIcon="search"
            style={styles.searchInput}
          />

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Tipo</Text>
            <View style={styles.filterButtons}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => { setTypeFilter(t); setPage(1); }}
                  style={[styles.filterButton, typeFilter === t && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterButtonText, typeFilter === t && styles.filterButtonTextActive]}>
                    {t === 'ALL' ? 'Todos' : TX_CONFIG[t]?.label || t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Estado</Text>
            <View style={styles.filterButtons}>
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => { setStatusFilter(s); setPage(1); }}
                  style={[styles.filterButton, statusFilter === s && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterButtonText, statusFilter === s && styles.filterButtonTextActive]}>
                    {s === 'ALL' ? 'Todos' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Card padding="lg" style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>
            {loading ? 'Cargando...' : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
          </Text>

          {paginated.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="swap-horiz" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No se encontraron operaciones</Text>
              {hasFilters && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearLink}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <FlatList
                data={paginated}
                renderItem={renderTransactionCard}
                keyExtractor={(item) => item._id || `${item.movementType}-${item.date}`}
                scrollEnabled={false}
              />

              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    onPress={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
                  >
                    <MaterialIcons name="chevron-left" size={20} color={page === 1 ? theme.colors.textMuted : theme.colors.text} />
                  </TouchableOpacity>
                  
                  <Text style={styles.paginationText}>
                    Página {safePage} de {totalPages}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={[styles.paginationButton, page === totalPages && styles.paginationButtonDisabled]}
                  >
                    <MaterialIcons name="chevron-right" size={20} color={page === totalPages ? theme.colors.textMuted : theme.colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  filterCard: {
    marginBottom: theme.spacing.lg,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginLeft: 'auto',
  },
  clearFiltersText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  filterSectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  filterButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  resultsCard: {
    marginBottom: theme.spacing.lg,
  },
  resultsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  transactionCard: {
    marginBottom: theme.spacing.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  transactionMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  transactionDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  transactionAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  transactionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  clearLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    textDecorationLine: 'underline',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  paginationButton: {
    padding: theme.spacing.sm,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
});

export default TransactionSupportScreen;
