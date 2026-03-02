import { deposit } from '../services/deposit.service.js'
import { withdraw } from '../services/withdraw.service.js'
import { perfomTransfer } from '../services/transfer.services.js'
import { getMovementsByAccount } from '../services/movement.service.js'

export async function depositController(request, reply) {
    try {
        const movement = await deposit(
            request.body,
            request.user.sub
        )

        return reply.code(201).send({
            status: 'Success',
            data: movement
        })
    } catch (error) {
        return reply.code(400).send({ 
            status: 'Error',
            message: error.message 
        })
    }
}

export async function withdrawController(request, reply) {
    try {
        const movement = await withdraw(
            request.body,
            request.user.sub
        )
        return reply.code(201).send({
            status: 'Success',
            data: movement
        })
    } catch (error) {
        return reply.code(400).send({ 
            status: 'Error',
            message: error.message 
        })
    }
}

export async function transferController(request, reply) {
    try {
        const result = await perfomTransfer(
            request.body,
            request.user.sub
        )
        return reply.code(201).send({
            status: 'Success',
            data: result
        })
    } catch (error) {
        return reply.code(400).send({ 
            status: 'Error',
            message: error.message 
        })
    }
}

export async function historyController(request, reply) {
    try {
        const { accountId } = request.params
        const movements = await getMovementsByAccount(accountId, request.query)
        return reply.send({ status: 'Success', data: movements })
    } catch (error) {
        return reply.code(400).send({ status: 'Error', message: error.message })
    }
}