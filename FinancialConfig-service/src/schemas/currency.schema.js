export const currencySchema = {
  body: {
    type: 'object',
    required: ['code','name'],
    properties: {
      code: { type: 'string' },
      name: { type: 'string' },
      symbol: { type: 'string' }
    }
  }
}
