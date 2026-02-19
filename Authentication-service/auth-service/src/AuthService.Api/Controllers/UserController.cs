using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UserController(IUserManagementService userManagementService) : ControllerBase
{
    private async Task<bool> CurrentUserIsAdmin()
    {
        // Extraemos el ID del usuario autenticado desde los Claims del Token
        var userId = User.Claims.FirstOrDefault(c =>
            c.Type == "sub" ||
            c.Type == ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId)) return false;

        // Verificamos sus roles actuales en la base de datos
        var roles = await userManagementService.GetUserRolesAsync(userId);

        // Comparamos con la constante de Admin
        return roles.Contains(AuthService.Domain.Constants.RoleConstants.ADMIN_ROLE);
    }

    [HttpPatch("{userId}/role")]
    [Authorize] // El middleware de JWT validará que el token sea legítimo
    public async Task<ActionResult<UserResponseDto>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto dto)
    {
        // 1. Autorización de Rol: Solo un Admin puede ejecutar este cambio
        if (!await CurrentUserIsAdmin())
        {
            return StatusCode(403, new { success = false, message = "No tienes permisos para cambiar roles." });
        }

        try
        {
            // 2. Ejecución: Se delega la lógica de negocio al servicio
            var result = await userManagementService.UpdateUserRoleAsync(userId, dto.RoleName);

            // 3. Respuesta: Retornamos el DTO del usuario actualizado
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            // Captura errores específicos (ej. intentar degradar al último administrador)
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception)
        {
            // Log de error interno y respuesta genérica
            return StatusCode(500, new { success = false, message = "Error interno del servidor" });
        }
    }

    [HttpGet("{userId}/roles")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<string>>> GetUserRoles(string userId)
    {
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }

    [HttpGet("by-role/{roleName}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetUsersByRole(string roleName)
    {
        if (!await CurrentUserIsAdmin())
        {
            return StatusCode(403, new { success = false, message = "Forbidden" });
        }

        var users = await userManagementService.GetUsersByRoleAsync(roleName);
        return Ok(users);
    }

}