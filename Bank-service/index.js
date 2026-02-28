import { connectDB } from './configs/db.js'
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'

import accountRoutes from './src/routes/accountRoutes.js'
import movementRoutes from './src/routes/movement.routes.js'
import transferRoutes from './src/routes/transfer.routes.js'
import checkRoutes from "./routes/check.routes.js";
dotenv.config()

const app = Fastify({ logger: true })

app.register(jwt, {
  secret: process.env.JWT_SECRET,
  verify: {
    allowedIss: 'NovaBank'
  }
})

// Registrar rutas
app.register(accountRoutes, { prefix: '/api/accounts' })
app.register(movementRoutes, { prefix: '/api/movements' })
app.register(transferRoutes, { prefix: '/api/transferencias' })

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