import Account from '../models/account.model.js'
import Movement from '../models/movement.model.js'
import { registrarMovimiento } from './movement.service.js'

/**
 * Lógica para DEPOSITOS
 * Basada en: Validar cuenta activa -> Aumentar saldo -> Registrar Movimiento
 */
export async function deposit(data, userId) {
    try {
        // Validar que el monto sea positivo
        if (data.amount <= 0) {
            throw new Error('El monto debe ser mayor a 0')
        }
        
        // Validar idempotencia para evitar duplicados por errores de red
        if (data.idempotencyKey) {
            const existing = await Movement.findOne({ idempotencyKey: data.idempotencyKey })
            if (existing) {
                return existing
            }
        }
        
        const account = await Account.findById(data.accountId)
        
        // 1. Validar que la cuenta exista y esté activa (Requisito de la lógica bancaria)
        if (!account) {
            throw new Error('Cuenta no encontrada')
        }
        if (account.estado !== 'ACTIVE') {
            throw new Error('La cuenta no está activa o se encuentra bloqueada')
        }
        
        // 2. Aumentar saldo
        const balanceBefore = account.saldo
        account.saldo += data.amount
        const balanceAfter = account.saldo
        await account.save()
        
        // 3. Registrar movimiento tipo DEPOSITO con el nuevo modelo
        const movement = await registrarMovimiento({
            accountId: data.accountId,
            movementType: 'DEPOSIT',
            amount: data.amount,
            executedBy: userId,
            description: data.description || 'Depósito en efectivo',
            idempotencyKey: data.idempotencyKey,
            balanceBefore,
            balanceAfter,
            channel: data.channel || 'CASHIER'
        })

        return movement

    } catch (error) {
        throw error
    }
}
