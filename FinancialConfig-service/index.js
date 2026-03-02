import dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import { connectDB } from './configs/db.js'

import accountTypeRoutes from './src/routes/accountType.routes.js'
import currencyRoutes from './src/routes/currency.routes.js'
import exchangeRoutes from './src/routes/exchange.routes.js'

const app = Fastify({ logger: true })

await connectDB()

// Registrar JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret'
})

// ✅ Swagger BIEN configurado
await app.register(swagger, {
  openapi: {
    info: {
      title: 'FinancialConfig API',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

await app.register(swaggerUI, {
  routePrefix: '/docs'
})

// Registrar rutas
await app.register(accountTypeRoutes, { prefix: '/api/account-types' })
await app.register(currencyRoutes, { prefix: '/api/currencies' })
await app.register(exchangeRoutes, { prefix: '/api/exchange' })

const start = async () => {
  try {
    await app.listen({
      port: process.env.PORT || 4000,
      host: '0.0.0.0'
    })
    console.log('FinancialConfig listening')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()