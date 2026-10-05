using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Identity.Application.Auth;
using MixPlus.Modules.Identity.Domain;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Api;

internal static class WishlistEndpoints
{
    public static void MapWishlistEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/wishlist").WithTags("Wishlist");

        group.MapGet("/", ListWishlist).WithName("ListWishlist");
        group.MapGet("/count", CountWishlist).WithName("CountWishlist");
        group.MapGet("/contains/{productSlug}", ContainsWishlist).WithName("ContainsWishlist");
        group.MapPost("/", AddWishlist).WithName("AddWishlist");
        group.MapDelete("/{productSlug}", RemoveWishlist).WithName("RemoveWishlist");
    }

    private static async Task<IResult> ListWishlist(
        HttpRequest request,
        ISessionAuthService sessions,
        IdentityDbContext db,
        CancellationToken ct)
    {
        var user = await RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var items = await db.WishlistItems.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new
            {
                id = x.Id.ToString("D"),
                productSlug = x.ProductSlug,
                title = x.ProductTitle,
                imageUrl = x.ImageUrl,
                price = new { amount = x.PriceAmount, currency = x.PriceCurrency },
                createdAt = x.CreatedAtUtc,
            })
            .ToListAsync(ct);

        return Results.Ok(items);
    }

    private static async Task<IResult> CountWishlist(
        HttpRequest request,
        ISessionAuthService sessions,
        IdentityDbContext db,
        CancellationToken ct)
    {
        var user = await RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var count = await db.WishlistItems.AsNoTracking()
            .CountAsync(x => x.UserId == userId, ct);
        return Results.Ok(new { count });
    }

    private static async Task<IResult> ContainsWishlist(
        string productSlug,
        HttpRequest request,
        ISessionAuthService sessions,
        IdentityDbContext db,
        CancellationToken ct)
    {
        var user = await RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var slug = productSlug.Trim().ToLowerInvariant();
        var exists = await db.WishlistItems.AsNoTracking()
            .AnyAsync(x => x.UserId == userId && x.ProductSlug == slug, ct);

        return Results.Ok(new { productSlug = slug, inWishlist = exists });
    }

    private static async Task<IResult> AddWishlist(
        AddWishlistRequest body,
        HttpRequest request,
        ISessionAuthService sessions,
        IdentityDbContext db,
        CancellationToken ct)
    {
        var user = await RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        if (string.IsNullOrWhiteSpace(body.ProductSlug))
            return Results.BadRequest(new { error = "شناسه محصول الزامی است" });

        var userId = Guid.Parse(user.Id);
        var slug = body.ProductSlug.Trim().ToLowerInvariant();
        var title = string.IsNullOrWhiteSpace(body.Title) ? slug : body.Title.Trim();

        var existing = await db.WishlistItems
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductSlug == slug, ct);
        if (existing is not null)
        {
            return Results.Ok(new
            {
                id = existing.Id.ToString("D"),
                productSlug = existing.ProductSlug,
                title = existing.ProductTitle,
                imageUrl = existing.ImageUrl,
                price = new { amount = existing.PriceAmount, currency = existing.PriceCurrency },
                alreadyExists = true,
            });
        }

        var item = WishlistItem.Create(
            userId,
            slug,
            title,
            body.ImageUrl ?? string.Empty,
            body.PriceAmount ?? 0,
            body.PriceCurrency ?? "IRT");

        db.WishlistItems.Add(item);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new
        {
            id = item.Id.ToString("D"),
            productSlug = item.ProductSlug,
            title = item.ProductTitle,
            imageUrl = item.ImageUrl,
            price = new { amount = item.PriceAmount, currency = item.PriceCurrency },
            alreadyExists = false,
        });
    }

    private static async Task<IResult> RemoveWishlist(
        string productSlug,
        HttpRequest request,
        ISessionAuthService sessions,
        IdentityDbContext db,
        CancellationToken ct)
    {
        var user = await RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var slug = productSlug.Trim().ToLowerInvariant();
        var item = await db.WishlistItems
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductSlug == slug, ct);
        if (item is null) return Results.NoContent();

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<AuthUserDto?> RequireUser(
        HttpRequest request,
        ISessionAuthService sessions,
        CancellationToken ct)
    {
        var result = await sessions.GetMeAsync(ReadBearer(request), ct);
        return result.IsSuccess ? result.Value : null;
    }

    private static string? ReadBearer(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header)) return null;
        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }

    private sealed record AddWishlistRequest(
        string ProductSlug,
        string? Title,
        string? ImageUrl,
        decimal? PriceAmount,
        string? PriceCurrency);
}
