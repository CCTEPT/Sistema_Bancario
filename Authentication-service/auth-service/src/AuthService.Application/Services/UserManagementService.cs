using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles, ICloudinaryService cloudinary) : IUserManagementService
{
    private UserResponseDto MapToResponse(User user, string? roleName = null)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = roleName ?? user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use one of: {string.Join(", ", RoleConstants.AllowedRoles)}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);

        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        // Update role using repository method
        await users.UpdateUserRoleAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);

        return MapToResponse(user, role.Name);
    }

    public async Task<UserResponseDto> UpdateUserStatusAsync(string userId, bool status)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));

        var user = await users.GetByIdAsync(userId);
        user.Status = status;
        user.UpdatedAt = DateTime.UtcNow;

        user = await users.UpdateAsync(user);
        return MapToResponse(user);
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => MapToResponse(u, roleName)).ToList();
    }
}
