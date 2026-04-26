using System;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controller;

/// <summary>
/// Controlador de Estado de Salud
/// Verifica que el servicio de autenticación esté operativo
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Verificar el estado de salud del servicio
    /// </summary>
    /// <returns>Estado del servicio, timestamp y nombre del servicio</returns>
    /// <remarks>
    /// Endpoint de verificación de salud (health check) para monitoreo.
    /// Retorna "Healthy" si el servicio está operativo.
    /// 
    /// Ejemplo de respuesta:
    /// ```
    /// {
    ///   "status": "Healthy",
    ///   "timestamp": "2026-04-21T10:30:00.000Z",
    ///   "service": "NovaBank AuthService"
    /// }
    /// ```
    /// </remarks>
    /// <response code="200">Servicio está operativo</response>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult GetHealth()
    {
        var response = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffz"),
            service = "NovaBank AuthService"
        };
        return Ok(response);
    }
}
