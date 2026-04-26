using System;
using AuthService.Application.Interfaces;
using AuthService.Application.Services;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using AuthService.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Api.Extensions;

//Extension para agregar el servicio de aplicacion al contenedor de dependecias ASP.NET Core.
// Configura el DbContext para usar PostgreSQL con la cadena de conexion especificada en la configuracion.
public static class ServiceCollectionsExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options=>
        options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
        .UseSnakeCaseNamingConvention());

        //Servicios de la capa de aplicacion
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IAuthService, AuthService.Application.Services.AuthService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IPasswordHashService, PasswordHashService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IEmailService, EmailService>();

        services.AddHealthChecks();
        return services;
    }
    public  static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(config =>
        {
            // Información general del API
            config.SwaggerDoc("v1", new()
            {
                Title = "NovaBank Authentication API",
                Version = "v1.0.0",
                Description = "API de autenticación y gestión de usuarios para el Sistema Bancario NovaBank. Incluye registro, login, verificación de email y gestión de roles.",
                Contact = new()
                {
                    Name = "NovaBank Support",
                    Email = "soporte@novabank.com"
                },
                License = new()
                {
                    Name = "ISC License",
                    Url = new Uri("https://opensource.org/licenses/ISC")
                }
            });

            // Configurar seguridad JWT
            config.AddSecurityDefinition("Bearer", new()
            {
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Token JWT requerido para acceder a endpoints protegidos. Formato: Bearer {token}"
            });

            config.AddSecurityRequirement(new()
            {
                {
                    new()
                    {
                        Reference = new()
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] { }
                }
            });

            // Incluir comentarios XML
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                config.IncludeXmlComments(xmlPath);
            }
        });
        return services;
    }
}