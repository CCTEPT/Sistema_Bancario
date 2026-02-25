import Account from '../models/Account.js'

function generarNumeroCuenta() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

export async function crearCuenta(data, userId) {

  let numeroCuenta
  let existe = true

  while (existe) {
    numeroCuenta = generarNumeroCuenta()
    existe = await Account.findOne({ numeroCuenta })
  }

  const cuenta = await Account.create({
    numeroCuenta,
    saldo: 0,
    tipoCuenta: data.tipoCuenta,
    divisa: data.divisa,
    idUsuario: userId,
    estado: 'activa'
  })

  return cuenta
}

export async function obtenerCuentasUsuario(userId) {
  return Account.find({ idUsuario: userId })
}