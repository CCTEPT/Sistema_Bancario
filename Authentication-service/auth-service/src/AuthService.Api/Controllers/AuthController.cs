using System;
using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de Autenticación y Autorización
/// Maneja el registro, login, verificación de email y recuperación de contraseña
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Obtener perfil del usuario autenticado
    /// </summary>
    /// <returns>Datos del perfil del usuario autenticado</returns>
    /// <remarks>
    /// Requiere token JWT válido en el header Authorization
    /// 
    /// Ejemplo de respuesta:
    /// ```
    /// {
    ///   "success": true,
    ///   "message": "Perfil obtenido exitosamente",
    ///   "data": {
    ///     "id": "507f1f77bcf86cd799439011",
    ///     "email": "usuario@ejemplo.com",
    ///     "name": "Juan",
    ///     "surname": "Pérez",
    ///     "username": "juanperez",
    ///     "emailVerified": true
    ///   }
    /// }
    /// ```
    /// </remarks>
    /// <response code="200">Perfil obtenido exitosamente</response>
    /// <response code="401">No autorizado - Token inválido o expirado</response>
    /// <response code="404">Usuario no encontrado</response>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> GetProfile()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
        {
            return Unauthorized();
        }

        var user = await authService.GetUserByIdAsync(userIdClaim.Value);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(new
        {
            success = true,
            message = "Perfil obtenido exitosamente",
            data = user
        });
    }

    /// <summary>
    /// Obtener perfil de un usuario específico por su ID
    /// </summary>
    /// <param name="request">Objeto con el userId del usuario a buscar</param>
    /// <returns>Datos del perfil del usuario solicitado</returns>
    /// <remarks>
    /// Permite obtener información pública del perfil de cualquier usuario
    /// 
    /// Ejemplo de request:
    /// ```
    /// {
    ///   "userId": "507f1f77bcf86cd799439011"
    /// }
    /// ```
    /// </remarks>
    /// <response code="200">Perfil obtenido exitosamente</response>
    /// <response code="400">Datos inválidos - userId requerido</response>
    /// <response code="404">Usuario no encontrado</response>
    [HttpPost("profile/by-id")]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> GetProfileById([FromBody] GetProfileByIdDto request)
    {
        if (string.IsNullOrEmpty(request.UserId))
        {
            return BadRequest(new
            {
                success = false,
                message = "El userId es requerido"
            });
        }

        var user = await authService.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Usuario no encontrado"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Perfil obtenido exitosamente",
            data = user
        });
    }

    /// <summary>
    /// Registrar un nuevo usuario
    /// </summary>
    /// <param name="registerDto">Datos del nuevo usuario (nombre, email, contraseña, foto de perfil, etc.)</param>
    /// <returns>Respuesta de registro con información del usuario creado</returns>
    /// <remarks>
    /// Crea una nueva cuenta de usuario en el sistema.
    /// Contraseña mínimo 8 caracteres.
    /// Teléfono debe ser exactamente 8 dígitos.
    /// Foto de perfil se sube a Cloudinary.
    /// Se envía email de verificación automáticamente.
    /// Máximo 10MB en el request (foto de perfil).
    /// 
    /// Campos requeridos:
    /// - Name (máx 25 caracteres)
    /// - Surname (máx 25 caracteres)
    /// - Username (única en el sistema)
    /// - Email (válido y único)
    /// - Password (mínimo 8 caracteres)
    /// - Phone (exactamente 8 dígitos)
    /// - ProfilePicture (opcional, máx 10MB)
    /// </remarks>
    /// <response code="201">Usuario registrado exitosamente</response>
    /// <response code="400">Datos inválidos - Email o username ya existe, validación fallida</response>
    /// <response code="500">Error al procesar la solicitud</response>
    [HttpPost("register")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB límite
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    /// <summary>
    /// Iniciar sesión (Login)
    /// </summary>
    /// <param name="loginDto">Email/Username y contraseña</param>
    /// <returns>Token JWT y datos del usuario</returns>
    /// <remarks>
    /// Autentica un usuario y retorna un token JWT válido por 30 minutos.
    /// 
    /// Ejemplo de request:
    /// ```
    /// {
    ///   "emailOrUsername": "usuario@ejemplo.com",
    ///   "password": "MiContraseña123"
    /// }
    /// ```
    /// 
    /// Ejemplo de respuesta:
    /// ```
    /// {
    ///   "success": true,
    ///   "message": "Login exitoso",
    ///   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    ///   "expiresAt": "2026-04-21T12:00:00Z",
    ///   "userDetails": {
    ///     "id": "507f1f77bcf86cd799439011",
    ///     "email": "usuario@ejemplo.com",
    ///     "username": "usuario",
    ///     "name": "Juan",
    ///     "surname": "Pérez"
    ///   }
    /// }
    /// ```
    /// </remarks>
    /// <response code="200">Login exitoso - Token generado</response>
    /// <response code="401">Credenciales inválidas</response>
    /// <response code="400">Email o contraseña no verificados</response>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await authService.LoginAsync(loginDto);
        return Ok(result);
    }

    /// <summary>
    /// Verificar email del usuario
    /// </summary>
    /// <param name="verifyEmailDto">Email y código de verificación</param>
    /// <returns>Respuesta de verificación</returns>
    /// <remarks>
    /// Verifica la dirección de email del usuario usando el código enviado.
    /// El código de verificación se envía al email registrado.
    /// </remarks>
    /// <response code="200">Email verificado exitosamente</response>
    /// <response code="400">Código de verificación inválido o expirado</response>
    /// <response code="404">Usuario no encontrado</response>
    [HttpPost("verify-email")]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await authService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }

    /// <summary>
    /// Reenviar email de verificación
    /// </summary>
    /// <param name="resendDto">Email del usuario</param>
    /// <returns>Respuesta de envío de email</returns>
    /// <remarks>
    /// Reenvía el código de verificación al email del usuario.
    /// Solo funciona si el email no ha sido verificado aún.
    /// </remarks>
    /// <response code="200">Email de verificación reenviado</response>
    /// <response code="400">Email ya ha sido verificado</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="503">Error al enviar email - Servicio no disponible</response>
    [HttpPost("resend-verification")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<EmailResponseDto>> ResendVerification([FromBody] ResendVerificationDto resendDto)
    {
        var result = await authService.ResendVerificationEmailAsync(resendDto);

        if (!result.Success)
        {
            if (result.Message.Contains("no encontrado", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(result);
            }
            if (result.Message.Contains("ya ha sido verificado", StringComparison.OrdinalIgnoreCase) ||
                result.Message.Contains("ya verificado", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(result);
            }

            return StatusCode(503, result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Solicitar recuperación de contraseña
    /// </summary>
    /// <param name="forgotPasswordDto">Email del usuario</param>
    /// <returns>Respuesta de solicitud de recuperación</returns>
    /// <remarks>
    /// Envía un email con instrucciones para resetear la contraseña.
    /// El enlace de recuperación tiene validez limitada.
    /// </remarks>
    /// <response code="200">Email de recuperación enviado</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="503">Error al enviar email - Servicio no disponible</response>
    [HttpPost("forgot-password")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<EmailResponseDto>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await authService.ForgotPasswordAsync(forgotPasswordDto);

        if (!result.Success)
        {
            return StatusCode(503, result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Resetear contraseña
    /// </summary>
    /// <param name="resetPasswordDto">Token de recuperación y nueva contraseña</param>
    /// <returns>Respuesta de reset de contraseña</returns>
    /// <remarks>
    /// Cambia la contraseña usando el token enviado por email.
    /// Nueva contraseña mínimo 8 caracteres.
    /// </remarks>
    /// <response code="200">Contraseña resetrada exitosamente</response>
    /// <response code="400">Token inválido o expirado, nueva contraseña inválida</response>
    /// <response code="404">Usuario no encontrado</response>
    [HttpPost("reset-password")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmailResponseDto>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await authService.ResetPasswordAsync(resetPasswordDto);
        return Ok(result);
    }
}
