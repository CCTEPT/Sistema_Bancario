export const accountTypeSchema = {
  description: 'Crear un nuevo tipo de cuenta bancaria',
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        description: 'Nombre del tipo de cuenta (ej: Ahorro, Corriente, Nómina)'
      },
      description: {
        type: 'string',
        description: 'Descripción detallada del tipo de cuenta'
      },
      active: {
        type: 'boolean',
        default: true,
        description: 'Indica si el tipo de cuenta está activo'
      }
    }
  },
  response: {
    201: {
      description: 'Tipo de cuenta creado exitosamente',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Cuenta de Ahorro',
        description: 'Cuenta para ahorro personal',
        active: true,
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T10:30:00Z'
      }
    },
    400: {
      description: 'Datos inválidos',
      example: { error: 'El nombre del tipo de cuenta es requerido' }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    }
  }
}

export const listAccountTypesSchema = {
  description: 'Obtener listado de todos los tipos de cuenta',
  response: {
    200: {
      description: 'Listado de tipos de cuenta obtenido',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          active: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Cuenta de Ahorro',
          description: 'Cuenta para ahorro personal',
          active: true,
          createdAt: '2026-04-21T10:30:00Z',
          updatedAt: '2026-04-21T10:30:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Cuenta Corriente',
          description: 'Cuenta para operaciones diarias',
          active: true,
          createdAt: '2026-04-21T10:35:00Z',
          updatedAt: '2026-04-21T10:35:00Z'
        }
      ]
    }
  }
}

export const getAccountTypeSchema = {
  description: 'Obtener un tipo de cuenta específico por ID',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'ID único del tipo de cuenta'
      }
    }
  },
  response: {
    200: {
      description: 'Tipo de cuenta encontrado',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Cuenta de Ahorro',
        description: 'Cuenta para ahorro personal',
        active: true,
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T10:30:00Z'
      }
    },
    404: {
      description: 'Tipo de cuenta no encontrado',
      example: { error: 'Tipo de cuenta no encontrado' }
    }
  }
}

export const updateAccountTypeSchema = {
  description: 'Actualizar un tipo de cuenta existente',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'ID único del tipo de cuenta a actualizar'
      }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Nuevo nombre del tipo de cuenta'
      },
      description: {
        type: 'string',
        description: 'Nueva descripción del tipo de cuenta'
      },
      active: {
        type: 'boolean',
        description: 'Nuevo estado del tipo de cuenta'
      }
    }
  },
  response: {
    200: {
      description: 'Tipo de cuenta actualizado exitosamente',
      type: 'object',
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Cuenta de Ahorro Premium',
        description: 'Cuenta premium para ahorro personal',
        active: true,
        createdAt: '2026-04-21T10:30:00Z',
        updatedAt: '2026-04-21T11:00:00Z'
      }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Tipo de cuenta no encontrado',
      example: { error: 'Tipo de cuenta no encontrado' }
    }
  }
}

export const deleteAccountTypeSchema = {
  description: 'Eliminar un tipo de cuenta',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'ID único del tipo de cuenta a eliminar'
      }
    }
  },
  response: {
    200: {
      description: 'Tipo de cuenta eliminado exitosamente',
      type: 'object',
      example: { success: true }
    },
    401: {
      description: 'No autorizado',
      example: { error: 'Token inválido' }
    },
    404: {
      description: 'Tipo de cuenta no encontrado',
      example: { error: 'Tipo de cuenta no encontrado' }
    }
  }
}
