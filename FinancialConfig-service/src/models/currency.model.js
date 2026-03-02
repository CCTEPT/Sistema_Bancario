import mongoose from 'mongoose'

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  symbol: { type: String }
}, { timestamps: true })

export default mongoose.model('Currency', currencySchema)
