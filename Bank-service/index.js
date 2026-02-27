import { connectDB } from './configs/db.js'
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import movementRoutes from './src/routes/movement.routes.js'

dotenv.config()

const app = Fastify({ logger: true })

app.register(jwt, {
  secret: process.env.JWT_SECRET,
  verify: {
    allowedIss: 'NovaBank',
    allowedIss: 'NovaBank'
  }
})

import accountRoutes from './src/routes/accountRoutes.js'
app.register(accountRoutes)

app.register(movementRoutes, { prefix: '/api/movements' })

const start = async () => {
  try {
    await connectDB()
    await app.listen({ port: 3000 })
    console.log('Server running')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()