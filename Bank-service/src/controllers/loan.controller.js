import {
  createLoan,
  getLoans,
  getLoanById,
  approveLoan,
  rejectLoan,
  getPendingLoansCount,
  payLoan
} from '../services/loan.service.js'

export async function createLoanController(request, reply) {
  try {
    const idUsuario = request.user.sub
    const { accountId, amount, termMonths, description } = request.body

    const loan = await createLoan({ idUsuario, accountId, amount, termMonths, description })

    return reply.code(201).send({
      message: 'Solicitud de préstamo enviada correctamente',
      loan
    })
  } catch (error) {
    return reply.code(400).send({ message: error.message })
  }
}

export async function getLoansController(request, reply) {
  try {
    const loans = await getLoans({
      role: request.user.role,
      userId: request.user.sub
    })

    return reply.send({ loans })
  } catch (error) {
    return reply.code(400).send({ message: error.message })
  }
}

export async function getLoanByIdController(request, reply) {
  try {
    const loan = await getLoanById(request.params.loanId)

    // Usuario solo puede ver sus propios préstamos
    if (request.user.role === 'USER_ROLE' && loan.idUsuario !== request.user.sub) {
      return reply.code(403).send({ message: 'No tienes permiso para ver este préstamo' })
    }

    return reply.send({ loan })
  } catch (error) {
    return reply.code(404).send({ message: error.message })
  }
}

export async function approveLoanController(request, reply) {
  try {
    const result = await approveLoan({
      loanId: request.params.loanId,
      reviewerId: request.user.sub
    })

    return reply.send({
      message: 'Préstamo aprobado y monto desembolsado a la cuenta',
      ...result
    })
  } catch (error) {
    return reply.code(400).send({ message: error.message })
  }
}

export async function rejectLoanController(request, reply) {
  try {
    const loan = await rejectLoan({
      loanId: request.params.loanId,
      reviewerId: request.user.sub,
      reason: request.body?.reason
    })

    return reply.send({
      message: 'Préstamo rechazado',
      loan
    })
  } catch (error) {
    return reply.code(400).send({ message: error.message })
  }
}

export async function getPendingCountController(request, reply) {
  try {
    const count = await getPendingLoansCount()
    return reply.send({ count })
  } catch (error) {
    return reply.code(400).send({ message: error.message })
  }
}

export async function payLoanController(request, reply) {
  try {
    const result = await payLoan({
      loanId: request.params.loanId,
      userId: request.user.sub,
      paymentAccountId: request.body.accountId,
      amount: request.body.amount,
    })
    return reply.send({
      message: 'Pago registrado correctamente',
      ...result
    })
  } catch (error) {
    return reply.code(400).send({ message: error.message })
  }
}