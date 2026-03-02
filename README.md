# 🏦 Sistema Bancario

Proyecto compuesto por varios micro‑servicios que conforman una plataforma bancaria simple.  
Cada servicio está desarrollado con tecnologías modernas (Node/Express, Fastify, .NET Core) y se comunican mediante JWT.

---

## 📁 Estructura general

```
/
├─ Authentication-service/      ← .NET Core API para auth & users
├─ Bank-service/                ← Node.js / Fastify para cuentas, movimientos, cheques
├─ FinancialConfig-service/     ← Node.js / Fastify para tipos de cuenta, divisas, tasas
└─ pg/                          ← docker-compose con PostgreSQL
```

---

## 🔒 Authentication‑service

**Tecnología:** ASP.NET Core  
**Objetivo:** gestionar usuarios, login, roles y emisión de tokens JWT.

### Endpoints principales
- `POST /api/auth/login` → recibe credenciales y devuelve JWT
- `POST /api/auth/register` → registrar nuevo usuario
- `GET /api/users` → listado protegido (requiere JWT)
- `PUT /api/users/{id}/role` → cambiar rol

El token generado se utiliza como `Bearer` en los demás servicios.

### 🏗 Arquitectura interna (Clean Architecture)

Este servicio sigue una arquitectura en capas (API, Application, Domain, Persistence). A continuación se muestra la estructura principal y algunas clases clave.

#### 📁 Raíz del proyecto

```
Authentication-service/auth-service/src/
```

#### 🌐 AuthService.Api (Capa de Presentación)

Contiene los controladores, middlewares y configuración del servidor.

```
AuthService.Api/
│   Program.cs
│   appsettings.json
│   appsettings.Development.json
│
├── Controllers/
│   ├── AuthController.cs
│   ├── UserController.cs
│   └── HealthController.cs
│
├── Middlewares/
│   └── GlobalExceptionMiddleware.cs
│
├── Extensions/
│   ├── AuthenticationExtensions.cs
│   ├── SecurityExtensions.cs
│   ├── RateLimitingExtensions.cs
│   └── ServiceCollectionExtensions.cs
│
├── Models/
│   ├── ErrorResponse.cs
│   └── FormFileAdapter.cs
│
└── ModelBinders/
    └── FileDataModelBinder.cs
```

**Clases importantes**
- `Program.cs` → Configuración principal del servidor
- `AuthController` → Login, registro y autenticación
- `UserController` → Gestión de usuarios
- `GlobalExceptionMiddleware` → Manejo global de errores

#### 🧠 AuthService.Application (Lógica de Negocio)

Aquí vive la lógica real del sistema.

```
AuthService.Application/
│
├── DTOs/
├── Services/
├── Interfaces/
├── Validators/
└── Exceptions/
```

**Servicios destacados**
- `AuthService`, `UserManagementService`, `JwtTokenService`, `PasswordHashService`, `EmailService`, `CloudinaryService`

**Interfaces clave**
`IAuthService`, `IUserManagementService`, `IJwtTokenService`, `IPasswordHashService`, `IEmailService`, `ICloudinaryService`

#### 🧱 AuthService.Domain (Reglas del Dominio)

Contiene entidades y contratos del sistema.

```
AuthService.Domain/
│
├── Entities/
│   ├── User.cs
│   ├── Role.cs
│   ├── UserProfile.cs
│   ├── UserEmail.cs
│   ├── UserRole.cs
│   └── UserPasswordReset.cs
│
├── Interfaces/
│   ├── IUserRepository.cs
│   └── IRoleRepository.cs
│
├── Enums/
│   └── UserRole.cs
│
└── Constants/
    └── RoleConstants.cs
```

#### 🗄 AuthService.Persistence (Infraestructura y BD)

Implementa acceso a datos con Entity Framework Core.

```
AuthService.Persistence/
│
├── Data/
│   ├── ApplicationDbContext.cs
│   └── DataSeeder.cs
│
├── Repositories/
│   ├── UserRepository.cs
│   └── RoleRepository.cs
│
└── Migrations/
```

**Clases importantes**
- `ApplicationDbContext` → Configuración de EF Core
- `DataSeeder` → Carga inicial (Admin por defecto)
- `UserRepository`, `RoleRepository`

---

## 💳 Bank‑service

**Tecnología:** Node.js + Fastify  
Provee:

- CRUD de cuentas bancarias
- Depósitos, retiros, transferencias
- Generación de cheques

### Rutas

- `POST /api/accounts` – crear cuenta (JWT)
- `GET /api/accounts` – listar cuentas
- `POST /api/movements/deposit` – depositar
- `POST /api/movements/withdraw` – retirar
- `POST /api/movements/transfer` – transferir
- etc.

Utiliza el servicio de `FinancialConfig` para validar tipos de cuenta y tarifas, y el service de auth para validar JWT/roles.

---

## 💱 FinancialConfig‑service

**Tecnología:** Node.js + Fastify  
Administra la configuración financiera:

- Tipos de cuenta (`/api/account-types`)
- Monedas (`/api/currencies`)
- Tasas de cambio (`/api/exchange/*`)

