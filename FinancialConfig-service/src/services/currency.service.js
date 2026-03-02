import Currency from '../models/currency.model.js'

class CurrencyService {
  async create(data) {
    const existing = await Currency.findOne({ code: data.code.toUpperCase() })
    if (existing) throw new Error('Divisa ya existe')
    return Currency.create(data)
  }

  async list() {
    return Currency.find({})
  }

  async getByCode(code) {
    const cur = await Currency.findOne({ code: code.toUpperCase() })
    if (!cur) throw new Error('Divisa no encontrada')
    return cur
  }

  async update(code, data) {
    const cur = await Currency.findOneAndUpdate({ code: code.toUpperCase() }, data, { new: true })
    if (!cur) throw new Error('Divisa no encontrada')
    return cur
  }

  async remove(code) {
    await Currency.findOneAndDelete({ code: code.toUpperCase() })
  }
}

export default new CurrencyService()
