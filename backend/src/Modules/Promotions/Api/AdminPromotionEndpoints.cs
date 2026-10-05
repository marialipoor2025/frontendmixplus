using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Promotions.Domain;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Modules.Promotions.Api;

internal static class AdminPromotionEndpoints
{
    public static void MapAdminPromotionEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/promotions").WithTags("AdminPromotions");
        group.MapGet("/", ListCampaigns).WithName("AdminListPromotions");
        group.MapPost("/", CreateCampaign).WithName("AdminCreatePromotion");
        group.MapPut("/{id}", UpdateCampaign).WithName("AdminUpdatePromotion");
        group.MapDelete("/{id}", DeleteCampaign).WithName("AdminDeletePromotion");
    }

    private static async Task<IResult> ListCampaigns(PromotionsDbContext db, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var rows = await db.OfferCampaigns.AsNoTracking()
            .OrderByDescending(x => x.StartsAtUtc)
            .ToListAsync(ct);

        var items = rows.Select(c => ToDto(c, now)).ToList();
        return Results.Ok(items);
    }

    private static async Task<IResult> CreateCampaign(
        UpsertPromotionRequest body,
        PromotionsDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"pr-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        if (await db.OfferCampaigns.AnyAsync(x => x.ExternalKey == externalKey, ct))
            return Results.Conflict(new { error = "شناسه تکراری است" });

        var campaign = OfferCampaign.Create(
            externalKey,
            body.Title,
            body.StartsAtUtc,
            body.EndsAtUtc);
        campaign.Update(body.Title, body.StartsAtUtc, body.EndsAtUtc, body.IsActive);
        if (body.ProductKeys is { Count: > 0 })
        {
            campaign.SetProductKeys(body.ProductKeys);
        }

        db.OfferCampaigns.Add(campaign);
        await db.SaveChangesAsync(ct);
        return Results.Created(
            $"/api/admin/promotions/{campaign.ExternalKey}",
            ToDto(campaign, DateTime.UtcNow));
    }

    private static async Task<IResult> UpdateCampaign(
        string id,
        UpsertPromotionRequest body,
        PromotionsDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });

        var campaign = await db.OfferCampaigns.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (campaign is null) return Results.NotFound(new { error = "پروموشن یافت نشد" });

        campaign.Update(body.Title, body.StartsAtUtc, body.EndsAtUtc, body.IsActive);
        if (body.ProductKeys is not null)
        {
            campaign.SetProductKeys(body.ProductKeys);
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(campaign, DateTime.UtcNow));
    }

    private static async Task<IResult> DeleteCampaign(
        string id,
        PromotionsDbContext db,
        CancellationToken ct)
    {
        var campaign = await db.OfferCampaigns.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (campaign is null) return Results.NotFound(new { error = "پروموشن یافت نشد" });

        db.OfferCampaigns.Remove(campaign);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static AdminPromotionDto ToDto(OfferCampaign c, DateTime nowUtc)
    {
        var status = !c.IsActive
            ? "ended"
            : c.StartsAtUtc is { } start && start > nowUtc
                ? "scheduled"
                : c.EndsAtUtc is { } end && end < nowUtc
                    ? "ended"
                    : "active";

        return new AdminPromotionDto(
            c.ExternalKey,
            c.Title,
            "campaign",
            status,
            c.EndsAtUtc?.ToString("yyyy-MM-dd") ?? "",
            c.IsActive,
            c.StartsAtUtc,
            c.EndsAtUtc,
            c.GetProductKeys());
    }

    private sealed record AdminPromotionDto(
        string Id,
        string Title,
        string Type,
        string Status,
        string EndsAt,
        bool IsActive,
        DateTime? StartsAtUtc,
        DateTime? EndsAtUtc,
        IReadOnlyList<string> ProductKeys);

    private sealed record UpsertPromotionRequest(
        string? Id,
        string Title,
        bool IsActive,
        DateTime? StartsAtUtc,
        DateTime? EndsAtUtc,
        IReadOnlyList<string>? ProductKeys);
}
