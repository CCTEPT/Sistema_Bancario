import ExchangeRate from '../models/exchangeRate.model.js'

class ExchangeRateService {
  async setRate(from, to, rate) {
    return ExchangeRate.findOneAndUpdate(
      { from: from.toUpperCase(), to: to.toUpperCase() },
      { rate, effectiveDate: new Date() },
      { upsert: true, new: true }
    )
  }

  async getRate(from, to) {
    const er = await ExchangeRate.findOne({ from: from.toUpperCase(), to: to.toUpperCase() })
    if (!er) throw new Error('Tasa de cambio no encontrada')
    return er.rate
  }

  async convert(from, to, amount) {
    const rate = await this.getRate(from, to)
    return amount * rate
  }

  async list() {
    return ExchangeRate.find({})
  }
}

export default new ExchangeRateService()
