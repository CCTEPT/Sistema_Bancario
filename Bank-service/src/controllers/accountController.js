import {
  crearCuenta,
  obtenerCuentasUsuario
} from '../services/account.service.js'

export async function crearCuentaController(request, reply) {

  const userId = request.user.sub 

  const cuenta = await crearCuenta(request.body, userId)

  return reply.code(201).send(cuenta)
}

export async function obtenerCuentasController(request, reply) {

  const userId = request.user.sub

  const cuentas = await obtenerCuentasUsuario(userId)

  return reply.code(200).send(cuentas)
}