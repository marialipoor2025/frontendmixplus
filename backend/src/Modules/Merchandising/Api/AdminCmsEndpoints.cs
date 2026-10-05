using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;

namespace MixPlus.Modules.Merchandising.Api;

internal static class AdminCmsEndpoints
{
    public static void MapAdminCmsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/merchandising/cms").WithTags("AdminCms");
        group.MapGet("/", ListCms).WithName("AdminListCms");
        group.MapPost("/", CreateCms).WithName("AdminCreateCms");
        group.MapPut("/{id}", UpdateCms).WithName("AdminUpdateCms");
        group.MapDelete("/{id}", DeleteCms).WithName("AdminDeleteCms");
    }

    private static async Task<IResult> ListCms(MerchandisingDbContext db, CancellationToken ct)
    {
        var banners = await db.HomeBanners.AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var items = banners.Select(b => new
        {
            id = b.ExternalKey,
            title = string.IsNullOrWhiteSpace(b.Title) ? b.Alt : b.Title,
            kind = "banner",
            status = b.IsActive ? "published" : "draft",
            updatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            imageUrl = b.ImageUrl,
            href = b.Href,
        }).ToList();

        return Results.Ok(items);
    }

    private static async Task<IResult> CreateCms(
        UpsertCmsRequest body,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"cms-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        if (await db.HomeBanners.AnyAsync(x => x.ExternalKey == externalKey, ct))
            return Results.Conflict(new { error = "شناسه تکراری است" });

        var sort = await db.HomeBanners.CountAsync(ct) + 1;
        var banner = HomeBanner.Create(
            externalKey,
            body.Title,
            string.IsNullOrWhiteSpace(body.ImageUrl) ? "/placeholders/product-appliance.png" : body.ImageUrl.Trim(),
            string.IsNullOrWhiteSpace(body.Href) ? "/" : body.Href.Trim(),
            body.Title,
            BannerSlot.Hero,
            sort);
        banner.SetActive(body.Status != "draft");

        db.HomeBanners.Add(banner);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/admin/merchandising/cms/{banner.ExternalKey}", ToDto(banner));
    }

    private static async Task<IResult> UpdateCms(
        string id,
        UpsertCmsRequest body,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });

        var banner = await db.HomeBanners.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (banner is null) return Results.NotFound(new { error = "آیتم یافت نشد" });

        banner.Update(
            body.Title,
            string.IsNullOrWhiteSpace(body.ImageUrl) ? banner.ImageUrl : body.ImageUrl.Trim(),
            string.IsNullOrWhiteSpace(body.Href) ? banner.Href : body.Href.Trim(),
            body.Title,
            banner.SortOrder);
        banner.SetActive(body.Status != "draft");
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(banner));
    }

    private static async Task<IResult> DeleteCms(
        string id,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        var banner = await db.HomeBanners.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (banner is null) return Results.NotFound(new { error = "آیتم یافت نشد" });
        db.HomeBanners.Remove(banner);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static object ToDto(HomeBanner b) => new
    {
        id = b.ExternalKey,
        title = string.IsNullOrWhiteSpace(b.Title) ? b.Alt : b.Title,
        kind = "banner",
        status = b.IsActive ? "published" : "draft",
        updatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd"),
        imageUrl = b.ImageUrl,
        href = b.Href,
    };

    private sealed record UpsertCmsRequest(
        string? Id,
        string Title,
        string Status,
        string? ImageUrl,
        string? Href);
}
