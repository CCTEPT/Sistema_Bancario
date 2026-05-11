export const emitCheckSchema = {
  description: 'Emitir un cheque desde una cuenta',
  body: {
    type: 'object',
    required: ['issuingAccountId', 'amount'],
    properties: {
      issuingAccountId: {
        type: 'string',
        description: 'ID de la cuenta desde la cual se emite el cheque'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        description: 'Monto del cheque'
      }
    }
  },
  response: {
    201: {
      description: 'Cheque emitido exitosamente',
      type: 'object',
      example: {
        message: 'Check emitted successfully',
        checkId: '507f1f77bcf86cd799439025',
        check: {
          _id: '507f1f77bcf86cd799439025',
          checkNumber: 'CHK-0001234567',
          issuingAccount: '507f1f77bcf86cd799439011',
          amount: 5000,
          issuerUser: '507f1f77bcf86cd799439012',
          status: 'ACTIVE',
          issueDate: '2026-04-21T10:45:00Z',
          expiryDate: '2026-07-20T23:59:59Z'
        }
      }
    },
    400: {
      description: 'Datos inválidos',
      example: { error: 'Amount must be greater than zero' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Cuenta no encontrada',
      example: { error: 'Active account not found' }
    }
  }
}

export const cashCheckSchema = {
  description: 'Cobrar/Depositar un cheque',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'ID del cheque a cobrar'
      }
    }
  },
  body: {
    type: 'object',
    required: ['receivingAccountId'],
    properties: {
      receivingAccountId: {
        type: 'string',
        description: 'ID de la cuenta receptora del cheque'
      }
    }
  },
  response: {
    200: {
      description: 'Cheque cobrado exitosamente',
      type: 'object',
      example: {
        message: 'Check cashed successfully',
        movement: {
          _id: '507f1f77bcf86cd799439026',
          account: '507f1f77bcf86cd799439012',
          type: 'CHECK_RECEIVED',
          amount: 5000,
          checkId: '507f1f77bcf86cd799439025',
          balance: 11000,
          timestamp: '2026-04-21T10:50:00Z'
        }
      }
    },
    400: {
      description: 'Cheque inválido o ya fue cobrado',
      example: { error: 'Check has already been cashed' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Cheque o cuenta no encontrada',
      example: { error: 'Check not found' }
    }
  }
}

export const cashCheckByNumberSchema = {
  description: 'Cobrar/Depositar un cheque por numero',
  body: {
    type: 'object',
    required: ['checkNumber', 'receivingAccountId'],
    properties: {
      checkNumber: {
        type: 'string',
        description: 'Numero del cheque a cobrar'
      },
      receivingAccountId: {
        type: 'string',
        description: 'ID de la cuenta receptora del cheque'
      }
    }
  },
  response: cashCheckSchema.response
}
