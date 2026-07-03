import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserMovements } from '../../../shared/api/bankClient';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import Badge from '../../../shared/components/common/Badge';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const TYPE_CONFIG = {
  DEPOSIT: {
    label: 'Depósito',
    icon: 'arrow-downward',
    iconBg: `${theme.colors.success}20`,
    iconColor: theme.colors.success,
    amountColor: theme.colors.success,
    prefix: '+',
  },
  WITHDRAW: {
    label: 'Retiro',
    icon: 'arrow-upward',
    iconBg: `${theme.colors.danger}20`,
    iconColor: theme.colors.danger,
    amountColor: theme.colors.danger,
    prefix: '-',
  },
  TRANSFER_OUT: {
    label: 'Transferencia enviada',
    icon: 'swap-horiz',
    iconBg: `${theme.colors.info}20`,
    iconColor: theme.colors.info,
    amountColor: theme.colors.danger,
    prefix: '-',
  },
  TRANSFER_IN: {
    label: 'Transferencia recibida',
    icon: 'swap-horiz',
    iconBg: `${theme.colors.info}20`,
    iconColor: theme.colors.info,
    amountColor: theme.colors.success,
    prefix: '+',
  },
  CHECK_CASH: {
    label: 'Cheque cobrado',
    icon: 'description',
    iconBg: `${theme.colors.purple}20`,
    iconColor: theme.colors.purple,
    amountColor: theme.colors.success,
    prefix: '+',
  },
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
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleString('es-GT');
};

const UserTransactionsScreen = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadMovements();
  }, []);

  useEffect(() => {
    filterMovements();
  }, [movements, searchText, typeFilter]);

  const loadMovements = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getUserMovements({ limit: 20, page: pageNum });
      const newMovements = response.movements || [];

      if (append) {
        setMovements((prev) => [...prev, ...newMovements]);
      } else {
        setMovements(newMovements);
      }

      setHasMore(newMovements.length >= 20);
      setPage(pageNum);
    } catch (err) {
      Alert.alert('Error', err.message || 'No fue posible cargar los movimientos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterMovements = () => {
    let filtered = movements;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((m) => {
        const ref = (m.reference || '').toLowerCase();
        const account = (m.accountNumber || '').toLowerCase();
        return ref.includes(searchLower) || account.includes(searchLower);
      });
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.movementType === typeFilter);
    }

    setFilteredMovements(filtered);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadMovements(page + 1, true);
    }
  };

  const renderMovementItem = ({ item }) => {
    const config = TYPE_CONFIG[item.movementType] || {
      label: item.movementType,
      icon: 'receipt',
      iconBg: `${theme.colors.textMuted}20`,
      iconColor: theme.colors.textMuted,
      amountColor: theme.colors.text,
      prefix: '',
    };

    return (
      <Card padding="md" style={styles.movementCard}>
        <View style={styles.movementHeader}>
          <View style={[styles.movementIcon, { backgroundColor: config.iconBg }]}>
            <MaterialIcons name={config.icon} size={20} color={config.iconColor} />
          </View>
          <View style={styles.movementInfo}>
            <Text style={styles.movementType}>{config.label}</Text>
            <Text style={styles.movementMeta}>
              {item.accountNumber || 'Cuenta'} · {formatDate(item.date || item.createdAt)}
            </Text>
            {item.reference && (
              <Text style={styles.movementRef}>Ref: {item.reference}</Text>
            )}
          </View>
          <Text style={[styles.movementAmount, { color: config.amountColor }]}>
            {config.prefix}{formatMoney(item.amount, item.currency || 'GTQ')}
          </Text>
        </View>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingSpinner text="Cargando más..." />;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando transacciones..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transacciones</Text>
        <Text style={styles.subtitle}>Historial completo de tus movimientos</Text>

        <Input
          placeholder="Buscar por referencia o cuenta"
          value={searchText}
          onChangeText={setSearchText}
          leftIcon="search"
          style={styles.searchInput}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por tipo:</Text>
          <View style={styles.filterButtons}>
            <Button
              title="Todos"
              onPress={() => setTypeFilter('all')}
              variant={typeFilter === 'all' ? 'primary' : 'secondary'}
              size="small"
            />
            <Button
              title="Ingresos"
              onPress={() => setTypeFilter('income')}
              variant={typeFilter === 'income' ? 'primary' : 'secondary'}
              size="small"
            />
            <Button
              title="Egresos"
              onPress={() => setTypeFilter('expense')}
              variant={typeFilter === 'expense' ? 'primary' : 'secondary'}
              size="small"
            />
          </View>
        </View>

        {filteredMovements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No se encontraron transacciones</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMovements}
            renderItem={renderMovementItem}
            keyExtractor={(item, index) => `${item._id || index}`}
            scrollEnabled={false}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
          />
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
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  filterContainer: {
    marginBottom: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  movementCard: {
    marginBottom: theme.spacing.sm,
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  movementInfo: {
    flex: 1,
  },
  movementType: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  movementMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  movementRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  movementAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});

export default UserTransactionsScreen;
