export const accountTypeSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      active: { type: 'boolean' }
    }
  }
}
