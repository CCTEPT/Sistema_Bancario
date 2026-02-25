import { authenticate } from '../../middlewares/authMiddleware.js'
import Account from '../models/Account.js'

export default async function (app) {

  app.post('/accounts', { preHandler: authenticate }, async (request, reply) => {

    const userId = request.user.sub

    const account = await Account.create({
      userId,
      balance: 0,
      accountNumber: Math.floor(Math.random() * 1000000)
    })

    return account
  })

}