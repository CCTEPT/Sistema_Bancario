namespace AuthService.Application.DTOs;

/// <summary>
/// DTO de respuesta de autenticación
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Indica si la autenticación fue exitosa
    /// </summary>
    /// <example>true</example>
    public bool Success { get; set; } = true;

    /// <summary>
    /// Mensaje descriptivo de la respuesta
    /// </summary>
    /// <example>Login exitoso</example>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Token JWT para autenticación en futuras peticiones
    /// </summary>
    /// <example>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</example>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Información compacta del usuario autenticado
    /// </summary>
    public UserDetailsDto UserDetails { get; set; } = new();

    /// <summary>
    /// Fecha y hora de expiración del token
    /// </summary>
    /// <example>2026-04-21T11:30:00Z</example>
    public DateTime ExpiresAt { get; set; }
}
