import AccountType from '../models/accountType.model.js'

class AccountTypeService {
  async create(data) {
    const existing = await AccountType.findOne({ name: data.name })
    if (existing) throw new Error('Tipo de cuenta ya existe')
    return AccountType.create(data)
  }

  async list() {
    return AccountType.find({})
  }

  async getById(id) {
    const at = await AccountType.findById(id)
    if (!at) throw new Error('Tipo de cuenta no encontrado')
    return at
  }

  async update(id, data) {
    const at = await AccountType.findByIdAndUpdate(id, data, { new: true })
    if (!at) throw new Error('Tipo de cuenta no encontrado')
    return at
  }

  async remove(id) {
    await AccountType.findByIdAndDelete(id)
  }
}

export default new AccountTypeService()
