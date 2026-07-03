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
import UserAccountsScreen from '../features/user/screens/UserAccountsScreen';
import UserTransactionsScreen from '../features/user/screens/UserTransactionsScreen';
import UserTransferScreen from '../features/user/screens/UserTransferScreen';
import UserDepositScreen from '../features/user/screens/UserDepositScreen';
import UserWithdrawScreen from '../features/user/screens/UserWithdrawScreen';
import UserConvertScreen from '../features/user/screens/UserConvertScreen';
import UserChecksScreen from '../features/user/screens/UserChecksScreen';
import UserLoansScreen from '../features/user/screens/UserLoansScreen';
import UserDashboardScreen from '../features/user/screens/UserDashboardScreen';

const Stack = createNativeStackNavigator();

const USER_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: 'dashboard', screen: 'UserDashboard' },
      { label: 'Mis Cuentas', icon: 'account-balance', screen: 'UserAccounts' },
      { label: 'Transacciones', icon: 'receipt-long', screen: 'UserTransactions' },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Transferir', icon: 'swap-horiz', screen: 'UserTransfer' },
      { label: 'Depositar', icon: 'add-circle-outline', screen: 'UserDeposit' },
      { label: 'Retirar', icon: 'remove-circle-outline', screen: 'UserWithdraw' },
      { label: 'Convertir', icon: 'currency-exchange', screen: 'UserConvert' },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { label: 'Cheques', icon: 'description', screen: 'UserChecks' },
      { label: 'Préstamos', icon: 'account-balance-wallet', screen: 'UserLoans' },
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
  { name: 'UserDashboard', title: 'Dashboard', component: UserDashboardScreen },
  { name: 'UserAccounts', title: 'Mis Cuentas', component: UserAccountsScreen },
  { name: 'UserTransactions', title: 'Transacciones', component: UserTransactionsScreen },
  { name: 'UserTransfer', title: 'Transferir', component: UserTransferScreen },
  { name: 'UserDeposit', title: 'Depositar', component: UserDepositScreen },
  { name: 'UserWithdraw', title: 'Retirar', component: UserWithdrawScreen },
  { name: 'UserConvert', title: 'Convertir', component: UserConvertScreen },
  { name: 'UserChecks', title: 'Cheques', component: UserChecksScreen },
  { name: 'UserLoans', title: 'Préstamos', component: UserLoansScreen },
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
            <Text style={styles.userName}>{user?.username || user?.email || 'Usuario'}</Text>
            <Text style={styles.userRole}>Cliente</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.drawerContent}>
        {USER_SECTIONS.map((section) => (
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
        <DrawerItem label="Cerrar sesión" icon="logout" onPress={handleLogout} isLogout />
      </View>
    </View>
  );
};

const UserDrawer = () => {
  const { isUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('UserDashboard');
  const navigationRef = useRef(null);

  const screenOptions = useMemo(
    () =>
      ({ navigation }) => {
        navigationRef.current = navigation;

        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
            height: 92,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: theme.colors.text,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeftContainerStyle: {
            paddingLeft: 16,
            paddingTop: 18,
            paddingBottom: 8,
            justifyContent: 'center',
            alignItems: 'center',
          },
          headerLeft: () => (
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
              onPress={() => {
                console.log('UserDrawer: abrir menú');
                setMenuOpen(true);
              }}
              style={styles.menuButton}
              hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            >
              <MaterialIcons name="menu" size={28} color={theme.colors.primary} />
            </Pressable>
          ),
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        };
      },
    []
  );

  if (!isUser()) {
    return null;
  }

  return (
    <>
      <Stack.Navigator
        initialRouteName="UserDashboard"
        screenOptions={screenOptions}
        screenListeners={{
          state: (event) => {
            const routes = event.data.state?.routes || [];
            const index = event.data.state?.index || 0;
            setCurrentRoute(routes[index]?.name || 'UserDashboard');
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
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              console.log('UserDrawer: cerrar menú (backdrop)');
              setMenuOpen(false);
            }}
          />
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
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    padding: 10,
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

export default UserDrawer;
