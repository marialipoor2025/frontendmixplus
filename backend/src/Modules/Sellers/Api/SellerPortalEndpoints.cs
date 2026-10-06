using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;

namespace MixPlus.Modules.Sellers.Api;

/// <summary>
/// Authenticated seller self-service: resolve shop bound to Identity user.
/// </summary>
internal static class SellerPortalEndpoints
{
    public static void MapSellerPortalEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/seller").WithTags("SellerPortal");

        group.MapGet("/me", GetMe).WithName("SellerPortalMe");
    }

    private static async Task<IResult> GetMe(
        HttpRequest request,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var userId = await users.GetUserIdAsync(ReadBearer(request), ct);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var seller = await sellers.GetByOwnerUserIdAsync(userId.Value, ct);
        if (seller is null)
        {
            return Results.Json(
                new { error = "حساب فروشنده برای این کاربر یافت نشد" },
                statusCode: StatusCodes.Status403Forbidden);
        }

        return Results.Ok(new SellerMeDto(
            seller.ExternalKey,
            seller.Name,
            seller.Status,
            seller.IsActive));
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

    private sealed record SellerMeDto(
        string Id,
        string Name,
        string Status,
        bool IsActive);
}
