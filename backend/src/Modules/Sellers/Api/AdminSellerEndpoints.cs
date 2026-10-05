using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Sellers.Domain;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Modules.Sellers.Api;

internal static class AdminSellerEndpoints
{
    public static void MapAdminSellerEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/sellers").WithTags("AdminSellers");
        group.MapGet("/", ListSellers).WithName("AdminListSellers");
        group.MapPost("/", CreateSeller).WithName("AdminCreateSeller");
        group.MapPut("/{id}", UpdateSeller).WithName("AdminUpdateSeller");
        group.MapDelete("/{id}", DeleteSeller).WithName("AdminDeleteSeller");
    }

    private static async Task<IResult> ListSellers(SellersDbContext db, CancellationToken ct)
    {
        var rows = await db.Sellers.AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new AdminSellerDto(
                x.ExternalKey,
                x.Name,
                x.Slug,
                x.Status,
                x.Rating ?? 0,
                0))
            .ToListAsync(ct);
        return Results.Ok(rows);
    }

    private static async Task<IResult> CreateSeller(
        UpsertAdminSellerRequest body,
        SellersDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
            return Results.BadRequest(new { error = "نام فروشنده الزامی است" });

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"sel-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        if (await db.Sellers.AnyAsync(x => x.ExternalKey == externalKey, ct))
            return Results.Conflict(new { error = "شناسه فروشنده تکراری است" });

        var slug = string.IsNullOrWhiteSpace(body.Slug)
            ? externalKey.ToLowerInvariant()
            : body.Slug.Trim().ToLowerInvariant();

        if (await db.Sellers.AnyAsync(x => x.Slug == slug, ct))
            return Results.Conflict(new { error = "اسلاگ تکراری است" });

        var seller = Seller.Create(externalKey, body.Name, slug, body.Rating, body.Status);
        db.Sellers.Add(seller);
        await db.SaveChangesAsync(ct);

        return Results.Created(
            $"/api/admin/sellers/{seller.ExternalKey}",
            new AdminSellerDto(
                seller.ExternalKey,
                seller.Name,
                seller.Slug,
                seller.Status,
                seller.Rating ?? 0,
                0));
    }

    private static async Task<IResult> UpdateSeller(
        string id,
        UpsertAdminSellerRequest body,
        SellersDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
            return Results.BadRequest(new { error = "نام فروشنده الزامی است" });

        var seller = await db.Sellers.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (seller is null) return Results.NotFound(new { error = "فروشنده یافت نشد" });

        var slug = string.IsNullOrWhiteSpace(body.Slug) ? seller.Slug : body.Slug.Trim().ToLowerInvariant();
        if (await db.Sellers.AnyAsync(x => x.Slug == slug && x.ExternalKey != id, ct))
            return Results.Conflict(new { error = "اسلاگ تکراری است" });

        seller.Update(body.Name, slug, body.Rating);
        seller.SetStatus(body.Status);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new AdminSellerDto(
            seller.ExternalKey,
            seller.Name,
            seller.Slug,
            seller.Status,
            seller.Rating ?? 0,
            0));
    }

    private static async Task<IResult> DeleteSeller(
        string id,
        SellersDbContext db,
        CancellationToken ct)
    {
        var seller = await db.Sellers.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (seller is null) return Results.NotFound(new { error = "فروشنده یافت نشد" });

        db.Sellers.Remove(seller);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private sealed record AdminSellerDto(
        string Id,
        string Name,
        string Slug,
        string Status,
        decimal Rating,
        int Offers);

    private sealed record UpsertAdminSellerRequest(
        string? Id,
        string Name,
        string? Slug,
        string Status,
        decimal? Rating);
}
