import axios from "axios";
import * as SecureStore from "expo-secure-store";
import API_CONFIG from "../config/apiConfig";

const TOKEN_KEY = "banking_token";

export const getStoredToken = async () => {
  try {
    const localToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (localToken) return localToken;
    return null;
  } catch (error) {
    console.error("Error getting stored token:", error);
    return null;
  }
};

export const setStoredToken = async (token) => {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error setting stored token:", error);
  }
};

export const httpClient = axios.create({
  timeout: API_CONFIG.REQUEST_TIMEOUT, // Usando config centralizada
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
httpClient.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      await setStoredToken(null);
      // You can trigger a logout here if needed
    }
    return Promise.reject(error);
  },
);

export default httpClient;
