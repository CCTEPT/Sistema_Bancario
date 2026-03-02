import mongoose from 'mongoose'
import Account from '../models/account.model.js'
import { registrarMovimiento } from './movement.service.js'

export async function withdraw(data, userId) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        if (data.amount <= 0) {
            throw new Error('El monto debe ser mayor a 0')
        }

        const account = await Account.findById(data.accountId).session(session)

        if (!account) throw new Error('Cuenta no encontrada')
        if (account.estado !== 'ACTIVE') throw new Error('Cuenta inactiva')

        if (account.saldo < data.amount) {
            throw new Error('Saldo insuficiente')
        }

        const balanceBefore = account.saldo
        account.saldo -= data.amount
        const balanceAfter = account.saldo
        await account.save({ session })

        const movement = await registrarMovimiento({
            accountId: data.accountId,
            movementType: 'WITHDRAW',
            amount: data.amount,
            executedBy: userId,
            description: data.description || 'Retiro en efectivo',
            session,
            balanceBefore,
            balanceAfter,
            channel: data.channel || 'CASHIER'
        })

        await session.commitTransaction()
        session.endSession()

        return movement

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}