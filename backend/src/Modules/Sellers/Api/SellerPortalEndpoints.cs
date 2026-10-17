using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Sellers.Domain;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Modules.Sellers.Api;

/// <summary>
/// Authenticated seller self-service: resolve or register a shop bound to any Identity user (phone/email).
/// </summary>
internal static class SellerPortalEndpoints
{
    public static void MapSellerPortalEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/seller").WithTags("SellerPortal");

        group.MapGet("/me", GetMe).WithName("SellerPortalMe");
        group.MapPost("/register", Register).WithName("SellerPortalRegister");
    }

    private static async Task<IResult> GetMe(
        HttpRequest request,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        SellersDbContext db,
        CancellationToken ct)
    {
        var userId = await users.GetUserIdAsync(ReadBearer(request), ct);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var seller = await sellers.GetByOwnerUserIdAsync(userId.Value, ct);
        if (seller is not null)
        {
            return Results.Ok(ToMeDto(seller));
        }

        // Distinguish suspended shops from "not registered yet".
        var any = await db.Sellers.AsNoTracking()
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId.Value, ct);
        if (any is not null)
        {
            return Results.Json(
                new
                {
                    error = "حساب فروشنده شما غیرفعال یا در انتظار تأیید است",
                    code = "seller_inactive",
                    status = any.Status,
                },
                statusCode: StatusCodes.Status403Forbidden);
        }

        return Results.Json(
            new
            {
                error = "حساب فروشنده برای این کاربر یافت نشد",
                code = "seller_not_registered",
            },
            statusCode: StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> Register(
        RegisterSellerRequest body,
        HttpRequest request,
        ICurrentUserAccessor users,
        SellersDbContext db,
        CancellationToken ct)
    {
        var userId = await users.GetUserIdAsync(ReadBearer(request), ct);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var existing = await db.Sellers
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId.Value, ct);
        if (existing is not null)
        {
            if (!existing.IsActive)
            {
                return Results.Json(
                    new
                    {
                        error = "حساب فروشنده شما غیرفعال یا در انتظار تأیید است",
                        code = "seller_inactive",
                        status = existing.Status,
                    },
                    statusCode: StatusCodes.Status403Forbidden);
            }

            return Results.Ok(ToMeDto(existing));
        }

        var shopName = (body.ShopName ?? string.Empty).Trim();
        if (shopName.Length < 2)
        {
            return Results.BadRequest(new { error = "نام فروشگاه الزامی است" });
        }

        if (shopName.Length > 120)
        {
            return Results.BadRequest(new { error = "نام فروشگاه بیش از حد طولانی است" });
        }

        var externalKey = $"sel-{userId.Value:N}"[..16];
        if (await db.Sellers.AnyAsync(x => x.ExternalKey == externalKey, ct))
        {
            externalKey = $"sel-{Guid.NewGuid():N}"[..16];
        }

        var slugBase = BuildSlug(shopName, externalKey);
        var slug = slugBase;
        var n = 2;
        while (await db.Sellers.AnyAsync(x => x.Slug == slug, ct))
        {
            slug = $"{slugBase}-{n}";
            n++;
        }

        var seller = Seller.Create(externalKey, shopName, slug, rating: null, status: "approved");
        seller.AssignOwner(userId.Value);
        db.Sellers.Add(seller);
        await db.SaveChangesAsync(ct);

        return Results.Created(
            "/api/seller/me",
            ToMeDto(seller));
    }

    private static SellerMeDto ToMeDto(Seller seller) =>
        new(seller.ExternalKey, seller.Name, seller.Status, seller.IsActive);

    private static SellerMeDto ToMeDto(SellerAccountModel seller) =>
        new(seller.ExternalKey, seller.Name, seller.Status, seller.IsActive);

    private static string BuildSlug(string shopName, string fallback)
    {
        var sb = new StringBuilder(shopName.Length);
        foreach (var ch in shopName.Normalize(NormalizationForm.FormKD))
        {
            var cat = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (cat == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(ch))
            {
                sb.Append(char.ToLowerInvariant(ch));
            }
            else if (ch is ' ' or '-' or '_' || char.IsWhiteSpace(ch))
            {
                if (sb.Length > 0 && sb[^1] != '-')
                {
                    sb.Append('-');
                }
            }
        }

        var slug = sb.ToString().Trim('-');
        if (string.IsNullOrWhiteSpace(slug) || slug.Any(c => c > 127))
        {
            // Persian-only names → stable ASCII slug from external key.
            return fallback.ToLowerInvariant();
        }

        return slug.Length > 80 ? slug[..80].TrimEnd('-') : slug;
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

    private sealed record RegisterSellerRequest(string? ShopName);

    private sealed record SellerMeDto(
        string Id,
        string Name,
        string Status,
        bool IsActive);
}
