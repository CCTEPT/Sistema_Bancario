export const depositSchema = {
  body: {
    type: 'object',
    required: ['accountId', 'amount'],
    properties: {
      accountId: { type: 'string' },
      amount: { type: 'number', minimum: 0.01 },
      description: { type: 'string' },
      idempotencyKey: { type: 'string' },
      channel: { type: 'string', enum: ['CASHIER', 'ATM', 'APP', 'INTERNAL_TRANSFER'] }
    }
  }
}

export const withdrawSchema = {
  body: {
    type: 'object',
    required: ['accountId', 'amount'],
    properties: {
      accountId: { type: 'string' },
      amount: { type: 'number', minimum: 0.01 },
      description: { type: 'string' },
      channel: { type: 'string', enum: ['CASHIER', 'ATM', 'APP'] }
    }
  }
}

export const transferSchema = {
  body: {
    type: 'object',
    required: ['sourceAccount', 'destinationAccount', 'amount'],
    properties: {
      sourceAccount: { type: 'string' },
      destinationAccount: { type: 'string' },
      amount: { type: 'number', minimum: 0.01 },
      description: { type: 'string' },
      channel: { type: 'string', enum: ['CASHIER', 'ATM', 'APP', 'INTERNAL_TRANSFER'] }
    }
  }
}

export const historySchema = {
  params: {
    type: 'object',
    required: ['accountId'],
    properties: {
      accountId: { type: 'string' }
    }
  },
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, default: 50 },
      skip: { type: 'integer', minimum: 0, default: 0 }
    }
  }
}
