import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import { getStoredToken, setStoredToken, notifyUnauthorized } from './httpClient';

const axiosFinancial = axios.create({
  baseURL: ENDPOINTS.FINANCIAL_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosFinancial.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired/invalid tokens
axiosFinancial.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await setStoredToken(null);
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export async function getCurrencies() {
  const { data } = await axiosFinancial.get('/currencies');
  return data;
}

export async function getExchangeRates() {
  const { data } = await axiosFinancial.get('/exchange/rates');
  return data;
}

export async function getExchangeRate(from, to) {
  const { data } = await axiosFinancial.get(`/exchange/rate/${from}/${to}`);
  return data;
}

export async function convertCurrency({ from, to, amount }) {
  const { data } = await axiosFinancial.post('/exchange/convert', {
    from,
    to,
    amount,
  });
  return data;
}

export async function setExchangeRate({ from, to, rate }) {
  const { data } = await axiosFinancial.post('/exchange/rate', {
    from,
    to,
    rate,
  });
  return data;
}

export { axiosFinancial };
