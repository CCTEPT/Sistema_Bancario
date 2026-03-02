import {
  setRate,
  getRate,
  convert,
  listRates
} from '../controllers/exchange.controller.js'
import { rateSchema, convertSchema } from '../schemas/exchange.schema.js'
import authMiddleware from '../middlewares/auth.middleware.js'

export default async function exchangeRoutes(fastify, options) {

  // Crear / actualizar tasa (protegido)
  fastify.post(
    '/rate',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Exchange'],
        security: [{ bearerAuth: [] }],
        ...rateSchema
      }
    },
    setRate
  )

  // Obtener tasa específica
  fastify.get(
    '/rate/:from/:to',
    {
      schema: {
        tags: ['Exchange']
      }
    },
    getRate
  )

  // Convertir moneda
  fastify.post(
    '/convert',
    {
      schema: {
        tags: ['Exchange'],
        ...convertSchema
      }
    },
    convert
  )

  // Listar todas las tasas
  fastify.get(
    '/rates',
    {
      schema: {
        tags: ['Exchange']
      }
    },
    listRates
  )
}