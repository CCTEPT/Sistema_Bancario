import { perfomTransfer } from "../services/transfer.services.js"

async function transferController(request, reply) {

    try {

        const userId = request.user.id

        const result = await perfomTransfer(
            request.body,
            userId
        )

        reply.code(200).send(result)

    } catch (error) {

        reply.code(400).send({
            error: error.message
        })

    }

}

export default transferController