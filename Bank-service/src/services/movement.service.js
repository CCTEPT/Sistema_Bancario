import mongoose from 'mongoose'
import Movement from '../models/movement.model.js'
import Account from '../models/Account.js'

export async function transfer(data, userId) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        if (data.amount <= 0) throw new Error('El monto debe ser mayor a 0')
        
        if (data.idempotencyKey) {
            const existingMovement = await Movement.findOne({ idempotencyKey: data.idempotencyKey }).session(session)
            if (existingMovement) return existingMovement
        }
        
        const originAccount = await Account.findById(data.accountId).session(session)
        const destinationAccount = await Account.findById(data.destinationAccountId).session(session)

        if (!originAccount || !destinationAccount) throw new Error('Cuenta no encontrada')
        if (originAccount.estado !== 'activa' || destinationAccount.estado !== 'activa') throw new Error('Cuenta inactiva')
        if (originAccount.saldo < data.amount) throw new Error('Saldo insuficiente')
        if (data.accountId === data.destinationAccountId) throw new Error('No se puede transferir a la misma cuenta')
        
        originAccount.saldo -= data.amount
        destinationAccount.saldo += data.amount

        await originAccount.save({ session })
        await destinationAccount.save({ session })
        
        const movement = await Movement.create([{
            accountId: data.accountId,
            destinationAccountId: data.destinationAccountId,
            movementType: 'TRANSFER',
            amount: data.amount,
            channel: data.channel || 'INTERNAL_TRANSFER',
            executedBy: userId,
            status: 'COMPLETED',
            idempotencyKey: data.idempotencyKey || undefined,
            description: data.description || 'Transferencia'
        }], { session })

        await session.commitTransaction()
        session.endSession()
        return movement[0]

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

export async function deposit(data, userId) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        
        if (data.amount <= 0) throw new Error('El monto debe ser mayor a 0')
        
        if (data.idempotencyKey) {
            const existingMovement = await Movement.findOne({ idempotencyKey: data.idempotencyKey }).session(session)
            if (existingMovement) return existingMovement
        }
        
        const account = await Account.findById(data.accountId).session(session)
        if (!account) throw new Error('Cuenta no encontrada')
        if (account.estado !== 'activa') throw new Error('Cuenta inactiva')
        
        account.saldo += data.amount
        await account.save({ session })
        
        const movement = await Movement.create([{
            accountId: data.accountId,
            movementType: 'DEPOSIT',
            amount: data.amount,
            channel: data.channel || 'APP',
            executedBy: userId,
            status: 'COMPLETED',
            idempotencyKey: data.idempotencyKey || undefined,
            description: data.description || 'Depósito'
        }], { session })

        await session.commitTransaction()
        session.endSession()
        return movement[0]
        
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}