using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class OfferEndpoints
{
    public static void MapOfferEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var admin = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        admin.MapGet("/offers", ListOffers).WithName("AdminListOffers");
        admin.MapPatch("/offers/{productKey}", PatchOffer).WithName("AdminPatchOffer");
    }

    private static async Task<IResult> ListOffers(CatalogDbContext db, CancellationToken ct)
    {
        var products = await db.Products.AsNoTracking()
            .OrderBy(x => x.Title)
            .ToListAsync(ct);

        var skus = await db.Skus.AsNoTracking().ToListAsync(ct);
        var stockByProduct = skus
            .GroupBy(s => s.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Stock));

        var items = products.Select(p => new
        {
            id = p.ExternalKey,
            seller = p.SellerName,
            product = p.Title,
            price = p.Price.Amount,
            stock = stockByProduct.GetValueOrDefault(p.Id),
            status = p.IsPublished ? "active" : "paused",
        }).ToList();

        return Results.Ok(items);
    }

    private static async Task<IResult> PatchOffer(
        string productKey,
        PatchOfferRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await db.Products.FirstOrDefaultAsync(
            x => x.ExternalKey == productKey || x.Slug == productKey,
            ct);
        if (product is null) return Results.NotFound(new { error = "آفر یافت نشد" });

        if (!string.IsNullOrWhiteSpace(body.Status))
        {
            product.SetPublished(body.Status.Trim().Equals("active", StringComparison.OrdinalIgnoreCase));
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(new
        {
            id = product.ExternalKey,
            seller = product.SellerName,
            product = product.Title,
            price = product.Price.Amount,
            status = product.IsPublished ? "active" : "paused",
        });
    }

    private sealed record PatchOfferRequest(string? Status);
}
