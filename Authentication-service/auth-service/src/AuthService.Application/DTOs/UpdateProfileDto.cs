// UpdateProfileDto.cs — solo los campos editables
using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

public class UpdateProfileDto
{
    [Required][MaxLength(25)] public string Name { get; set; } = string.Empty;
    [Required][MaxLength(25)] public string Surname { get; set; } = string.Empty;
    [Required]                public string Username { get; set; } = string.Empty;
    [Required][StringLength(8, MinimumLength = 8)] public string Phone { get; set; } = string.Empty;
    public IFileData? ProfilePicture { get; set; }
}