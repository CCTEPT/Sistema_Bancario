import mongoose from 'mongoose'
import { randomUUID } from 'crypto'

const accountSchema = new mongoose.Schema({
  idCuenta: {
    type: String,
    default: () => randomUUID()
  },

  numeroCuenta: {
    type: String,
    required: true,
    unique: true
  },

  saldo: {
    type: Number,
    default: 0
  },

  tipoCuenta: {
    type: String,
    required: true,
    enum: ['ahorro', 'corriente']
  },

  divisa: {
    type: String,
    required: true,
    enum: ['GTQ', 'USD', 'EUR']
  },

  idUsuario: {
    type: String,
    required: true
  },

  estado: {
    type: String,
    enum: ['activa', 'inactiva'],
    default: 'activa'
  },

  fechaCreacion: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Account', accountSchema)