using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para autenticación de usuarios
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Email o nombre de usuario del usuario
    /// </summary>
    /// <example>juan.perez@ejemplo.com</example>
    [Required]
    public string EmailOrUsername { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña del usuario
    /// </summary>
    /// <example>MiContraseña123</example>
    [Required]
    public string Password { get; set; } = string.Empty;
}
