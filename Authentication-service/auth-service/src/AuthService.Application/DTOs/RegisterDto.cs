using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para registro de nuevos usuarios
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Nombre del usuario
    /// </summary>
    /// <example>Juan</example>
    [Required]
    [MaxLength(25)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Apellido del usuario
    /// </summary>
    /// <example>Pérez</example>
    [Required]
    [MaxLength(25)]
    public string Surname { get; set; } = string.Empty;

    /// <summary>
    /// Nombre de usuario único
    /// </summary>
    /// <example>juanperez</example>
    [Required]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email del usuario (debe ser único)
    /// </summary>
    /// <example>juan.perez@ejemplo.com</example>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña (mínimo 8 caracteres)
    /// </summary>
    /// <example>MiContraseña123</example>
    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Número de teléfono (exactamente 8 dígitos)
    /// </summary>
    /// <example>12345678</example>
    [Required]
    [StringLength(8, MinimumLength = 8)]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Foto de perfil del usuario (opcional, máx 10MB)
    /// </summary>
    public IFileData? ProfilePicture { get; set; }
}
