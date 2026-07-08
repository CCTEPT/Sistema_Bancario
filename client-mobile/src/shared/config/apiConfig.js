import { Platform } from "react-native";

/**
 * Configuración dinámica de APIs para diferentes ambientes
 *
 * Para iOS física: Reemplaza 'localhost' con la IP de tu máquina
 * Ejemplo: http://192.168.1.100:5092
 */

// IMPORTANTE: Cambia esto a la IP de tu máquina si usas dispositivo físico
const MACHINE_IP = "192.168.1.14"; // Tu IP actual

const isDevelopment = __DEV__; // Si es ambiente de desarrollo con Metro

const getBaseUrl = () => {
  if (Platform.OS === "android") {
    // Android emulator usa 10.0.2.2 para acceder a localhost del host
    return isDevelopment ? "http://10.0.2.2" : `http://${MACHINE_IP}`;
  } else if (Platform.OS === "ios") {
    // iOS físico: Cambiar MACHINE_IP arriba
    // iOS emulator: localhost funciona
    return isDevelopment ? "http://localhost" : `http://${MACHINE_IP}`;
  }
  return "http://localhost";
};

export const API_CONFIG = {
  AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL || `${getBaseUrl()}:5092/api/v1`,

  BANK_SERVICE_URL:
    process.env.EXPO_PUBLIC_BANK_SERVICE_URL || `${getBaseUrl()}:3000/api`,

  FINANCIAL_SERVICE_URL:
    process.env.EXPO_PUBLIC_FINANCIAL_SERVICE_URL || `${getBaseUrl()}:4000/api`,

  // Timeouts (ms)
  REQUEST_TIMEOUT: 30000, // 30 segundos
  LONG_REQUEST_TIMEOUT: 60000, // 60 segundos para uploads
};

console.log("API Config:", {
  platform: Platform.OS,
  isDev: isDevelopment,
  baseUrl: getBaseUrl(),
  authUrl: API_CONFIG.AUTH_URL,
});

export default API_CONFIG;
