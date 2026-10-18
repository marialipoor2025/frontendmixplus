using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;

namespace MixPlus.Modules.Merchandising.Api;

/// <summary>
/// Admin CRUD for homepage product rails (best-seller / category sections).
/// </summary>
internal static class AdminRailsEndpoints
{
    public static void MapAdminRailsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/merchandising/rails").WithTags("AdminRails");
        group.MapGet("/", ListRails).WithName("AdminListRails");
        group.MapPost("/", CreateRail).WithName("AdminCreateRail");
        group.MapPut("/{id}", UpdateRail).WithName("AdminUpdateRail");
        group.MapDelete("/{id}", DeleteRail).WithName("AdminDeleteRail");
    }

    private static async Task<IResult> ListRails(MerchandisingDbContext db, CancellationToken ct)
    {
        var rows = await db.ProductRails.AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(ct);
        return Results.Ok(rows.Select(ToDto).ToList());
    }

    private static async Task<IResult> CreateRail(
        UpsertRailRequest body,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
        {
            return Results.BadRequest(new { error = "عنوان ریل الزامی است" });
        }

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"rail-{Guid.NewGuid():N}"[..16]
            : body.Id.Trim();

        if (await db.ProductRails.AnyAsync(x => x.ExternalKey == externalKey, ct))
        {
            return Results.Conflict(new { error = "شناسه ریل تکراری است" });
        }

        var sort = body.SortOrder > 0
            ? body.SortOrder
            : await db.ProductRails.CountAsync(ct) + 1;

        var rail = ProductRail.Create(
            externalKey,
            body.Title,
            sort,
            body.Subtitle,
            body.Href,
            body.ShowUsedLabel,
            body.ShowReviewScore,
            body.ShowCardLabels,
            body.LabelPosition ?? "beside");
        rail.SetActive(body.IsActive);
        rail.SetProductKeys(body.ProductKeys ?? []);
        db.ProductRails.Add(rail);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/admin/merchandising/rails/{rail.ExternalKey}", ToDto(rail));
    }

    private static async Task<IResult> UpdateRail(
        string id,
        UpsertRailRequest body,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
        {
            return Results.BadRequest(new { error = "عنوان ریل الزامی است" });
        }

        var rail = await db.ProductRails.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (rail is null)
        {
            return Results.NotFound(new { error = "ریل یافت نشد" });
        }

        rail.Update(
            body.Title,
            body.Subtitle,
            body.Href,
            body.ShowUsedLabel,
            body.SortOrder > 0 ? body.SortOrder : rail.SortOrder,
            body.ShowReviewScore,
            body.ShowCardLabels,
            body.LabelPosition);
        rail.SetActive(body.IsActive);
        if (body.ProductKeys is not null)
        {
            rail.SetProductKeys(body.ProductKeys);
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(rail));
    }

    private static async Task<IResult> DeleteRail(
        string id,
        MerchandisingDbContext db,
        CancellationToken ct)
    {
        var rail = await db.ProductRails.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (rail is null)
        {
            return Results.NotFound(new { error = "ریل یافت نشد" });
        }

        db.ProductRails.Remove(rail);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static object ToDto(ProductRail r) => new
    {
        id = r.ExternalKey,
        title = r.Title,
        subtitle = r.Subtitle,
        href = r.Href,
        showUsedLabel = r.ShowUsedLabel,
        showReviewScore = r.ShowReviewScore,
        showCardLabels = r.ShowCardLabels,
        labelPosition = r.LabelPosition,
        sortOrder = r.SortOrder,
        isActive = r.IsActive,
        productKeys = r.GetProductKeys(),
    };

    private sealed record UpsertRailRequest(
        string? Id,
        string Title,
        string? Subtitle,
        string? Href,
        bool ShowUsedLabel,
        bool ShowReviewScore,
        bool ShowCardLabels,
        string? LabelPosition,
        int SortOrder,
        bool IsActive,
        List<string>? ProductKeys);
}
