import exchangeService from '../services/exchangeRate.service.js'

export async function setRate(request, reply) {
  try {
    const { from, to, rate } = request.body
    const er = await exchangeService.setRate(from, to, rate)
    reply.code(201).send(er)
  } catch (err) {
    reply.code(400).send({ error: err.message })
  }
}

export async function getRate(request, reply) {
  try {
    const rate = await exchangeService.getRate(request.params.from, request.params.to)
    reply.send({ rate })
  } catch (err) {
    reply.code(404).send({ error: err.message })
  }
}

export async function convert(request, reply) {
  try {
    const { from, to, amount } = request.body
    const converted = await exchangeService.convert(from, to, amount)
    reply.send({ converted })
  } catch (err) {
    reply.code(400).send({ error: err.message })
  }
}

export async function listRates(request, reply) {
  const list = await exchangeService.list()
  reply.send(list)
}