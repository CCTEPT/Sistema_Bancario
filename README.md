# 🔐 Auth Service – NovaBank

> **Nota**: Este proyecto fue desarrollado con fines didácticos como parte del curso de arquitectura de microservicios **IN6AM**. Es el componente central de seguridad para el ecosistema bancario **NovaBank**.

## 📝 Descripción

Microservicio de autenticación y gestión de usuarios para la plataforma **NovaBank**. Este servicio centraliza el ciclo de vida de la identidad: registro, inicio de sesión, verificación de correo electrónico, gestión de perfiles y administración de roles (RBAC).

Implementa **Clean Architecture** (Arquitectura en capas) para asegurar que la lógica de negocio sea independiente de la base de datos y de los servicios externos.

---

## 🏗 Arquitectura

Este proyecto sigue una arquitectura en capas (Clean Architecture), separando responsabilidades en **API, Application, Domain y Persistence**.

---

## 📁 Raíz del Proyecto

```
.
│   .gitignore
│   LICENSE
│   README.md
│
├── Authentication-service/
├── pg/
```

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
