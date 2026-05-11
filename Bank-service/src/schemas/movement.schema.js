export const depositSchema = {
  description: 'Realizar un depósito en una cuenta',
  body: {
    type: 'object',
    required: ['accountId', 'amount'],
    examples: [
      {
        accountId: '507f1f77bcf86cd799439011',
        amount: 10000,
        description: 'Depósito en efectivo',
        channel: 'CASHIER'
      }
    ],
    properties: {
      accountId: {
        type: 'string',
        description: 'ID de la cuenta receptora del depósito'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        description: 'Monto a depositar (debe ser mayor a 0.01)'
      },
      description: {
        type: 'string',
        description: 'Descripción del depósito'
      },
      idempotencyKey: {
        type: 'string',
        description: 'Opcional. Clave para evitar duplicados en reintentos'
      },
      channel: {
        type: 'string',
        enum: ['CASHIER', 'ATM', 'APP', 'INTERNAL_TRANSFER'],
        description: 'Canal por el cual se realiza el depósito'
      }
    }
  },
  response: {
    201: {
      description: 'Depósito realizado exitosamente',
      type: 'object',
      example: {
        message: 'Depósito realizado correctamente',
        movement: {
          _id: '507f1f77bcf86cd799439015',
          account: '507f1f77bcf86cd799439011',
          type: 'DEPOSIT',
          amount: 1500.50,
          description: 'Depósito de nómina',
          channel: 'CASHIER',
          balance: 6500.50,
          timestamp: '2026-04-21T10:30:00Z'
        }
      }
    },
    400: {
      description: 'Datos inválidos o fondos insuficientes',
      example: { error: 'El monto debe ser mayor a 0.01' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Cuenta no encontrada',
      example: { error: 'Cuenta no encontrada' }
    }
  }
}

export const withdrawSchema = {
  description: 'Realizar un retiro de una cuenta',
  body: {
    type: 'object',
    required: ['accountId', 'amount'],
    properties: {
      accountId: {
        type: 'string',
        description: 'ID de la cuenta de donde se retira'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        description: 'Monto a retirar (debe ser mayor a 0.01)'
      },
      description: {
        type: 'string',
        description: 'Descripción del retiro'
      },
      channel: {
        type: 'string',
        enum: ['CASHIER', 'ATM', 'APP'],
        description: 'Canal por el cual se realiza el retiro'
      }
    }
  },
  response: {
    201: {
      description: 'Retiro realizado exitosamente',
      type: 'object',
      example: {
        message: 'Retiro realizado correctamente',
        movement: {
          _id: '507f1f77bcf86cd799439016',
          account: '507f1f77bcf86cd799439011',
          type: 'WITHDRAWAL',
          amount: 500,
          description: 'Retiro en efectivo',
          channel: 'ATM',
          balance: 6000.50,
          timestamp: '2026-04-21T10:35:00Z'
        }
      }
    },
    400: {
      description: 'Fondos insuficientes o datos inválidos',
      example: { error: 'Fondos insuficientes para realizar el retiro' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    403: {
      description: 'Sin permisos para realizar retiro',
      example: { error: 'Solo clientes pueden realizar retiros' }
    }
  }
}

export const transferSchema = {
  description: 'Realizar una transferencia entre cuentas',
  body: {
    type: 'object',
    required: ['sourceAccount', 'destinationAccount', 'amount'],
    properties: {
      sourceAccount: {
        type: 'string',
        description: 'ID de la cuenta origen'
      },
      destinationAccount: {
        type: 'string',
        description: 'NÃºmero de cuenta destino'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        description: 'Monto a transferir'
      },
      description: {
        type: 'string',
        description: 'Concepto de la transferencia'
      },
      channel: {
        type: 'string',
        enum: ['CASHIER', 'ATM', 'APP', 'INTERNAL_TRANSFER'],
        description: 'Canal por el cual se realiza la transferencia'
      }
    }
  },
  response: {
    201: {
      description: 'Transferencia realizada exitosamente',
      type: 'object',
      example: {
        message: 'Transferencia realizada correctamente',
        transfer: {
          _id: '507f1f77bcf86cd799439017',
          sourceAccount: '507f1f77bcf86cd799439011',
          destinationAccount: '507f1f77bcf86cd799439012',
          amount: 250,
          description: 'Pago de servicios',
          channel: 'APP',
          status: 'COMPLETED',
          timestamp: '2026-04-21T10:40:00Z'
        }
      }
    },
    400: {
      description: 'Datos inválidos o fondos insuficientes',
      example: { error: 'Fondos insuficientes en la cuenta origen' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Cuenta no encontrada',
      example: { error: 'Cuenta destino no encontrada' }
    }
  }
}

export const historySchema = {
  description: 'Obtener historial de movimientos de una cuenta',
  params: {
    type: 'object',
    required: ['accountId'],
    properties: {
      accountId: {
        type: 'string',
        description: 'ID de la cuenta'
      }
    }
  },
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        default: 50,
        description: 'Cantidad máxima de registros a obtener'
      },
      skip: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Cantidad de registros a saltar (para paginación)'
      }
    }
  },
  response: {
    200: {
      description: 'Historial de movimientos obtenido',
      type: 'object',
      example: {
        message: 'Historial de movimientos',
        total: 25,
        limit: 50,
        skip: 0,
        movements: [
          {
            _id: '507f1f77bcf86cd799439020',
            account: '507f1f77bcf86cd799439011',
            type: 'DEPOSIT',
            amount: 1500.50,
            description: 'Depósito de nómina',
            balance: 6500.50,
            timestamp: '2026-04-21T10:30:00Z'
          },
          {
            _id: '507f1f77bcf86cd799439019',
            account: '507f1f77bcf86cd799439011',
            type: 'WITHDRAWAL',
            amount: 500,
            description: 'Retiro en efectivo',
            balance: 6000.50,
            timestamp: '2026-04-21T10:35:00Z'
          }
        ]
      }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Cuenta no encontrada',
      example: { error: 'Cuenta no encontrada' }
    }
  }
}
