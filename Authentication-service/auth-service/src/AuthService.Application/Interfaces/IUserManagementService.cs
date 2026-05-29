using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<UserResponseDto> UpdateUserStatusAsync(string userId, bool status);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
}
