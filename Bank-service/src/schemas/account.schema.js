export const createAccountSchema = {
  description: 'Crear una nueva cuenta bancaria',
  body: {
    type: 'object',
    required: ['tipoCuenta'],
    properties: {
      tipoCuenta: {
        type: 'string',
        enum: ['ahorro', 'corriente'],
        description: 'Tipo de cuenta a crear (Ahorro o Corriente)'
      },
      divisa: {
        type: 'string',
        enum: ['GTQ', 'USD', 'EUR'],
        default: 'GTQ',
        description: 'Moneda de la cuenta (Quetzales, Dólares, Euros)'
      }
    }
  },
  response: {
    201: {
      description: 'Cuenta creada exitosamente',
      type: 'object',
      properties: {
        message: { type: 'string' },
        account: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID único de la cuenta' },
            idUsuario: { type: 'string', description: 'ID del usuario propietario' },
            tipoCuenta: { type: 'string' },
            divisa: { type: 'string' },
            saldo: { type: 'number' },
            estado: { type: 'string' },
            fechaCreacion: { type: 'string', format: 'date-time' }
          }
        }
      },
      example: {
        message: 'Cuenta creada correctamente',
        account: {
          _id: '507f1f77bcf86cd799439011',
          idUsuario: '507f1f77bcf86cd799439012',
          tipoCuenta: 'ahorro',
          divisa: 'GTQ',
          saldo: 0,
          estado: 'ACTIVE',
          fechaCreacion: '2026-04-21T10:30:00Z'
        }
      }
    },
    400: {
      description: 'Datos inválidos',
      type: 'object',
      example: { error: 'El tipo de cuenta es requerido' }
    },
    401: {
      description: 'No autorizado',
      type: 'object',
      example: { error: 'Token inválido' }
    },
    500: {
      description: 'Error del servidor',
      type: 'object',
      example: { message: 'Error interno del servidor' }
    }
  }
}

export const getAccountsSchema = {
  description: 'Obtener listado de todas las cuentas',
  response: {
    200: {
      description: 'Listado de cuentas obtenido',
      type: 'object',
      properties: {
        message: { type: 'string' },
        accounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              idUsuario: { type: 'string' },
              tipoCuenta: { type: 'string' },
              divisa: { type: 'string' },
              saldo: { type: 'number' },
              estado: { type: 'string' },
              fechaCreacion: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      example: {
        message: 'Listado de Cuentas',
        accounts: [
          {
            _id: '507f1f77bcf86cd799439011',
            idUsuario: '507f1f77bcf86cd799439012',
            tipoCuenta: 'ahorro',
            divisa: 'GTQ',
            saldo: 5000,
            estado: 'ACTIVE',
            fechaCreacion: '2026-04-20T10:30:00Z'
          }
        ]
      }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    }
  }
}

export const getAccountByIdSchema = {
  description: 'Obtener detalles de una cuenta específica por ID',
  params: {
    type: 'object',
    required: ['idCuenta'],
    properties: {
      idCuenta: {
        type: 'string',
        description: 'ID único de la cuenta'
      }
    }
  },
  response: {
    200: {
      description: 'Detalle de la cuenta',
      type: 'object',
      properties: {
        message: { type: 'string' },
        account: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            idUsuario: { type: 'string' },
            tipoCuenta: { type: 'string' },
            divisa: { type: 'string' },
            saldo: { type: 'number' },
            estado: { type: 'string' },
            fechaCreacion: { type: 'string', format: 'date-time' }
          }
        }
      },
      example: {
        message: 'Detalle de cuenta',
        account: {
          _id: '507f1f77bcf86cd799439011',
          idUsuario: '507f1f77bcf86cd799439012',
          tipoCuenta: 'ahorro',
          divisa: 'GTQ',
          saldo: 5000,
          estado: 'ACTIVE',
          fechaCreacion: '2026-04-20T10:30:00Z'
        }
      }
    },
    403: {
      description: 'Acceso prohibido - No eres propietario de esta cuenta',
      example: { error: 'No tienes permiso para ver esta cuenta' }
    },
    404: {
      description: 'Cuenta no encontrada',
      example: { error: 'Cuenta no encontrada' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    }
  }
}