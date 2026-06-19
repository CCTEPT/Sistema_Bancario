export const ENDPOINTS = {
  AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:5500',
  BANK_SERVICE_URL: process.env.EXPO_PUBLIC_BANK_SERVICE_URL || 'http://localhost:3000',
  FINANCIAL_SERVICE_URL: process.env.EXPO_PUBLIC_FINANCIAL_SERVICE_URL || 'http://localhost:4000',
};

export default ENDPOINTS;
