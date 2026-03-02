import {
  createAccountType,
  listAccountTypes,
  getAccountType,
  updateAccountType,
  deleteAccountType
} from '../controllers/accountType.controller.js'
import { accountTypeSchema } from '../schemas/accountType.schema.js'
import authMiddleware from '../middlewares/auth.middleware.js'

export default async function accountTypeRoutes(fastify, options) {

  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Account Types'],
        security: [{ bearerAuth: [] }],
        ...accountTypeSchema
      }
    },
    createAccountType
  )

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Account Types']
      }
    },
    listAccountTypes
  )

  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Account Types']
      }
    },
    getAccountType
  )

  fastify.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Account Types'],
        security: [{ bearerAuth: [] }],
        ...accountTypeSchema
      }
    },
    updateAccountType
  )

  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Account Types'],
        security: [{ bearerAuth: [] }]
      }
    },
    deleteAccountType
  )
}