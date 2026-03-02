import currencyService from '../services/currency.service.js'

export async function createCurrency(request, reply) {
  try {
    const cur = await currencyService.create(request.body)
    reply.code(201).send(cur)
  } catch (err) {
    reply.code(400).send({ error: err.message })
  }
}

export async function listCurrencies(request, reply) {
  const list = await currencyService.list()
  reply.send(list)
}

export async function getCurrency(request, reply) {
  try {
    const cur = await currencyService.getByCode(request.params.code)
    reply.send(cur)
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}

export async function updateCurrency(request, reply) {
  try {
    const cur = await currencyService.update(request.params.code, request.body)
    reply.send(cur)
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}

export async function deleteCurrency(request, reply) {
  try {
    await currencyService.remove(request.params.code)
    reply.send({ success: true })
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}