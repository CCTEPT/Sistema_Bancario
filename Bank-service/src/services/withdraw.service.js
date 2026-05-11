import Account from '../models/account.model.js'
import { registrarMovimiento } from './movement.service.js'

export async function withdraw(data, userId) {
    try {

        if (data.amount <= 0) {
            throw new Error('El monto debe ser mayor a 0')
        }

        const account = await Account.findById(data.accountId)

        if (!account) throw new Error('Cuenta no encontrada')
        if (account.estado !== 'ACTIVE') throw new Error('Cuenta inactiva')
        if (account.idUsuario !== userId) throw new Error('No tienes permiso para retirar desde esta cuenta')

        if (account.saldo < data.amount) {
            throw new Error('Saldo insuficiente')
        }

        const balanceBefore = account.saldo
        account.saldo -= data.amount
        const balanceAfter = account.saldo
        await account.save()

        const movement = await registrarMovimiento({
            accountId: data.accountId,
            movementType: 'WITHDRAW',
            amount: data.amount,
            executedBy: userId,
            description: data.description || 'Retiro en efectivo',
            balanceBefore,
            balanceAfter,
            channel: data.channel || 'CASHIER'
        })

        return movement

    } catch (error) {
        throw error
    }
}
