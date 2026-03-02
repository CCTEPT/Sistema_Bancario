export const rateSchema = {
  body: {
    type: 'object',
    required: ['from','to','rate'],
    properties: {
      from: { type: 'string' },
      to: { type: 'string' },
      rate: { type: 'number', minimum: 0 }
    }
  }
}

export const convertSchema = {
  body: {
    type: 'object',
    required: ['from','to','amount'],
    properties: {
      from: { type: 'string' },
      to: { type: 'string' },
      amount: { type: 'number', minimum: 0 }
    }
  }
}