Endpoints protegidos con JWT para creación/actualización; el resto es público.

---

## ⚙️ Configuración común

Cada servicio carga variables desde `.env`. Ejemplos:

```ini
PORT=3000
MONGO_URI=mongodb://localhost:27017/financialconfig
JWT_SECRET=unsecreto
DB_CONNECTION=...
```

Asegúrate de tener los servicios de base de datos correspondientes (MongoDB, SQL Server, PostgreSQL).

---

## 🚀 Levantar los servicios

1. **Autenticación**

   ```bash
   cd Authentication-service/auth-service
   dotnet run --project src/AuthService.Api/AuthService.Api.csproj
   ```

2. **Bank-service**

   ```bash
   cd Bank-service
   pnpm install
   pnpm run dev
   ```

3. **FinancialConfig-service**

   ```bash
   cd FinancialConfig-service
   pnpm install
   pnpm run dev
   ```

4. (Opcional) Iniciar la base de datos con Docker:

   ```bash
   cd pg
   docker-compose up -d
   ```

---

## 📄 Documentación Swagger

Todos los servicios Node exponen Swagger UI:

- **Bank-service:** `http://localhost:3001/docs` (o puerto configurado)
- **FinancialConfig-service:** `http://localhost:3000/docs`

Para usar rutas protegidas haz clic en **Authorize** y provee el JWT en formato:

```
Bearer <tu_token>
```

---

## 🛠 Desarrollo & pruebas

- Se usan **pnpm** para dependencias en los servicios Node.
- Los esquemas de validación están en `src/schemas`; los servicios en `src/services`.
- Puedes usar `AuthService.Api.http` dentro del proyecto de auth para probar con VS Code REST Client.

---

## 📌 Tips

- El token JWT se obtiene desde `Authentication-service`; copia el valor y úsalo en los demás servicios.
- Las rutas de exchange permiten calcular conversiones y registrar tasas.
- Las colecciones de Mongo se llaman `accounttypes`, `currencies`, `exchangerates` (si corres FinancialConfig).

---

## 📚 Referencias

- Fastify + Swagger: configuración ya incluida en cada proyecto Node.
- MongoDB con Mongoose en cada servicio Node.
- JWT con `@fastify/jwt` y middleware propio `auth.middleware.js`.

---

¡Listo! este README ofrece una visión global agradable y sirve como guía de uso para cualquiera que clona el repo. 😄

- `.gitignore` → Archivos ignorados por Git  
- `LICENSE` → Licencia MIT  
- `README.md` → Documentación principal  
- `pg/` → Contenedor Docker para PostgreSQL  

---

# 🏗 Arquitectura Interna

Ruta principal:

```
Authentication-service/auth-service/src/
```

---

# 🌐 AuthService.Api (Capa de Presentación)

Contiene los controladores, middlewares y configuración del servidor.

```
AuthService.Api/
│   Program.cs
│   appsettings.json
│   appsettings.Development.json
│
├── Controllers/
│   ├── AuthController.cs
│   ├── UserController.cs
│   └── HealthController.cs
│
├── Middlewares/
│   └── GlobalExceptionMiddleware.cs
│
├── Extensions/
│   ├── AuthenticationExtensions.cs
│   ├── SecurityExtensions.cs
│   ├── RateLimitingExtensions.cs
│   └── ServiceCollectionExtensions.cs
│
├── Models/
│   ├── ErrorResponse.cs
│   └── FormFileAdapter.cs
│
└── ModelBinders/
    └── FileDataModelBinder.cs
```

### 🔹 Clases Importantes

- `Program.cs` → Configuración principal del servidor
- `AuthController` → Login, registro y autenticación
- `UserController` → Gestión de usuarios
- `GlobalExceptionMiddleware` → Manejo global de errores

---

# 🧠 AuthService.Application (Lógica de Negocio)

Aquí vive la lógica real del sistema.

```
AuthService.Application/
│
├── DTOs/
├── Services/
├── Interfaces/
├── Validators/
└── Exceptions/
```

### 🔹 Clases Importantes

#### Servicios
- `AuthService`
- `UserManagementService`
- `JwtTokenService`
- `PasswordHashService`
- `EmailService`
- `CloudinaryService`

#### Interfaces
- `IAuthService`
- `IUserManagementService`
- `IJwtTokenService`
- `IPasswordHashService`
- `IEmailService`
- `ICloudinaryService`

#### DTOs
- `LoginDto`
- `RegisterDto`
- `AuthResponseDto`
- `UserResponseDto`
- `UpdateUserRoleDto`

#### Excepciones
- `BusinessException`
- `ErrorCodes`

---

# 🧱 AuthService.Domain (Reglas del Dominio)

Contiene entidades y contratos del sistema.

```
AuthService.Domain/
│
├── Entities/
│   ├── User.cs
│   ├── Role.cs
│   ├── UserProfile.cs
│   ├── UserEmail.cs
│   ├── UserRole.cs
│   └── UserPasswordReset.cs
│
├── Interfaces/
│   ├── IUserRepository.cs
│   └── IRoleRepository.cs
│
├── Enums/
│   └── UserRole.cs
│
└── Constants/
    └── RoleConstants.cs
```

