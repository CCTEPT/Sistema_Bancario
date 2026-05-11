# Sistema Bancario NovaBank

Plataforma bancaria basada en microservicios. El proyecto integra autenticacion, gestion de cuentas, movimientos bancarios, cheques, configuracion financiera y un panel administrativo web.

## Contenido

- [Arquitectura general](#arquitectura-general)
- [Tecnologias](#tecnologias)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Servicios](#servicios)
- [Panel administrativo](#panel-administrativo)
- [Bases de datos](#bases-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Como ejecutar](#como-ejecutar)
- [Endpoints principales](#endpoints-principales)
- [Swagger](#swagger)
- [Credenciales iniciales](#credenciales-iniciales)
- [Creditos](#creditos)

## Arquitectura general

El sistema esta dividido en servicios independientes:

| Componente | Tecnologia | Responsabilidad |
| --- | --- | --- |
| `Authentication-service` | ASP.NET Core 8, EF Core, PostgreSQL | Registro, login, JWT, roles, verificacion de email, recuperacion de contrasena y perfiles |
| `Bank-service` | Node.js, Fastify, MongoDB | Cuentas bancarias, depositos, retiros, transferencias, historial y cheques |
| `FinancialConfig-service` | Node.js, Fastify, MongoDB | Tipos de cuenta, monedas, tasas de cambio y conversiones |
| `client-admin` | React, Vite, Tailwind CSS, Zustand, React Query | Interfaz web para usuarios, administradores y empleados |
| `pg` | Docker Compose, PostgreSQL | Base de datos del servicio de autenticacion |

La autenticacion se centraliza en `Authentication-service`. Los servicios Node reciben el token JWT por medio del header:

```http
Authorization: Bearer <token>
```

## Tecnologias

### Backend

- .NET 8 / ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL con Npgsql
- Node.js con Fastify
- MongoDB con Mongoose
- JWT Bearer Authentication
- Swagger / OpenAPI
- Serilog
- Cloudinary
- SMTP / MailKit

### Frontend

- React 19
- Vite
- Tailwind CSS
- Shadcn/Radix UI
- Zustand
- TanStack React Query
- Axios
- React Router
- Recharts

### Herramientas

- Docker / Docker Compose
- pnpm
- npm
- Postman o REST Client

## Estructura del proyecto

```text
Sistema_Bancario/
|-- Authentication-service/
|   `-- auth-service/
|       |-- global.json
|       `-- src/
|           |-- AuthService.Api/
|           |-- AuthService.Application/
|           |-- AuthService.Domain/
|           `-- AuthService.Persistence/
|-- Bank-service/
|   |-- configs/
|   |-- src/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- utils/
|   `-- index.js
|-- FinancialConfig-service/
|   |-- configs/
|   |-- src/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- schemas/
|   |   `-- services/
|   `-- index.js
|-- client-admin/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- features/
|   |   |-- shared/
|   |   `-- styles/
|   `-- vite.config.js
|-- pg/
|   `-- docker-compose.yml
|-- .gitignore
|-- LICENSE
`-- README.md
```

## Servicios

### Authentication-service

Servicio de autenticacion desarrollado con Clean Architecture.

Capas principales:

- `AuthService.Api`: controladores, middlewares, Swagger, CORS, seguridad y configuracion HTTP.
- `AuthService.Application`: DTOs, validaciones, servicios de aplicacion y excepciones de negocio.
- `AuthService.Domain`: entidades, constantes, enums e interfaces de repositorio.
- `AuthService.Persistence`: `ApplicationDbContext`, repositorios, migraciones y datos semilla.

Funcionalidades:

- Registro de usuarios con imagen de perfil opcional.
- Login con JWT.
- Verificacion de email.
- Reenvio de codigo de verificacion.
- Recuperacion y reseteo de contrasena.
- Consulta de perfil autenticado.
- Consulta de perfil por ID.
- Gestion de roles.
- Rate limiting.
- Headers de seguridad.
- Manejo global de errores.
- Logs con Serilog.

Puerto por defecto en desarrollo:

```text
http://localhost:5092
https://localhost:7233
```

### Bank-service

Servicio principal de operaciones bancarias con Fastify y MongoDB.

Funcionalidades:

- Crear y consultar cuentas bancarias.
- Depositar fondos.
- Retirar fondos.
- Transferir entre cuentas.
- Consultar historial de movimientos.
- Emitir, listar y cobrar cheques.
- Validar JWT y roles.

Puerto configurado en codigo:

```text
http://localhost:3000
```

### FinancialConfig-service

Servicio de configuracion financiera con Fastify y MongoDB.

Funcionalidades:

- CRUD de tipos de cuenta.
- CRUD de monedas.
- Registro y consulta de tasas de cambio.
- Conversion entre monedas.
- Endpoints publicos de lectura.
- Endpoints protegidos para escritura.

Puerto por defecto:

```text
http://localhost:4000
```

Puede cambiarse con la variable `PORT`.

## Panel administrativo

El directorio `client-admin` contiene la aplicacion web del sistema.

Modulos principales:

- Login y registro.
- Verificacion de email.
- Recuperacion de contrasena.
- Dashboard.
- Cuentas.
- Cheques.
- Transacciones.
- Depositos.
- Retiros.
- Transferencias.
- Conversion de moneda.
- Gestion de usuarios.
- Proteccion de rutas por autenticacion y roles.

Rutas principales del frontend:

| Ruta | Descripcion |
| --- | --- |
| `/` | Pantalla de autenticacion |
| `/login` | Login |
| `/register` | Registro |
| `/verify-email` | Verificacion de email |
| `/forgot-password` | Solicitud de recuperacion |
| `/reset-password` | Reseteo de contrasena |
| `/dashboard` | Vista principal protegida |
| `/dashboard/accounts` | Cuentas |
| `/dashboard/checks` | Cheques |
| `/dashboard/transactions` | Movimientos |
| `/dashboard/users` | Usuarios |
| `/dashboard/deposit` | Depositos |
| `/dashboard/withdraw` | Retiros |
| `/dashboard/transfer` | Transferencias |
| `/dashboard/convert` | Conversion de moneda |

Puerto por defecto de Vite:

```text
http://localhost:5173
```

## Bases de datos

### PostgreSQL

Usado por `Authentication-service`.

El archivo `pg/docker-compose.yml` levanta un contenedor con:

```text
Host: localhost
Puerto externo: 5500
Base de datos: novabank
Usuario: CCCTP
```

### MongoDB

Usado por:

- `Bank-service`
- `FinancialConfig-service`

Ambos servicios esperan una variable `MONGO_URI`.

## Variables de entorno

No subas credenciales reales al repositorio. Usa `.env`, variables locales o secretos de usuario.

### Bank-service

Crear `Bank-service/.env`:

```env
MONGO_URI=mongodb://localhost:27017/novabank_bank
JWT_SECRET=ClaveSuperSecretaDePrueba1234567890
JWT_ISSUER=NovaBank
JWT_AUDIENCE=NovaBank
AUTH_SERVICE_URL=http://localhost:5092
```

### FinancialConfig-service

Crear `FinancialConfig-service/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/novabank_financial_config
JWT_SECRET=ClaveSuperSecretaDePrueba1234567890
```

### client-admin

Crear `client-admin/.env`:

```env
VITE_AUTH=http://localhost:5092/api/v1
VITE_BANK_SERVICE=http://localhost:3000/api
VITE_FINANCIAL_SERVICE=http://localhost:4000/api
```

### Authentication-service

Configurar `Authentication-service/auth-service/src/AuthService.Api/appsettings.json` o `appsettings.Development.json`.

Llaves importantes:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=novabank;Username=CCCTP;Password=admin;Port=5500"
  },
  "JwtSettings": {
    "SecretKey": "tu_clave_secreta_de_32_caracteres_o_mas",
    "Issuer": "NovaBank",
    "Audience": "NovaBank",
    "ExpirationMinutes": 30
  },
  "AppSettings": {
    "FrontendUrl": "http://localhost:5173"
  }
}
```

Tambien se usan configuraciones para Cloudinary, SMTP, logging y seguridad.

## Como ejecutar

### 1. Levantar PostgreSQL

```bash
cd pg
docker compose up -d
```

### 2. Ejecutar Authentication-service

```bash
cd Authentication-service/auth-service
dotnet restore
dotnet run --project src/AuthService.Api/AuthService.Api.csproj
```

Swagger:

```text
http://localhost:5092/swagger
```

Health check:

```text
http://localhost:5092/api/v1/health
```

### 3. Ejecutar Bank-service

```bash
cd Bank-service
pnpm install
pnpm run dev
```

Swagger:

```text
http://localhost:3000/docs
```

### 4. Ejecutar FinancialConfig-service

```bash
cd FinancialConfig-service
pnpm install
pnpm run dev
```

Swagger:

```text
http://localhost:4000/docs
```

### 5. Ejecutar client-admin

```bash
cd client-admin
pnpm install
pnpm run dev
```

Aplicacion:

```text
http://localhost:5173
```

## Endpoints principales

### Authentication-service

Base URL:

```text
http://localhost:5092/api/v1
```

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Registrar usuario |
| `POST` | `/auth/login` | No | Iniciar sesion y obtener JWT |
| `POST` | `/auth/verify-email` | No | Verificar email |
| `POST` | `/auth/resend-verification` | No | Reenviar codigo de verificacion |
| `POST` | `/auth/forgot-password` | No | Solicitar recuperacion de contrasena |
| `POST` | `/auth/reset-password` | No | Resetear contrasena |
| `GET` | `/auth/profile` | Si | Obtener perfil autenticado |
| `POST` | `/auth/profile/by-id` | No | Obtener perfil por ID |
| `PATCH` | `/user/{userId}/role` | Si | Actualizar rol de usuario |
| `GET` | `/user/{userId}/roles` | Si | Obtener roles de usuario |
| `GET` | `/user/by-role/{roleName}` | Si | Listar usuarios por rol |
| `GET` | `/health` | No | Estado del servicio |

### Bank-service

Base URL:

```text
http://localhost:3000/api
```

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/accounts` | Si | Crear cuenta bancaria |
| `GET` | `/accounts` | Si | Listar cuentas |
| `GET` | `/accounts/{idCuenta}` | Si | Obtener cuenta por ID |
| `POST` | `/movements/deposit` | Si | Depositar |
| `POST` | `/movements/withdraw` | Si | Retirar |
| `POST` | `/movements/transfer` | Si | Transferir |
| `GET` | `/movements/history` | Si | Historial del usuario |
| `GET` | `/movements/history/{accountId}` | Si | Historial por cuenta |
| `GET` | `/checks` | Si | Listar cheques |
| `POST` | `/checks` | Si | Emitir cheque |
| `POST` | `/checks/cash` | Si | Cobrar cheque por numero |
| `POST` | `/checks/{id}/cash` | Si | Cobrar cheque por ID |

### FinancialConfig-service

Base URL:

```text
http://localhost:4000/api
```

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/account-types` | Si | Crear tipo de cuenta |
| `GET` | `/account-types` | No | Listar tipos de cuenta |
| `GET` | `/account-types/{id}` | No | Obtener tipo de cuenta |
| `PUT` | `/account-types/{id}` | Si | Actualizar tipo de cuenta |
| `DELETE` | `/account-types/{id}` | Si | Eliminar tipo de cuenta |
| `POST` | `/currencies` | Si | Crear moneda |
| `GET` | `/currencies` | No | Listar monedas |
| `GET` | `/currencies/{code}` | No | Obtener moneda por codigo |
| `PUT` | `/currencies/{code}` | Si | Actualizar moneda |
| `DELETE` | `/currencies/{code}` | Si | Eliminar moneda |
| `POST` | `/exchange/rate` | Si | Crear o actualizar tasa |
| `GET` | `/exchange/rate/{from}/{to}` | No | Obtener tasa |
| `POST` | `/exchange/convert` | No | Convertir moneda |
| `GET` | `/exchange/rates` | No | Listar tasas |

## Roles

Roles usados por el sistema:

- `ADMIN_ROLE`
- `EMPLOYEE_ROLE`
- `USER_ROLE`
- `CLIENT_ROLE`

Algunas rutas validan permisos por rol. Por ejemplo:

- Gestion de usuarios: administradores.
- Retiros y transferencias: usuarios.
- Depositos, cuentas y cheques: usuarios, empleados o administradores segun la ruta.

## Swagger

| Servicio | URL |
| --- | --- |
| Authentication-service | `http://localhost:5092/swagger` |
| Bank-service | `http://localhost:3000/docs` |
| FinancialConfig-service | `http://localhost:4000/docs` |

Para probar endpoints protegidos en Swagger, usar:

```text
Bearer <token>
```

## Credenciales iniciales

El `DataSeeder` del servicio de autenticacion crea datos iniciales automaticamente.

Credenciales de administrador usadas por el seed:

```text
Email: admin@local.com
Name: admin
Password: admin
```

## Comandos utiles

Compilar autenticacion:

```bash
dotnet build Authentication-service/auth-service/src/AuthService.Api/AuthService.Api.csproj
```

Ejecutar frontend en modo desarrollo:

```bash
cd client-admin
pnpm run dev
```

Construir frontend:

```bash
cd client-admin
pnpm run build
```

Ejecutar lint del frontend:

```bash
cd client-admin
pnpm run lint
```

Ejecutar servicios Node en produccion local:

```bash
pnpm run start
```

## Notas de seguridad

- Mantener `.env` fuera de Git.
- No publicar secretos reales de JWT, SMTP o Cloudinary.
- Usar claves JWT iguales entre servicios solo si deben validar el mismo token.
- En produccion, mover credenciales a variables de entorno o un secret manager.
- Revisar CORS antes de desplegar.

## Creditos

Proyecto academico desarrollado para IN6AM - Kinal Guatemala.

Base academica proporcionada por el profesor Braulio Echeverria y adaptada por CCTEPT para los requerimientos de NovaBank.

Licencia: MIT.
