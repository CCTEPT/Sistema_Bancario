import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

// 🔐 Registrar JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET
})

// Registrar rutas después
import accountRoutes from './src/routes/accountRoutes.js'
app.register(accountRoutes)

const start = async () => {
  try {
    await app.listen({ port: 3000 })
    console.log('Server running')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()