using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de Gestión de Usuarios
/// Maneja la asignación de roles y obtención de información de usuarios
/// </summary>
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

    /// <summary>
    /// Actualizar el rol de un usuario
    /// </summary>
    /// <param name="userId">ID del usuario cuyo rol será actualizado</param>
    /// <param name="dto">Objeto con el nuevo nombre del rol</param>
    /// <returns>Usuario con el rol actualizado</returns>
    /// <remarks>
    /// Solo usuarios administradores pueden ejecutar esta operación.
    /// Roles disponibles: ADMIN_ROLE, EMPLOYEE_ROLE, USER_ROLE, CLIENT_ROLE
    /// 
    /// Ejemplo de request:
    /// ```
    /// {
    ///   "roleName": "EMPLOYEE_ROLE"
    /// }
    /// ```
    /// 
    /// Ejemplo de respuesta:
    /// ```
    /// {
    ///   "id": "507f1f77bcf86cd799439011",
    ///   "email": "usuario@ejemplo.com",
    ///   "username": "usuario",
    ///   "name": "Juan",
    ///   "surname": "Pérez",
    ///   "role": "EMPLOYEE_ROLE"
    /// }
    /// ```
    /// </remarks>
    /// <response code="200">Rol actualizado exitosamente</response>
    /// <response code="400">Datos inválidos - No se puede degradar al último administrador</response>
    /// <response code="403">Acceso prohibido - Solo administradores pueden actualizar roles</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPatch("{userId}/role")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

    /// <summary>
    /// Obtener todos los roles de un usuario
    /// </summary>
    /// <param name="userId">ID del usuario</param>
    /// <returns>Lista de roles del usuario</returns>
    /// <remarks>
    /// Retorna todos los roles asignados a un usuario específico.
    /// 
    /// Ejemplo de respuesta:
    /// ```
    /// [
    ///   "USER_ROLE",
    ///   "CLIENT_ROLE"
    /// ]
    /// ```
    /// </remarks>
    /// <response code="200">Roles obtenidos exitosamente</response>
    /// <response code="401">No autorizado - Token inválido o expirado</response>
    /// <response code="404">Usuario no encontrado</response>
    [HttpGet("{userId}/roles")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetUserRoles(string userId)
    {
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }

    /// <summary>
    /// Obtener todos los usuarios con un rol específico
    /// </summary>
    /// <param name="roleName">Nombre del rol a buscar</param>
    /// <returns>Lista de usuarios con el rol especificado</returns>
    /// <remarks>
    /// Solo administradores pueden ejecutar esta operación.
    /// Retorna información básica de todos los usuarios que poseen el rol especificado.
    /// 
    /// Roles disponibles: ADMIN_ROLE, EMPLOYEE_ROLE, USER_ROLE, CLIENT_ROLE
    /// 
    /// Ejemplo de respuesta:
    /// ```
    /// [
    ///   {
    ///     "id": "507f1f77bcf86cd799439011",
    ///     "email": "usuario@ejemplo.com",
    ///     "username": "usuario",
    ///     "name": "Juan",
    ///     "surname": "Pérez",
    ///     "role": "EMPLOYEE_ROLE"
    ///   }
    /// ]
    /// ```
    /// </remarks>
    /// <response code="200">Lista de usuarios obtenida</response>
    /// <response code="401">No autorizado - Token inválido o expirado</response>
    /// <response code="403">Acceso prohibido - Solo administradores pueden ver usuarios por rol</response>
    /// <response code="404">Rol no encontrado o ningún usuario con ese rol</response>
    [HttpGet("by-role/{roleName}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(IReadOnlyList<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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