import {
  createCurrency,
  listCurrencies,
  getCurrency,
  updateCurrency,
  deleteCurrency
} from '../controllers/currency.controller.js'
import {
  currencySchema,
  listCurrenciesSchema,
  getCurrencySchema,
  updateCurrencySchema,
  deleteCurrencySchema
} from '../schemas/currency.schema.js'
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
        tags: ['Currencies'],
        ...listCurrenciesSchema
      }
    },
    listCurrencies
  )

  fastify.get(
    '/:code',
    {
      schema: {
        tags: ['Currencies'],
        ...getCurrencySchema
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
        ...updateCurrencySchema
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
        security: [{ bearerAuth: [] }],
        ...deleteCurrencySchema
      }
    },
    deleteCurrency
  )
}