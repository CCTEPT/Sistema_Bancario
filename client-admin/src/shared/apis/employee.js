import { axiosAuth, axiosBank } from './api.js';

export async function getClients() {
  const { data } = await axiosAuth.get('/User/by-role/USER_ROLE');
  return { clients: Array.isArray(data) ? data : data.users || [] };
}

export async function getClientById(userId) {
  const { data } = await axiosAuth.get(`/User/${userId}`);
  return data;
}

export async function getClientAccounts(userId) {
  const { data } = await axiosBank.get(`/accounts/user/${userId}`);
  return { accounts: data.accounts || [] };
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
  return data;
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
