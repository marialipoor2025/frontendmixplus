using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Application.Products;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class ProductMediaEndpoints
{
    public static void MapProductMediaEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/catalog").WithTags("Catalog");
        group.MapGet("/products/{productKey}/media", GetProductMedia)
            .WithName("GetProductMedia");
    }

    private static async Task<IResult> GetProductMedia(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == productKey || x.Slug == productKey, ct);
        if (product is null)
        {
            return Results.NotFound(new { error = "محصول یافت نشد" });
        }

        var images = product.MediaItems
            .OrderBy(x => x.SortOrder)
            .Select(x => new ProductMediaDto(
                x.MediaAssetId.ToString("D"),
                ProductMediaUrls.Gallery(x.MediaAssetId),
                ProductMediaUrls.Thumb(x.MediaAssetId),
                product.Title,
                x.IsPrimary))
            .ToList();

        // Fallback: single denormalized card image when gallery not linked yet.
        if (images.Count == 0 && !string.IsNullOrWhiteSpace(product.ImageUrl))
        {
            images.Add(new ProductMediaDto(
                "primary",
                product.ImageUrl,
                product.ImageUrl,
                product.Title,
                true));
        }

        return Results.Ok(new ProductGalleryDto(images));
    }
}
