import Movement from '../models/movement.model.js'
import Account from '../models/account.model.js'

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

export async function getMovementsByAccount({
    accountId,
    userId,
    page = 1,
    limit = 10,
    startDate,
    endDate,
    movementType
}) {

    const account = await Account.findOne({
        _id: accountId,
        idUsuario: userId
    })

    if (!account) {
        throw new Error('Cuenta no pertenece al usuario')
    }

    const query = { accountId }

    if (movementType) {
        query.movementType = movementType
    }

    if (startDate || endDate) {
        query.date = {}

        if (startDate)
            query.date.$gte = new Date(startDate)

        if (endDate)
            query.date.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const movements = await Movement
        .find(query)
        .sort({ date: -1 }) 
        .skip(skip)
        .limit(limit)

    const total = await Movement.countDocuments(query)

    return {
        total,
        page,
        pages: Math.ceil(total / limit),
        movements
    }
}

export async function getAccountBalance(accountId, userId) {

    const account = await Account.findOne({
        _id: accountId,
        idUsuario: userId
    })

    if (!account) {
        throw new Error('Cuenta no pertenece al usuario')
    }

    return {
        accountId: account._id,
        balance: account.saldo,
        currency: account.divisa
    }
}