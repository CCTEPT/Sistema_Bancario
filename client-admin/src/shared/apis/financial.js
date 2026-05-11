import { axiosFinancial } from './api.js';

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
