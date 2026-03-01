import * as movementService from '../services/movement.service.js'

export async function depositController(request, reply) {
    try {
        const movement = await movementService.deposit(
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
        const movement = await movementService.transfer(
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

export async function getMovementsController(request, reply) {
    try {

        const result = await movementService.getMovementsByAccount({
            accountId: request.params.id,
            userId: request.user.sub,
            page: Number(request.query.page) || 1,
            limit: Number(request.query.limit) || 10,
            startDate: request.query.startDate,
            endDate: request.query.endDate,
            movementType: request.query.movementType
        })

        return reply.send({
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

export async function getBalanceController(request, reply) {
    try {

        const result = await movementService.getAccountBalance(
            request.params.id,
            request.user.sub
        )

        return reply.send({
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