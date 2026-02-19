🔐 Auth Service – NovaBank
Microservicio de Autenticación y Autorización desarrollado en .NET 8 para el ecosistema bancario NovaBank. Este servicio centraliza la seguridad, gestión de identidad y el control de acceso basado en roles (RBAC).

🚀 Funcionalidades Implementadas
Gestión de Identidad: Registro, Login y Verificación de Email.

Seguridad: Implementación de JWT (JSON Web Tokens) con Claims personalizados.

Control de Acceso (RBAC): Roles definidos (ADMIN_ROLE, EMPLOYEE_ROLE, USER_ROLE).

Perfil de Usuario: Integración con Cloudinary para la gestión de imágenes de perfil.

Comunicación: Envío automatizado de correos electrónicos (Bienvenida y Verificación).

Persistencia: Base de datos PostgreSQL con Entity Framework Core.

Seed Data: Creación automática de un Administrador maestro al iniciar el sistema.

🛠 Tecnologías y Herramientas
Core
.NET 8 & ASP.NET Core Web API.

Entity Framework Core (Code First).

PostgreSQL como motor de base de datos.

Seguridad y Servicios
JWT Bearer Authentication: Firma y validación de tokens.

Cloudinary DotNet: Almacenamiento de imágenes en la nube.

MailKit / SmtpClient: Motor de envío de correos electrónicos.

BCrypt: Hasheo seguro de contraseñas.

📡 Endpoints Principales (v1)
🔓 Autenticación (Públicos)
POST /api/v1/auth/register - Registro de nuevos usuarios.

POST /api/v1/auth/login - Obtención de token JWT.

POST /api/v1/auth/verify-email - Verificación de cuenta mediante token.

🛡 Gestión de Usuarios (Protegidos)
PATCH /api/v1/user/{userId}/role - [Admin Only] Cambio de rol de un usuario.

GET /api/v1/user/profile - Obtener información del perfil actual.

⚙️ Configuración del Entorno
Asegúrate de configurar las siguientes llaves en tu appsettings.json:

JSON
{
  "JwtSettings": {
    "Secret": "Tu_Llave_Super_Secreta",
    "Issuer": "NovaBank",
    "Audience": "NovaBank"
  },
  "CloudinarySettings": {
    "CloudName": "tu_cloud_name",
    "ApiKey": "tu_api_key",
    "ApiSecret": "tu_api_secret"
  }
}
🏗 Estructura del Proyecto
El servicio sigue los principios de Clean Architecture:

AuthService.Api: Controladores, Middlewares y configuración del Pipeline.

AuthService.Application: Lógica de negocio, DTOs, Mapeos e Interfaces de servicios.

AuthService.Domain: Entidades del núcleo, Constantes y Excepciones personalizadas.

AuthService.Infrastructure: Implementación de servicios externos (Cloudinary, Email) y Persistencia (DataSeeder, Context).

🏁 Cómo ejecutar el proyecto
Levantar Base de Datos:

Bash
docker compose up -d
Restaurar dependencias:

Bash
dotnet restore
Ejecutar migraciones (opcional):

Bash
dotnet ef database update
Iniciar la API:

Bash
dotnet run --project AuthService.Api
💡 Nota: Al iniciar por primera vez, el sistema creará un usuario administrador por defecto:

User: admin@local.com

Password: admin

📚 Créditos Académicos
Este microservicio fue desarrollado como parte del curso IN6AM – Kinal Guatemala.

Base Académica: Prof. Braulio Echeverría.

Adaptación y Extensión: CCTEPT.

Licencia: MIT.