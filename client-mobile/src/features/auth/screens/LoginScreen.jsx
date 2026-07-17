import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../store/authStore";
import Input from "../../../shared/components/common/Input";
import Button from "../../../shared/components/common/Button";
import theme from "../../../shared/constants/theme";
import API_CONFIG from "../../../shared/config/apiConfig";
import { ENDPOINTS } from "../../../shared/constants/endpoints";

const ALLOWED_ROLES = ["ADMIN_ROLE", "EMPLOYEE_ROLE", "USER_ROLE"];

const LoginScreen = ({ navigation }) => {
  const { login, logout, loading, error } = useAuthStore();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const result = await login(data);

    if (!result.success) {
      Alert.alert("Error", result.error || "Error al iniciar sesión");
      return;
    }

    const role = useAuthStore.getState().role;

    if (!ALLOWED_ROLES.includes(role)) {
      await logout();
      Alert.alert("Acceso denegado", "Rol no autorizado para esta aplicación.");
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const enterDemo = (role) => {
    const user = DEMO_USERS[role];
    useAuthStore.setState({
      user,
      token: `demo-token-${role}`,
      isAuthenticated: true,
      isLoadingAuth: false,
      role,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../../../assets/novabank-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>NovaBank</Text>
            <Text style={styles.subtitle}>Iniciar sesión</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email o Username"
              placeholder="correo@example.com o username"
              control={control}
              name="emailOrUsername"
              rules={{ required: "Este campo es requerido" }}
              error={errors.emailOrUsername?.message}
              leftIcon="email"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              control={control}
              name="password"
              rules={{ required: "Este campo es requerido" }}
              error={errors.password?.message}
              secureTextEntry
              leftIcon="lock"
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {error.includes("timeout") && (
                  <Text style={styles.errorHint}>
                    Si usas iPhone fisico, actualiza MACHINE_IP en
                    src/shared/config/apiConfig.js con tu IP local
                  </Text>
                )}
              </View>
            )}

            <Button
              title={loading ? "Iniciando sesión..." : "Iniciar sesión"}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              size="large"
            />

            <View style={styles.authLinks}>
              <Text onPress={handleRegister} style={styles.link}>
                Crear cuenta
              </Text>
              <Text style={styles.linkSeparator}>·</Text>
              <Text onPress={handleForgotPassword} style={styles.link}>
                Olvidaste tu contraseña
              </Text>
              <Text style={styles.linkSeparator}>·</Text>
              <Text
                onPress={() => setShowDebugInfo(!showDebugInfo)}
                style={[styles.link, styles.debugLink]}
              >
                Debug
              </Text>
            </View>

            {showDebugInfo && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Informacion de Conexion:</Text>
                <Text style={styles.debugText}>Plataforma: {Platform.OS}</Text>
                <Text style={styles.debugText}>
                  API Auth: {ENDPOINTS.AUTH_URL}
                </Text>
                <Text style={styles.debugText}>
                  Bank: {ENDPOINTS.BANK_SERVICE_URL}
                </Text>
                <Text style={styles.debugText}>
                  Timeout: {API_CONFIG.REQUEST_TIMEOUT}ms
                </Text>
                {Platform.OS === "ios" && (
                  <Text style={styles.debugWarning}>
                    iPhone Fisico: Cambiar localhost a tu IP en apiConfig.js
                  </Text>
                )}
              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "#3d2626",
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
  errorHint: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.sm,
    fontStyle: "italic",
  },
  authLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
    flexWrap: "wrap",
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
    fontSize: theme.fontSize.sm,
    marginHorizontal: theme.spacing.xs,
  },
  linkSeparator: {
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },
  debugLink: {
    opacity: 0.6,
  },
  debugInfo: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: "#333",
  },
  debugTitle: {
    color: theme.colors.primary,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
  },
  debugText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  debugWarning: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.sm,
    fontWeight: "bold",
  },
  demoSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  demoTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    fontStyle: "italic",
  },
  demoButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-around",
  },
});

export default LoginScreen;
