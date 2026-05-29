import { axiosBank } from './api.js';

export async function getUserAccounts() {
  const { data } = await axiosBank.get('/accounts');
  return data;
}

export async function createBankAccount({ tipoCuenta, divisa }) {
  const { data } = await axiosBank.post('/accounts', {
    tipoCuenta,
    divisa,
  });
  return data;
}

export async function getAllAccounts() {
  const { data } = await axiosBank.get('/accounts/manage');
  return data;
}

export async function getAccountRequests() {
  const { data } = await axiosBank.get('/accounts/requests');
  return data;
}

export async function approveAccountRequest(requestId) {
  const { data } = await axiosBank.post(`/accounts/requests/${requestId}/approve`, {});
  return data;
}

export async function rejectAccountRequest(requestId, reason) {
  const { data } = await axiosBank.post(
    `/accounts/requests/${requestId}/reject`,
    { reason: reason || 'Solicitud rechazada por el administrador' }
  );
  return data;
}

export async function updateAccountStatus(accountId, estado) {
  const { data } = await axiosBank.patch(`/accounts/${accountId}/status`, { estado });
  return data;
}

export async function withdrawFromAccount({ accountId, amount, description, channel = 'APP' }) {
  const payload = {
    accountId,
    amount,
    channel,
  };

  if (description?.trim()) {
    payload.description = description.trim();
  }

  const { data } = await axiosBank.post('/movements/withdraw', payload);
  return data;
}

export async function depositToAccount({ accountId, amount, description, channel, idempotencyKey }) {
  const payload = {
    accountId,
    amount,
    channel,
    idempotencyKey,
  };

  if (description?.trim()) {
    payload.description = description.trim();
  }

  const { data } = await axiosBank.post('/movements/deposit', payload);
  return data;
}

export async function transferBetweenAccounts({ sourceAccount, destinationAccount, amount, description }) {
  const payload = {
    sourceAccount,
    destinationAccount,
    amount,
    channel: 'APP',
  };

  if (description?.trim()) {
    payload.description = description.trim();
  }

  const { data } = await axiosBank.post('/movements/transfer', payload);
  return data;
}

export async function getAccountMovements(accountId, { limit = 50, skip = 0 } = {}) {
  const { data } = await axiosBank.get(`/movements/history/${accountId}`, {
    params: { limit, skip },
  });
  return data;
}

export async function getUserMovements({ limit = 100, skip = 0 } = {}) {
  const { data } = await axiosBank.get('/movements/history', {
    params: { limit, skip },
  });
  return data;
}

export async function getChecks() {
  const { data } = await axiosBank.get('/checks');
  return data;
}

export async function issueCheck({ issuingAccountId, amount }) {
  const { data } = await axiosBank.post('/checks', {
    issuingAccountId,
    amount,
  });
  return data;
}

export async function cashCheck({ checkNumber, receivingAccountId }) {
  const { data } = await axiosBank.post('/checks/cash', {
    checkNumber,
    receivingAccountId,
  });
  return data;
}

export async function requestLoan({ accountId, amount, termMonths, description }) {
  const { data } = await axiosBank.post('/loans', {
    accountId,
    amount,
    termMonths,
    description,
  });
  return data;
}

export async function getUserLoans() {
  const { data } = await axiosBank.get('/loans');
  return data;
}

export async function payLoan({ loanId, accountId, amount }) {
  const { data } = await axiosBank.patch(`/loans/${loanId}/pay`, { accountId, amount })
  return data
}
