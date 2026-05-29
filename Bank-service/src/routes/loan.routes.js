import {
  createLoanController,
  getLoansController,
  getLoanByIdController,
  approveLoanController,
  rejectLoanController,
  getPendingCountController,
  payLoanController
} from '../controllers/loan.controller.js'
import {
  createLoanSchema,
  rejectLoanSchema
} from '../schemas/loan.schema.js'

export default async function loanRoutes(fastify, options) {

  // Solicitar préstamo (solo clientes)
  fastify.post('/', {
    preHandler: fastify.authorizeRole('USER_ROLE'),
    schema: {
      ...createLoanSchema,
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, createLoanController)

  // Listar préstamos (empleado/admin ven todos, usuario ve los suyos)
  fastify.get('/', {
    preHandler: fastify.authorizeRole('USER_ROLE', 'EMPLOYEE_ROLE', 'ADMIN_ROLE'),
    schema: {
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, getLoansController)

  // Cantidad de préstamos pendientes (para notificación)
  fastify.get('/pending-count', {
    preHandler: fastify.authorizeRole('EMPLOYEE_ROLE', 'ADMIN_ROLE'),
    schema: {
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, getPendingCountController)

  // Ver préstamo por ID
  fastify.get('/:loanId', {
    preHandler: fastify.authorizeRole('USER_ROLE', 'EMPLOYEE_ROLE', 'ADMIN_ROLE'),
    schema: {
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, getLoanByIdController)

  // Aprobar préstamo
  fastify.patch('/:loanId/approve', {
    preHandler: fastify.authorizeRole('EMPLOYEE_ROLE', 'ADMIN_ROLE'),
    schema: {
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, approveLoanController)

  // Rechazar préstamo
  fastify.patch('/:loanId/reject', {
    preHandler: fastify.authorizeRole('EMPLOYEE_ROLE', 'ADMIN_ROLE'),
    schema: {
      ...rejectLoanSchema,
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, rejectLoanController)

  // Pagar préstamo (solo el cliente dueño)
  fastify.patch('/:loanId/pay', {
    preHandler: fastify.authorizeRole('USER_ROLE'),
    schema: {
      tags: ['Loans'],
      security: [{ bearerAuth: [] }]
    }
  }, payLoanController)
}