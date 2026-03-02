import {
  createCurrency,
  listCurrencies,
  getCurrency,
  updateCurrency,
  deleteCurrency
} from '../controllers/currency.controller.js'
import { currencySchema } from '../schemas/currency.schema.js'
import authMiddleware from '../middlewares/auth.middleware.js'

export default async function currencyRoutes(fastify, options) {

  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Currencies'],
        security: [{ bearerAuth: [] }],
        ...currencySchema
      }
    },
    createCurrency
  )

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Currencies']
      }
    },
    listCurrencies
  )

  fastify.get(
    '/:code',
    {
      schema: {
        tags: ['Currencies']
      }
    },
    getCurrency
  )

  fastify.put(
    '/:code',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Currencies'],
        security: [{ bearerAuth: [] }],
        ...currencySchema
      }
    },
    updateCurrency
  )

  fastify.delete(
    '/:code',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Currencies'],
        security: [{ bearerAuth: [] }]
      }
    },
    deleteCurrency
  )
}