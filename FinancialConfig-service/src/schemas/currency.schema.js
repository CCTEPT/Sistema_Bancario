export const currencySchema = {
  description: 'Crear una nueva moneda/divisa',
  body: {
    type: 'object',
    required: ['code', 'name'],
    properties: {
      code: {
        type: 'string',
        description: 'Código ISO de la moneda (ej: USD, EUR, GTQ)',
        minLength: 3,
        maxLength: 3
      },
      name: {
        type: 'string',
        description: 'Nombre completo de la moneda (ej: Dólar estadounidense)'
      },
      symbol: {
        type: 'string',
        description: 'Símbolo de la moneda (ej: $, €, Q)'
      }
    }
  },
  response: {
    201: {
      description: 'Moneda creada exitosamente',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        code: 'USD',
        name: 'Dólar estadounidense',
        symbol: '$',
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T10:30:00Z'
      }
    },
    400: {
      description: 'Datos inválidos',
      example: { error: 'El código y nombre de la moneda son requeridos' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    }
  }
}

export const listCurrenciesSchema = {
  description: 'Obtener listado de todas las monedas',
  response: {
    200: {
      description: 'Listado de monedas obtenido',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          code: { type: 'string' },
          name: { type: 'string' },
          symbol: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          code: 'USD',
          name: 'Dólar estadounidense',
          symbol: '$',
          createdAt: '2026-04-21T10:30:00Z',
          updatedAt: '2026-04-21T10:30:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          createdAt: '2026-04-21T10:35:00Z',
          updatedAt: '2026-04-21T10:35:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439013',
          code: 'GTQ',
          name: 'Quetzal guatemalteco',
          symbol: 'Q',
          createdAt: '2026-04-21T10:40:00Z',
          updatedAt: '2026-04-21T10:40:00Z'
        }
      ]
    }
  }
}

export const getCurrencySchema = {
  description: 'Obtener una moneda específica por código',
  params: {
    type: 'object',
    required: ['code'],
    properties: {
      code: {
        type: 'string',
        description: 'Código ISO de la moneda a buscar'
      }
    }
  },
  response: {
    200: {
      description: 'Moneda encontrada',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        code: 'USD',
        name: 'Dólar estadounidense',
        symbol: '$',
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T10:30:00Z'
      }
    },
    404: {
      description: 'Moneda no encontrada',
      example: { error: 'Moneda no encontrada' }
    }
  }
}

export const updateCurrencySchema = {
  description: 'Actualizar una moneda existente',
  params: {
    type: 'object',
    required: ['code'],
    properties: {
      code: {
        type: 'string',
        description: 'Código ISO de la moneda a actualizar'
      }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Nuevo nombre de la moneda'
      },
      symbol: {
        type: 'string',
        description: 'Nuevo símbolo de la moneda'
      }
    }
  },
  response: {
    200: {
      description: 'Moneda actualizada exitosamente',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        code: 'USD',
        name: 'Dólar estadounidense (USD)',
        symbol: 'US$',
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T11:00:00Z'
      }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Moneda no encontrada',
      example: { error: 'Moneda no encontrada' }
    }
  }
}

export const deleteCurrencySchema = {
  description: 'Eliminar una moneda',
  params: {
    type: 'object',
    required: ['code'],
    properties: {
      code: {
        type: 'string',
        description: 'Código ISO de la moneda a eliminar'
      }
    }
  },
  response: {
    200: {
      description: 'Moneda eliminada exitosamente',
      type: 'object',
      example: { success: true }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Moneda no encontrada',
      example: { error: 'Moneda no encontrada' }
    }
  }
}
