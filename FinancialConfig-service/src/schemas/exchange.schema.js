export const rateSchema = {
  description: 'Crear o actualizar una tasa de cambio entre dos monedas',
  body: {
    type: 'object',
    required: ['from', 'to', 'rate'],
    properties: {
      from: {
        type: 'string',
        description: 'Código ISO de la moneda origen (ej: USD, EUR, GTQ)'
      },
      to: {
        type: 'string',
        description: 'Código ISO de la moneda destino (ej: USD, EUR, GTQ)'
      },
      rate: {
        type: 'number',
        minimum: 0,
        description: 'Tasa de cambio (cuántas unidades de "to" equivalen a 1 unidad de "from")'
      }
    }
  },
  response: {
    201: {
      description: 'Tasa de cambio creada/actualizada exitosamente',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        from: 'USD',
        to: 'GTQ',
        rate: 7.85,
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T10:30:00Z'
      }
    },
    400: {
      description: 'Datos inválidos',
      example: { error: 'La tasa de cambio debe ser mayor a 0' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    }
  }
}

export const convertSchema = {
  description: 'Convertir un monto de una moneda a otra usando las tasas de cambio actuales',
  body: {
    type: 'object',
    required: ['from', 'to', 'amount'],
    properties: {
      from: {
        type: 'string',
        description: 'Código ISO de la moneda origen'
      },
      to: {
        type: 'string',
        description: 'Código ISO de la moneda destino'
      },
      amount: {
        type: 'number',
        minimum: 0,
        description: 'Monto a convertir'
      }
    }
  },
  response: {
    200: {
      description: 'Conversión realizada exitosamente',
      type: 'object',
      example: {
        converted: 785.00
      }
    },
    400: {
      description: 'Datos inválidos o tasa de cambio no encontrada',
      example: { error: 'Tasa de cambio no encontrada para USD a GTQ' }
    }
  }
}

export const getRateSchema = {
  description: 'Obtener la tasa de cambio específica entre dos monedas',
  params: {
    type: 'object',
    required: ['from', 'to'],
    properties: {
      from: {
        type: 'string',
        description: 'Código ISO de la moneda origen'
      },
      to: {
        type: 'string',
        description: 'Código ISO de la moneda destino'
      }
    }
  },
  response: {
    200: {
      description: 'Tasa de cambio encontrada',
      type: 'object',
      example: {
        rate: 7.85
      }
    },
    404: {
      description: 'Tasa de cambio no encontrada',
      example: { error: 'Tasa de cambio no encontrada para USD a GTQ' }
    }
  }
}

export const listRatesSchema = {
  description: 'Obtener listado de todas las tasas de cambio configuradas',
  response: {
    200: {
      description: 'Listado de tasas de cambio obtenido',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' },
          rate: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          from: 'USD',
          to: 'GTQ',
          rate: 7.85,
          createdAt: '2026-04-21T10:30:00Z',
          updatedAt: '2026-04-21T10:30:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          from: 'EUR',
          to: 'USD',
          rate: 1.08,
          createdAt: '2026-04-21T10:35:00Z',
          updatedAt: '2026-04-21T10:35:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439013',
          from: 'EUR',
          to: 'GTQ',
          rate: 8.48,
          createdAt: '2026-04-21T10:40:00Z',
          updatedAt: '2026-04-21T10:40:00Z'
        }
      ]
    }
  }
}
