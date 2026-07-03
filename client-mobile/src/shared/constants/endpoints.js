import { Platform } from 'react-native';

const localHost = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost';

export const ENDPOINTS = {
  AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL || `${localHost}:5092/api/v1`,
  BANK_SERVICE_URL: process.env.EXPO_PUBLIC_BANK_SERVICE_URL || `${localHost}:3000/api`,
  FINANCIAL_SERVICE_URL: process.env.EXPO_PUBLIC_FINANCIAL_SERVICE_URL || `${localHost}:4000/api`,
};

export default ENDPOINTS;
