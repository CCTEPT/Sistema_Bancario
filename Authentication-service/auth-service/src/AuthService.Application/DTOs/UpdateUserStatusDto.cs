using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class UpdateUserStatusDto
{
    [Required]
    public bool Status { get; set; }
}
