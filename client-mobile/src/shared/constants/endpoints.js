import { Platform } from "react-native";
import API_CONFIG from "../config/apiConfig";

// Para iOS física: Cambiar 'localhost' en src/shared/config/apiConfig.js
const localHost =
  Platform.OS === "android" ? "http://10.0.2.2" : "http://localhost";

export const ENDPOINTS = {
  AUTH_URL: API_CONFIG.AUTH_URL,
  BANK_SERVICE_URL: API_CONFIG.BANK_SERVICE_URL,
  FINANCIAL_SERVICE_URL: API_CONFIG.FINANCIAL_SERVICE_URL,
};

export default ENDPOINTS;
