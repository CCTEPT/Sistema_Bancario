 export const createAccountSchema = {
  body: {
    type: 'object',
    required: ['tipoCuenta', 'divisa'],
    properties: {
      tipoCuenta: {
        type: 'string',
        enum: ['ahorro', 'corriente']
      },
      divisa: {
        type: 'string',
        enum: ['GTQ', 'USD', 'EUR']
      }
    }
  }
}