import Movement from '../models/movement.model.js'

/**
 * Crea un movimiento en la colección ‘movements’. Recibe cualquier campo
 * definido en el esquema y lo inserta; el servicio superior es responsable
 * de calcular `balanceBefore`/`balanceAfter` o de establecer los `channel`.
 */
export async function registrarMovimiento({
    accountId,
    movementType,
    amount,
    executedBy,
    description,
    idempotencyKey,
    session,
    status = 'CONFIRMED',
    channel,
    destinationAccountId,
    balanceBefore,
    balanceAfter
}) {

    if (amount <= 0) {
        throw new Error('El monto debe ser mayor a 0')
    }

    const movement = await Movement.create([
        {
            accountId,
            movementType,
            amount,
            executedBy,
            description,
            idempotencyKey,
            status,
            channel,
            destinationAccountId,
            balanceBefore,
            balanceAfter,
            date: new Date()
        }
    ], { session })

    return movement[0]
}

export async function getMovementsByAccount(accountId, { limit = 50, skip = 0 } = {}) {
    return Movement.find({ accountId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
}