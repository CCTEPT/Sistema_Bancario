import * as movementService from '../services/movement.service.js'

export async function depositController(request, reply) {
    try {
        const movement = await movementService.deposit(
            request.body,
            request.user.sub
        )
        return reply.code(201).send(movement)
    } catch (error) {
        return reply.code(400).send({ message: error.message })
    }
}

export async function withdrawController(request, reply) {
    try {
        const movement = await movementService.withdraw(
            request.body,
            request.user.sub
        );
        return reply.code(201).send(movement);
    } catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}

export async function transferController(request, reply) {
    try {
        const movement = await movementService.transfer(
            request.body,
            request.user.sub
        )
        return reply.code(201).send(movement)
    } catch (error) {
        return reply.code(400).send({ message: error.message })
    }
}