### 🔹 Entidades Clave

- `User` → Entidad principal del sistema
- `Role` → Roles del sistema
- `UserProfile` → Información adicional del usuario
- `UserPasswordReset` → Gestión de recuperación de contraseña

---

# 🗄 AuthService.Persistence (Infraestructura y Base de Datos)

Implementa acceso a datos con Entity Framework Core.

```
AuthService.Persistence/
│
├── Data/
│   ├── ApplicationDbContext.cs
│   └── DataSeeder.cs
│
├── Repositories/
│   ├── UserRepository.cs
│   └── RoleRepository.cs
│
└── Migrations/
```

### 🔹 Clases Importantes

- `ApplicationDbContext` → Configuración de EF Core
- `DataSeeder` → Carga inicial (Admin por defecto)
- `UserRepository` → Acceso a usuarios
- `RoleRepository` → Acceso a roles

---

# 🐳 Base de Datos

```
pg/
└── docker-compose.yml
```

Contiene la configuración del contenedor PostgreSQL.

---

# 🎯 Resumen Arquitectónico

- **API** → Expone endpoints
- **Application** → Contiene la lógica de negocio
- **Domain** → Define las reglas y entidades
- **Persistence** → Acceso a base de datos
- **pg** → Infraestructura Docker

---

# 🧩 Patrón Aplicado

- Clean Architecture
- Repository Pattern
- Dependency Injection
- DTO Pattern
- Middleware Global de Excepciones

---

## 🚀 Funcionalidades Principales

### 🔑 Autenticación y Autorización
- **Registro de Usuarios**: Validación de datos y creación de cuenta con estado inactivo.
- **Inicio de Sesión (Login)**: Generación de **JWT (JSON Web Tokens)** con Claims de identidad.
- **Verificación de Email**: Flujo de activación de cuenta mediante tokens únicos enviados por correo electrónico.
- **Protección de Rutas**: Control de acceso basado en roles mediante atributos `[Authorize]`.

### 🛡️ Gestión de Usuarios (Admin Only)
- **RBAC (Role-Based Access Control)**: Roles definidos: `ADMIN_ROLE`, `EMPLOYEE_ROLE`, `USER_ROLE`.
- **PATCH de Roles**: Endpoint especializado para actualizar el rango de un usuario sin modificar el resto de su información.
- **Data Seeder**: Inicialización automática de la base de datos con un administrador maestro por defecto.

### 🖼️ Perfil y Multimedia
- **Integración con Cloudinary**: Almacenamiento y optimización de imágenes de perfil en la nube.
- **Avatar por Defecto**: Asignación automática de imagen para nuevos usuarios.

---

## 🛠 Tecnologías Utilizadas

### BackEnd
- **Framework**: .NET 8 / ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Seguridad**: JWT Bearer Authentication & BCrypt

### Base de Datos
- **Motor**: PostgreSQL (Dockerizado)

### Herramientas y Servicios
- **Cloudinary**: Gestión de imágenes.
- **MailKit / SMTP**: Envío de correos electrónicos.
- **Postman**: Pruebas de integración.

---

## 📡 Endpoints Principales (v1)

Base URL: `http://localhost:PUERTO/api/v1`

### Autenticación (`/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Registro de nuevos usuarios | No |
| `POST` | `/auth/login` | Login y obtención de JWT | No |
| `POST` | `/auth/verify-email`| Verificación de cuenta por token| No |

### Usuarios (`/user`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/user/profile` | Obtener perfil actual | Sí |
| `PATCH` | `/user/{userId}/role` | Cambiar rol de usuario | Sí (Admin) |

---

## ⚙️ Configuración del Entorno

Configura tu `appsettings.json` con las siguientes llaves:

```json
{
  "JwtSettings": {
    "Secret": "tu_clave_secreta_de_32_caracteres",
    "Issuer": "NovaBank",
    "Audience": "NovaBank"
  },
  "CloudinarySettings": {
    "CloudName": "dgbvb0sfu",
    "ApiKey": "342864999763714",
    "ApiSecret": "tu_api_secret",
    "Folder": "auth_novabank/profiles",
    "DefaultAvatarPath": "default-avatar-user_kit7oq"
  }
}
```


## 🏁 Cómo ejecutar el proyecto

### 1️⃣ Iniciar el contenedor de Base de Datos

```bash
docker compose up -d
```

### 2️⃣ Compilar el proyecto

```bash
dotnet build --project AuthService.Api
```

### 3️⃣ Ejecutar la API

```bash
dotnet run --project AuthService.Api
```

---

## 💡 Nota

El `DataSeeder` creará automáticamente las credenciales de administrador:

- **Email:** admin@local.com  
- **Name:** admin
- **Password:** admin  

---

## 📚 Créditos Académicos

Este microservicio fue desarrollado utilizando como base código académico proporcionado por el profesor Braulio Echeverría para el curso **IN6AM – Kinal Guatemala**.  
El código fue adaptado y extendido por **CCTEPT** para cumplir con los requerimientos de **NovaBank**.

Se respeta la licencia MIT original.
