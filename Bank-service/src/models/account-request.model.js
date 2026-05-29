import mongoose from 'mongoose'
import { randomUUID } from 'crypto'

const accountRequestSchema = new mongoose.Schema({
  idSolicitud: {
    type: String,
    default: () => randomUUID()
  },

  idUsuario: {
    type: String,
    required: true
  },

  requestedByRole: {
    type: String,
    required: true
  },

  tipoCuenta: {
    type: String,
    required: true,
    enum: ['ahorro', 'corriente']
  },

  divisa: {
    type: String,
    required: true
  },

  estado: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },

  reviewedBy: {
    type: String,
    default: null
  },

  accountId: {
    type: String,
    default: null
  },

  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

accountRequestSchema.index(
  { idUsuario: 1, tipoCuenta: 1, divisa: 1, estado: 1 },
  { unique: true, partialFilterExpression: { estado: 'PENDING' } }
)

export default mongoose.model('AccountRequest', accountRequestSchema)
