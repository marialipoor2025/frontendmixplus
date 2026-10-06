using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Identity.Application.Options;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Api;

/// <summary>
/// Resolves admin console access for OTP-authenticated staff phones.
/// </summary>
internal static class AdminStaffEndpoints
{
    public static void MapAdminStaffEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin").WithTags("Admin");
        group.MapGet("/staff/me", GetStaffMe).WithName("AdminStaffMe");
    }

    private static async Task<IResult> GetStaffMe(
        HttpRequest request,
        ICurrentUserAccessor users,
        IdentityDbContext db,
        IOptions<AdminStaffOptions> staffOptions,
        CancellationToken ct)
    {
        var userId = await users.GetUserIdAsync(ReadBearer(request), ct);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var user = await db.Users.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == userId.Value, ct);
        if (user is null || string.IsNullOrWhiteSpace(user.Phone))
        {
            return Results.Json(
                new { error = "دسترسی ادمین ندارید" },
                statusCode: StatusCodes.Status403Forbidden);
        }

        var phone = NormalizePhone(user.Phone);
        var member = staffOptions.Value.Members
            .FirstOrDefault(m => NormalizePhone(m.Phone) == phone);

        if (member is null)
        {
            return Results.Json(
                new { error = "این شماره در فهرست مدیران نیست" },
                statusCode: StatusCodes.Status403Forbidden);
        }

        var role = NormalizeRole(member.Role);
        return Results.Ok(new
        {
            id = user.Id.ToString("D"),
            email = user.Email ?? $"{phone}@staff.mixplus.local",
            displayName = string.IsNullOrWhiteSpace(member.DisplayName)
                ? (user.DisplayName ?? phone)
                : member.DisplayName,
            phone,
            role,
        });
    }

    private static string? ReadBearer(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header))
        {
            return null;
        }

        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }

    private static string NormalizePhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
        {
            digits = "0" + digits[2..];
        }

        return digits;
    }

    private static string NormalizeRole(string? role) =>
        role?.Trim().ToLowerInvariant() switch
        {
            "catalog_manager" => "catalog_manager",
            "ops_manager" => "ops_manager",
            "support" => "support",
            _ => "super_admin",
        };
}
