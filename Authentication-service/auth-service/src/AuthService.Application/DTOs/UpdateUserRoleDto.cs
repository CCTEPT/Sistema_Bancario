using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class UpdateUserRoleDto
{
    [Required(ErrorMessage = "Rolname is required...")]
    public string RoleName { get; set; } = string.Empty;

}
