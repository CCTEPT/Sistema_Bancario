// 1. PRIMERO LAS VARIABLES DE ENTORNO
import dotenv from 'dotenv'
dotenv.config() 

// 2. LUEGO LOS IMPORTS DE LIBRERÍAS
import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'

// 3. LUEGO TUS ARCHIVOS LOCALES
import { connectDB } from './configs/db.js'
import accountRoutes from './src/routes/account.routes.js'
import movementRoutes from './src/routes/movement.routes.js'
import transferRoutes from './src/routes/transfer.routes.js'
import checkRoutes from './src/routes/check.routes.js'
import authorizeRole from "./src/middlewares/role.middleware.js"

const app = Fastify({ logger: true })

// Conectar DB
await connectDB()

// verifica variables de entorno esenciales
console.log("🔐 JWT Secret:", process.env.JWT_SECRET); // para depuración
if (!process.env.AUTH_SERVICE_URL) {
  console.warn("⚠️ AUTH_SERVICE_URL no configurado, algunas funcionalidades pueden fallar");
} else {
  console.log("🔗 Auth service URL:", process.env.AUTH_SERVICE_URL);
}

// Registro de JWT con validación explícita
app.register(jwt, {
  // Nota: Si el error de firma persiste, escribe el string aquí 
  // directamente para probar si el .env está fallando por el "$"
  secret: process.env.JWT_SECRET, 
  verify: {
    allowedIssuers: [process.env.JWT_ISSUER],
    allowedAudiences: [process.env.JWT_AUDIENCE],
    algorithms: ["HS256"] // Mismo algoritmo que usas para firmar los tokens
  }
})

// --- Configuración de Swagger (Se queda igual) ---
await app.register(swagger, {
  openapi: {
    info: { title: "Bank API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    }
  }
})
await app.register(swaggerUI, { routePrefix: "/docs" })

// Decorador y Rutas
app.decorate("authorizeRole", authorizeRole)

// Es buena práctica usar await en el registro si usas top-level await
await app.register(accountRoutes, { prefix: '/api/accounts' })
await app.register(movementRoutes, { prefix: '/api/movements' })
await app.register(transferRoutes, { prefix: '/api/transferencias' })
await app.register(checkRoutes, { prefix: '/api/checks' })

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()