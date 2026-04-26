import {
  createAccountType,
  listAccountTypes,
  getAccountType,
  updateAccountType,
  deleteAccountType
} from '../controllers/accountType.controller.js'
import {
  accountTypeSchema,
  listAccountTypesSchema,
  getAccountTypeSchema,
  updateAccountTypeSchema,
  deleteAccountTypeSchema
} from '../schemas/accountType.schema.js'
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
        tags: ['Account Types'],
        ...listAccountTypesSchema
      }
    },
    listAccountTypes
  )

  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Account Types'],
        ...getAccountTypeSchema
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
        ...updateAccountTypeSchema
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
        security: [{ bearerAuth: [] }],
        ...deleteAccountTypeSchema
      }
    },
    deleteAccountType
  )
}