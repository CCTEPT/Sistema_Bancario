import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../shared/constants/theme';
import { useAuthStore } from '../store/authStore';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
import AccountsScreen from '../features/accounts/screens/AccountsScreen';
import UsersScreen from '../features/users/screens/UsersScreen';
import ChecksScreen from '../features/checks/screens/ChecksScreen';
import TransactionsScreen from '../features/transactions/screens/TransactionsScreen';
import EmployeeDashboardScreen from '../features/employee/screens/EmployeeDashboardScreen';
import ClientsScreen from '../features/employee/screens/ClientsScreen';
import CreateAccountScreen from '../features/employee/screens/CreateAccountScreen';
import EmployeeLoansScreen from '../features/employee/screens/EmployeeLoansScreen';
import TransactionSupportScreen from '../features/employee/screens/TransactionSupportScreen';
import DepositScreen from '../features/deposit/screens/DepositScreen';
import WithdrawScreen from '../features/withdraw/screens/WithdrawScreen';
import TransferScreen from '../features/transfer/screens/TransferScreen';
import ConvertScreen from '../features/convert/screens/ConvertScreen';

const Stack = createNativeStackNavigator();

const DRAWER_SECTIONS = [
  {
    title: 'Consultas',
    items: [
      { label: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
      { label: 'Cuentas', icon: 'account-balance', screen: 'Accounts' },
      { label: 'Usuarios', icon: 'people', screen: 'Users' },
      { label: 'Cheques', icon: 'description', screen: 'Checks' },
      { label: 'Movimientos', icon: 'receipt-long', screen: 'Transactions' },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Depositar', icon: 'add-circle-outline', screen: 'Deposit' },
      { label: 'Retirar', icon: 'remove-circle-outline', screen: 'Withdraw' },
      { label: 'Transferir', icon: 'swap-horiz', screen: 'Transfer' },
      { label: 'Convertir', icon: 'currency-exchange', screen: 'Convert' },
      { label: 'Prestamos', icon: 'account-balance-wallet', screen: 'Loans' },
    ],
  },
  {
    title: 'Empleado / Gestion',
    items: [
      { label: 'Panel empleado', icon: 'work', screen: 'EmployeeDashboard' },
      { label: 'Clientes', icon: 'group', screen: 'Clients' },
      { label: 'Abrir cuenta', icon: 'account-balance', screen: 'CreateAccount' },
      { label: 'Gestion prestamos', icon: 'request-quote', screen: 'EmployeeLoans' },
      { label: 'Soporte transaccional', icon: 'support-agent', screen: 'TransactionSupport' },
    ],
  },
  {
    title: 'Perfil',
    items: [
      { label: 'Editar perfil', icon: 'person', screen: 'Profile' },
    ],
  },
];

const STACK_SCREENS = [
  { name: 'Dashboard', title: 'Dashboard', component: EmployeeDashboardScreen },
  { name: 'Accounts', title: 'Cuentas', component: AccountsScreen },
  { name: 'Users', title: 'Usuarios', component: UsersScreen },
  { name: 'Checks', title: 'Cheques', component: ChecksScreen },
  { name: 'Transactions', title: 'Movimientos', component: TransactionsScreen },
  { name: 'Deposit', title: 'Depositar', component: DepositScreen },
  { name: 'Withdraw', title: 'Retirar', component: WithdrawScreen },
  { name: 'Transfer', title: 'Transferir', component: TransferScreen },
  { name: 'Convert', title: 'Convertir', component: ConvertScreen },
  { name: 'Loans', title: 'Prestamos', component: EmployeeLoansScreen },
  { name: 'EmployeeDashboard', title: 'Panel Empleado', component: EmployeeDashboardScreen },
  { name: 'Clients', title: 'Clientes', component: ClientsScreen },
  { name: 'CreateAccount', title: 'Abrir Cuenta', component: CreateAccountScreen },
  { name: 'EmployeeLoans', title: 'Gestion Prestamos', component: EmployeeLoansScreen },
  { name: 'TransactionSupport', title: 'Soporte Transaccional', component: TransactionSupportScreen },
  { name: 'Profile', title: 'Perfil', component: ProfileScreen },
];

const DrawerItem = ({ label, icon, onPress, isLogout = false, isActive = false }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.drawerItem,
      isActive && styles.activeDrawerItem,
      isLogout && styles.logoutItem,
    ]}
  >
    <MaterialIcons
      name={icon}
      size={22}
      color={isLogout ? theme.colors.danger : isActive ? theme.colors.primary : theme.colors.textSecondary}
      style={styles.drawerItemIcon}
    />
    <Text
      style={[
        styles.drawerItemLabel,
        isActive && styles.activeDrawerItemLabel,
        isLogout && styles.logoutItemLabel,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const CustomDrawerContent = ({ currentRoute, navigation, onClose }) => {
  const { user, logout } = useAuthStore();

  const handleNavigate = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={30} color={theme.colors.primary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.username || user?.email || 'Admin'}</Text>
            <Text style={styles.userRole}>{user?.role || 'ADMIN_ROLE'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.drawerContent}>
        {DRAWER_SECTIONS.map((section) => (
          <View key={section.title} style={styles.drawerSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <DrawerItem
                key={item.screen}
                label={item.label}
                icon={item.icon}
                isActive={currentRoute === item.screen}
                onPress={() => handleNavigate(item.screen)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <DrawerItem label="Cerrar sesion" icon="logout" onPress={handleLogout} isLogout />
      </View>
    </View>
  );
};

const AdminDrawer = () => {
  const { isAdmin } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Dashboard');
  const navigationRef = useRef(null);

  const screenOptions = useMemo(
    () =>
      ({ navigation }) => {
        navigationRef.current = navigation;

        return {
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMenuOpen(true)}
              style={styles.menuButton}
            >
              <MaterialIcons name="menu" size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        };
      },
    []
  );

  if (!isAdmin()) {
    return null;
  }

  return (
    <>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={screenOptions}
        screenListeners={{
          state: (event) => {
            const routes = event.data.state?.routes || [];
            const index = event.data.state?.index || 0;
            setCurrentRoute(routes[index]?.name || 'Dashboard');
          },
        }}
      >
        {STACK_SCREENS.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={{ title: screen.title }}
          />
        ))}
      </Stack.Navigator>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.drawerPanel}>
            <CustomDrawerContent
              currentRoute={currentRoute}
              navigation={navigationRef.current}
              onClose={() => setMenuOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  drawerPanel: {
    width: 300,
    maxWidth: '86%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  userRole: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  drawerContent: {
    flex: 1,
  },
  drawerSection: {
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  activeDrawerItem: {
    backgroundColor: `${theme.colors.primary}12`,
    borderLeftColor: theme.colors.primary,
  },
  drawerItemIcon: {
    marginRight: theme.spacing.md,
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  activeDrawerItemLabel: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutItemLabel: {
    color: theme.colors.danger,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default AdminDrawer;
