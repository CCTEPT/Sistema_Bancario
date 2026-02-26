import { authenticate } from '../../middlewares/authMiddleware.js'
import Account from '../models/Account.js'

function generarNumeroCuenta() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

export default async function (app) {

  app.post('/cuentas', { preHandler: authenticate }, async (request, reply) => {

    const { tipoCuenta, divisa } = request.body
    const idUsuario = request.user.sub
    const tiposValidos = ['ahorro', 'corriente']
    const divisasValidas = ['GTQ', 'USD', 'EUR']

    if (!tiposValidos.includes(tipoCuenta)) {
      return reply.code(400).send({ error: 'Tipo de cuenta inválido' })
    }

    if (!divisasValidas.includes(divisa)) {
      return reply.code(400).send({ error: 'Divisa inválida' })
    }

    let numeroCuenta
    let existe = true

    while (existe) {
      numeroCuenta = generarNumeroCuenta()
      existe = await Account.findOne({ numeroCuenta })
    }

    const cuenta = await Account.create({
      numeroCuenta,
      saldo: 0,
      tipoCuenta,
      divisa,
      idUsuario,
      estado: 'activa',
      fechaCreacion: new Date()
    })

    return reply.code(201).send(cuenta)
  })

  
  app.get('/cuentas', { preHandler: authenticate }, async (request, reply) => {

    const idUsuario = request.user.sub

    const cuentas = await Account.find({
      idUsuario
    })

    return reply.code(200).send(cuentas)
  })
}