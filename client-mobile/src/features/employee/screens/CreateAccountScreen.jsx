import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getClients, createAccountForClient } from '../../../shared/api/employeeClient';
import { getApiErrorMessage } from '../../../shared/utils/apiErrorMessage';
import Card from '../../../shared/components/common/Card';
import Button from '../../../shared/components/common/Button';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import Input from '../../../shared/components/common/Input';
import theme from '../../../shared/constants/theme';

const ACCOUNT_TYPES = [
  { value: 'ahorro', label: 'Ahorro' },
  { value: 'corriente', label: 'Corriente' },
];

const CURRENCIES = [
  { code: 'GTQ', name: 'Quetzal guatemalteco' },
  { code: 'USD', name: 'Dolar estadounidense' },
  { code: 'EUR', name: 'Euro' },
];

const generateAccountNumber = () => {
  const digits = Math.floor(Math.random() * 1_000_000_000_000).toString().padStart(12, '0');
  return `NB${digits}`;
};

const CreateAccountScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [tipoCuenta, setTipoCuenta] = useState('ahorro');
  const [divisa, setDivisa] = useState('GTQ');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const response = await getClients();
      const list = Array.isArray(response?.clients) ? response.clients : Array.isArray(response) ? response : [];
      setClients(list);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al cargar clientes');
    } finally {
      setClientsLoading(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return true;
    const name = `${c.name || ''} ${c.surname || ''}`.toLowerCase();
    const username = (c.username || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    return name.includes(q) || username.includes(q) || email.includes(q);
  });

  const handleCreate = async () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Selecciona un cliente primero');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAccountForClient({
        idUsuario: selectedClient.id || selectedClient._id,
        numeroCuenta: generateAccountNumber(),
        tipoCuenta,
        divisa,
      });
      setSuccess(result);
      Alert.alert('Éxito', 'Cuenta creada correctamente');
      setSelectedClient(null);
      setClientSearch('');
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al crear la cuenta'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Card padding="lg" style={styles.successCard}>
            <View style={styles.successContent}>
              <MaterialIcons name="check-circle" size={48} color={theme.colors.success} />
              <Text style={styles.successTitle}>Cuenta creada exitosamente</Text>
              {success.account?.numeroCuenta && (
                <Text style={styles.accountNumber}>
                  Número de cuenta: {success.account.numeroCuenta}
                </Text>
              )}
              <Button
                title="Crear otra cuenta"
                onPress={() => setSuccess(null)}
                variant="primary"
                style={styles.successButton}
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
        <Text style={styles.title}>Abrir cuenta bancaria</Text>
        <Text style={styles.subtitle}>Crea una cuenta bancaria para un cliente existente</Text>

        <Card padding="lg" style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar cliente</Text>
          
          <Input
            placeholder="Buscar cliente..."
            value={clientSearch}
            onChangeText={setClientSearch}
            leftIcon="search"
            style={styles.searchInput}
          />

          <View style={styles.clientsList}>
            {clientsLoading ? (
              <LoadingSpinner text="Cargando clientes..." />
            ) : filteredClients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-search" size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Sin resultados</Text>
              </View>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id || selectedClient?._id === client._id;
                return (
                  <TouchableOpacity
                    key={client.id || client._id}
                    style={[styles.clientItem, isSelected && styles.clientItemSelected]}
                    onPress={() => setSelectedClient(client)}
                  >
                    <View style={styles.clientInfo}>
                      <MaterialIcons name="person" size={20} color={isSelected ? theme.colors.primary : theme.colors.textMuted} />
                      <View style={styles.clientDetails}>
                        <Text style={[styles.clientName, isSelected && styles.clientNameSelected]}>
                          {[client.name, client.surname].filter(Boolean).join(' ') || client.username}
                        </Text>
                        <Text style={styles.clientUsername}>@{client.username}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Card>

        <Card padding="lg" style={styles.section}>
          <Text style={styles.sectionTitle}>Configurar cuenta</Text>

          {!selectedClient ? (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="person-outline" size={32} color={theme.colors.textMuted} />
              <Text style={styles.placeholderText}>Selecciona un cliente para continuar</Text>
            </View>
          ) : (
            <>
              <View style={styles.selectedClient}>
                <MaterialIcons name="account-circle" size={20} color={theme.colors.primary} />
                <View style={styles.selectedClientInfo}>
                  <Text style={styles.selectedClientName}>
                    {[selectedClient.name, selectedClient.surname].filter(Boolean).join(' ') || selectedClient.username}
                  </Text>
                  <Text style={styles.selectedClientUsername}>@{selectedClient.username}</Text>
                  {selectedClient.email && (
                    <Text style={styles.selectedClientEmail}>{selectedClient.email}</Text>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de cuenta</Text>
                <View style={styles.optionsContainer}>
                  {ACCOUNT_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      title={type.label}
                      onPress={() => setTipoCuenta(type.value)}
                      variant={tipoCuenta === type.value ? 'primary' : 'secondary'}
                      size="small"
                      style={styles.optionButton}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Divisa</Text>
                <View style={styles.optionsContainer}>
                  {CURRENCIES.map((currency) => (
                    <Button
                      key={currency.code}
                      title={currency.code}
                      onPress={() => setDivisa(currency.code)}
                      variant={divisa === currency.code ? 'primary' : 'secondary'}
                      size="small"
                      style={styles.optionButton}
                    />
                  ))}
                </View>
              </View>

              <Button
                title="Crear cuenta"
                onPress={handleCreate}
                loading={submitting}
                variant="primary"
                size="large"
                style={styles.submitButton}
              />
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  clientsList: {
    maxHeight: 300,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  clientItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  clientName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clientNameSelected: {
    color: theme.colors.primary,
  },
  clientUsername: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: `${theme.colors.textMuted}10`,
    borderRadius: theme.borderRadius.md,
  },
  placeholderText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  selectedClient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  selectedClientInfo: {
    flex: 1,
  },
  selectedClientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  selectedClientUsername: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  selectedClientEmail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  successCard: {
    marginTop: theme.spacing.lg,
  },
  successContent: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  accountNumber: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  successButton: {
    marginTop: theme.spacing.lg,
  },
});

export default CreateAccountScreen;
