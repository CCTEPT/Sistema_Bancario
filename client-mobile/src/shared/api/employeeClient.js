import { axiosAuth } from './authClient';
import { axiosBank } from './bankClient';
import { getStoredToken } from './httpClient';

// Add token interceptor to axiosBank if not already added
if (!axiosBank.interceptors.request.handlers.length) {
  axiosBank.interceptors.request.use(
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
}

export async function getClients() {
  const { data } = await axiosAuth.get('/User/by-role/USER_ROLE');
  return { clients: Array.isArray(data) ? data : data.users || [] };
}

export async function getClientAccounts(userId) {
  const { data } = await axiosBank.get('/accounts/manage');
  const all = data.accounts || (Array.isArray(data) ? data : []);
  const filtered = all.filter(a => a.idUsuario === userId);
  return { accounts: filtered };
}

export async function createAccountForClient({ idUsuario, numeroCuenta, tipoCuenta, divisa }) {
  const { data } = await axiosBank.post('/accounts', {
    idUsuario,
    numeroCuenta,
    tipoCuenta,
    divisa,
  });
  return data;
}

export async function getClientMovements(accountId, { limit = 50, skip = 0 } = {}) {
  const { data } = await axiosBank.get(`/movements/history/${accountId}`, {
    params: { limit, skip },
  });
  const movements = data.data || data.movements || (Array.isArray(data) ? data : []);
  return { movements };
}

export async function getAllMovements({ limit = 100, skip = 0, search = '' } = {}) {
  const { data } = await axiosBank.get('/movements/history', {
    params: { limit, skip, search },
  });
  return data;
}

export async function getLoans() {
  const { data } = await axiosBank.get('/loans');
  return { loans: data.loans || data || [] };
}

export async function approveLoan(loanId) {
  const { data } = await axiosBank.patch(`/loans/${loanId}/approve`);
  return data;
}

export async function rejectLoan(loanId, reason) {
  const { data } = await axiosBank.patch(`/loans/${loanId}/reject`, { reason });
  return data;
}
