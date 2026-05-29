import mongoose from 'mongoose'
import Loan from '../models/loan.model.js'
import Account from '../models/account.model.js'
import { registrarMovimiento } from './movement.service.js'

const ANNUAL_RATE = 12 // 12% anual fijo
const VALID_TERMS = [3, 6, 12, 24, 36, 48, 60]

/**
 * Calcula la cuota mensual con amortización francesa (cuota fija)
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
function calcularCuota(principal, annualRate, termMonths) {
    const r = annualRate / 100 / 12 // tasa mensual
    const n = termMonths
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const total = monthly * n
    const interest = total - principal
    return {
        monthlyPayment: Math.round(monthly * 100) / 100,
        totalPayment: Math.round(total * 100) / 100,
        totalInterest: Math.round(interest * 100) / 100
    }
}

export async function createLoan({ idUsuario, accountId, amount, termMonths, description }) {
    // Validar plazo
    if (!VALID_TERMS.includes(Number(termMonths))) {
        throw new Error(`Plazo inválido. Opciones disponibles: ${VALID_TERMS.join(', ')} meses`)
    }

    // Validar monto
    if (!amount || amount < 100) {
        throw new Error('El monto mínimo de préstamo es 100')
    }

    // Validar que la cuenta existe y pertenece al usuario
    const account = await Account.findById(accountId)
    if (!account) {
        throw new Error('Cuenta no encontrada')
    }
    if (account.idUsuario !== idUsuario) {
        throw new Error('La cuenta no pertenece al usuario')
    }
    if (account.estado !== 'ACTIVE') {
        throw new Error('La cuenta debe estar activa para recibir un préstamo')
    }

    // Verificar que no tenga un préstamo pendiente o activo
    const existing = await Loan.findOne({
        idUsuario,
        status: { $in: ['PENDING', 'ACTIVE'] }
    })
    if (existing) {
        throw new Error('Ya tienes un préstamo pendiente o activo. Debes pagarlo antes de solicitar otro.')
    }

    const { monthlyPayment, totalPayment, totalInterest } = calcularCuota(amount, ANNUAL_RATE, termMonths)

    return await Loan.create({
        idUsuario,
        accountId,
        amount,
        termMonths: Number(termMonths),
        annualRate: ANNUAL_RATE,
        monthlyPayment,
        totalPayment,
        totalInterest,
        currency: account.divisa,
        description: description || null,
        status: 'PENDING'
    })
}

export async function getLoans({ role, userId } = {}) {
    const filter = (role === 'EMPLOYEE_ROLE' || role === 'ADMIN_ROLE')
        ? {}
        : { idUsuario: userId }

    return await Loan.find(filter).sort({ createdAt: -1 }).lean()
}

export async function getLoanById(loanId) {
    const loan = await Loan.findOne({
        $or: [{ idLoan: loanId }, { _id: mongoose.isValidObjectId(loanId) ? loanId : undefined }]
    }).lean()

    if (!loan) throw new Error('Préstamo no encontrado')
    return loan
}

export async function approveLoan({ loanId, reviewerId }) {
    const loan = await Loan.findOne({
        $or: [{ idLoan: loanId }, { _id: mongoose.isValidObjectId(loanId) ? loanId : undefined }],
        status: 'PENDING'
    })

    if (!loan) throw new Error('Préstamo pendiente no encontrado')

    const account = await Account.findById(loan.accountId)
    if (!account) throw new Error('Cuenta destino no encontrada')
    if (account.estado !== 'ACTIVE') throw new Error('La cuenta destino está inactiva')

    const balanceBefore = account.saldo
    const balanceAfter = balanceBefore + loan.amount

    account.saldo = balanceAfter
    await account.save()

    const movement = await registrarMovimiento({
        accountId: account._id,
        movementType: 'DEPOSIT',
        amount: loan.amount,
        executedBy: reviewerId,
        description: `Desembolso de préstamo por ${loan.termMonths} meses`,
        channel: 'INTERNAL_TRANSFER',
        balanceBefore,
        balanceAfter,
    })
    loan.remainingBalance = loan.totalPayment
    loan.status = 'ACTIVE'
    loan.reviewedBy = reviewerId
    loan.approvedAt = new Date()
    loan.disbursementMovementId = movement._id
    await loan.save()

    return { loan, movement }
}

export async function rejectLoan({ loanId, reviewerId, reason }) {
    const loan = await Loan.findOne({
        $or: [{ idLoan: loanId }, { _id: mongoose.isValidObjectId(loanId) ? loanId : undefined }],
        status: 'PENDING'
    })

    if (!loan) throw new Error('Préstamo pendiente no encontrado')

    loan.status = 'REJECTED'
    loan.reviewedBy = reviewerId
    loan.rejectionReason = reason || null
    await loan.save()

    return loan
}

export async function getPendingLoansCount() {
    return await Loan.countDocuments({ status: 'PENDING' })
}

export async function payLoan({ loanId, userId, paymentAccountId, amount }) {
    const loan = await Loan.findOne({
        $or: [{ idLoan: loanId }, { _id: mongoose.isValidObjectId(loanId) ? loanId : undefined }],
        idUsuario: userId,
        status: 'ACTIVE'
    })

    if (!loan) throw new Error('Préstamo activo no encontrado')
    const currentRemaining = loan.remainingBalance ?? loan.totalPayment
    if (amount > currentRemaining) throw new Error(`El monto excede el saldo pendiente de ${currentRemaining}`)

    const paymentAccount = await Account.findById(paymentAccountId)
    if (!paymentAccount) throw new Error('Cuenta de pago no encontrada')
    if (paymentAccount.idUsuario !== userId) throw new Error('La cuenta no te pertenece')
    if (paymentAccount.estado !== 'ACTIVE') throw new Error('La cuenta de pago está inactiva')
    if (paymentAccount.saldo < amount) throw new Error('Saldo insuficiente en la cuenta seleccionada')

    const balanceBefore = paymentAccount.saldo
    const balanceAfter = balanceBefore - amount

    paymentAccount.saldo = balanceAfter
    await paymentAccount.save()

    const movement = await registrarMovimiento({
        accountId: paymentAccount._id,
        movementType: 'WITHDRAW',
        amount,
        executedBy: userId,
        description: `Pago de préstamo — saldo restante: ${loan.remainingBalance - amount}`,
        channel: 'APP',
        balanceBefore,
        balanceAfter,
    })

    loan.amountPaid = (loan.amountPaid || 0) + amount
    loan.remainingBalance = Math.round((currentRemaining - amount) * 100) / 100

    if (loan.remainingBalance <= 0) {
        loan.remainingBalance = 0
        loan.status = 'PAID'
    }

    await loan.save()
    return { loan, movement }
}