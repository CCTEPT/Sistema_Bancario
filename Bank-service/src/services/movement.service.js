import Movement from '../models/movement.model.js'
import Account from '../models/account.model.js'

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

    const createOptions = session ? { session } : undefined

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
    ], createOptions)

    return movement[0]
}

export async function getMovementsByAccount(accountId, { limit = 50, skip = 0 } = {}) {
    return Movement.find({ accountId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
}

export async function getMovementsForUser(userId, role, { limit = 100, skip = 0 } = {}) {
    const accountFilter = role === 'USER_ROLE'
        ? { idUsuario: userId, estado: 'ACTIVE' }
        : { estado: 'ACTIVE' }

    const accounts = await Account.find(accountFilter).lean()
    const accountIds = accounts.map((account) => account._id)
    const accountById = new Map(accounts.map((account) => [
        String(account._id),
        account
    ]))

    const movements = await Movement.find({ accountId: { $in: accountIds } })
        .sort({ date: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()

    return movements.map((movement) => {
        const account = accountById.get(String(movement.accountId))
        return {
            ...movement,
            accountNumber: account?.numeroCuenta,
            currency: account?.divisa,
            accountType: account?.tipoCuenta
        }
    })
}
