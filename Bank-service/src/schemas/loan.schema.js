export const createLoanSchema = {
  description: 'Solicitar un préstamo',
  body: {
    type: 'object',
    required: ['accountId', 'amount', 'termMonths'],
    properties: {
      accountId: {
        type: 'string',
        description: 'ID (_id) de la cuenta donde se recibirá el desembolso'
      },
      amount: {
        type: 'number',
        minimum: 100,
        description: 'Monto del préstamo (mínimo 100)'
      },
      termMonths: {
        type: 'integer',
        enum: [6, 12, 24, 36],
        description: 'Plazo en meses'
      },
      description: {
        type: 'string',
        description: 'Propósito del préstamo (opcional)'
      }
    }
  }
}

export const rejectLoanSchema = {
  body: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Motivo del rechazo (opcional)'
      }
    }
  }
}