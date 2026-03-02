export const createAccountSchema = {
  body: {
    type: 'object',
    required: ['tipoCuenta'],
    properties: {
      tipoCuenta: {
        type: 'string',
        enum: ['ahorro', 'corriente']
      },
      divisa: {
        type: 'string',
        enum: ['GTQ', 'USD', 'EUR'],
        default: 'GTQ'
      }
    }
  }
}