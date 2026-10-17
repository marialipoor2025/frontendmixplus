using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;

namespace MixPlus.Modules.Merchandising.Api;

/// <summary>
/// Admin CMS for homepage marketing slots: Top, Hero, Mid, Bottom.
/// </summary>
internal static class AdminCmsEndpoints
{
    public static void MapAdminCmsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/merchandising/cms").WithTags("AdminCms");
        group.MapGet("/", ListCms).WithName("AdminListCms");
        group.MapGet("/slots", ListSlots).WithName("AdminListCmsSlots");
        group.MapPost("/", CreateCms).WithName("AdminCreateCms");
        group.MapPut("/{id}", UpdateCms).WithName("AdminUpdateCms");
        group.MapDelete("/{id}", DeleteCms).WithName("AdminDeleteCms");
    }

    private static IResult ListSlots() =>
        Results.Ok(new[]
        {
            new { id = "top", title = "بالای صفحه (نوار)" },
            new { id = "hero", title = "اسلایدر اصلی" },
            new { id = "mid", title = "میانی (۴تایی)" },
            new { id = "bottom", title = "پایین صفحه" },
        });

    private static async Task<IResult> ListCms(MerchandisingDbContext db, CancellationToken ct)
    {
        var banners = await db.HomeBanners.AsNoTracking()
            .OrderBy(x => x.Slot)
            .ThenBy(x => x.SortOrder)
            .ToListAsync(ct);

        return Results.Ok(banners.Select(ToDto).ToList());
    }

    private static async Task<IResult> CreateCms(
        UpsertCmsRequest body,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });

        var slot = ParseSlot(body.Slot);
        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"cms-{slot.ToString().ToLowerInvariant()}-{Guid.NewGuid():N}"[..22]
            : body.Id.Trim();

        if (await db.HomeBanners.AnyAsync(x => x.ExternalKey == externalKey, ct))
            return Results.Conflict(new { error = "شناسه تکراری است" });

        // Top slot is single — replace previous active top when creating another.
        if (slot == BannerSlot.Top)
        {
            var tops = await db.HomeBanners.Where(x => x.Slot == BannerSlot.Top).ToListAsync(ct);
            foreach (var t in tops)
            {
                t.SetActive(false);
            }
        }

        var sort = body.SortOrder is > 0
            ? body.SortOrder.Value
            : await db.HomeBanners.CountAsync(x => x.Slot == slot, ct) + 1;

        var banner = HomeBanner.Create(
            externalKey,
            body.Title.Trim(),
            string.IsNullOrWhiteSpace(body.ImageUrl)
                ? DefaultImageFor(slot)
                : body.ImageUrl.Trim(),
            string.IsNullOrWhiteSpace(body.Href) ? "/" : body.Href.Trim(),
            string.IsNullOrWhiteSpace(body.Alt) ? body.Title.Trim() : body.Alt.Trim(),
            slot,
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

        var slot = ParseSlot(body.Slot ?? SlotKey(banner.Slot));
        banner.SetSlot(slot);
        banner.Update(
            body.Title.Trim(),
            string.IsNullOrWhiteSpace(body.ImageUrl) ? banner.ImageUrl : body.ImageUrl.Trim(),
            string.IsNullOrWhiteSpace(body.Href) ? banner.Href : body.Href.Trim(),
            string.IsNullOrWhiteSpace(body.Alt) ? body.Title.Trim() : body.Alt.Trim(),
            body.SortOrder is > 0 ? body.SortOrder.Value : banner.SortOrder);
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

    private static BannerSlot ParseSlot(string? raw) =>
        (raw ?? "hero").Trim().ToLowerInvariant() switch
        {
            "top" => BannerSlot.Top,
            "mid" => BannerSlot.Mid,
            "bottom" => BannerSlot.Bottom,
            _ => BannerSlot.Hero,
        };

    private static string SlotKey(BannerSlot slot) =>
        slot switch
        {
            BannerSlot.Top => "top",
            BannerSlot.Mid => "mid",
            BannerSlot.Bottom => "bottom",
            _ => "hero",
        };

    private static string DefaultImageFor(BannerSlot slot) =>
        slot switch
        {
            BannerSlot.Top => "/placeholders/top-banner.svg",
            BannerSlot.Mid => "/images/marketings/mid-1.webp",
            BannerSlot.Bottom => "/images/marketings/bottom-1.png",
            _ => "/images/hero/banner_SlideBanner_E5BmGK_a48a7ba8-cbeb-4f2d-8a07-6832deaf4ca2.png",
        };

    private static object ToDto(HomeBanner b) => new
    {
        id = b.ExternalKey,
        title = string.IsNullOrWhiteSpace(b.Title) ? b.Alt : b.Title,
        kind = "banner",
        slot = SlotKey(b.Slot),
        status = b.IsActive ? "published" : "draft",
        updatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd"),
        imageUrl = b.ImageUrl,
        href = b.Href,
        alt = b.Alt,
        sortOrder = b.SortOrder,
    };

    private sealed record UpsertCmsRequest(
        string? Id,
        string Title,
        string Status,
        string? Slot,
        string? ImageUrl,
        string? Href,
        string? Alt,
        int? SortOrder);
}
