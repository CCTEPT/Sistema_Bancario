import accountTypeService from '../services/accountType.service.js'

export async function createAccountType(request, reply) {
  try {
    const at = await accountTypeService.create(request.body)
    reply.code(201).send(at)
  } catch (err) {
    reply.code(400).send({ error: err.message })
  }
}

export async function listAccountTypes(request, reply) {
  const list = await accountTypeService.list()
  reply.send(list)
}

export async function getAccountType(request, reply) {
  try {
    const at = await accountTypeService.getById(request.params.id)
    reply.send(at)
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}

export async function updateAccountType(request, reply) {
  try {
    const at = await accountTypeService.update(request.params.id, request.body)
    reply.send(at)
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}

export async function deleteAccountType(request, reply) {
  try {
    await accountTypeService.remove(request.params.id)
    reply.send({ success: true })
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}