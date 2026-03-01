import Movement from '../models/movement.model.js'

export async function registrarMovimiento({
    accountId,
    movementType,
    amount,
    executedBy,
    description,
    idempotencyKey,
    session,
    status = 'CONFIRMADO'
}) {

    if (amount <= 0) {
        throw new Error('El monto debe ser mayor a 0')
    }

    const movement = await Movement.create([{
        accountId,
        movementType,
        amount,
        executedBy,
        description,
        idempotencyKey,
        status,
        date: new Date()
    }], { session })

    return movement[0]
}