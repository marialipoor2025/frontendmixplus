using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class ProductOfferEndpoints
{
    public static void MapProductOfferEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var catalog = endpoints.MapGroup("/api/catalog").WithTags("Catalog");
        catalog.MapGet("/products/{productKey}/offers", ListProductOffers)
            .WithName("ListProductOffers");
    }

    private static async Task<IResult> ListProductOffers(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var slug = productKey.Trim().ToLowerInvariant();
        var product = await db.Products.AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.IsPublished && (x.Slug == slug || x.ExternalKey == productKey),
                ct);
        if (product is null)
            return Results.NotFound(new { error = "محصول یافت نشد" });

        var offers = await db.Offers.AsNoTracking()
            .Where(x => x.IsActive && x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Price.Amount)
            .ToListAsync(ct);

        if (offers.Count == 0)
        {
            // Single-seller PDP: use product card + seller PdpContentJson for buy-box copy.
            return Results.Ok(new[]
            {
                MapSynthetic(product),
            });
        }

        var mapped = offers.Select(o => new
        {
            id = o.ExternalKey,
            name = o.SellerName,
            href = $"/seller/{o.SellerExternalKey}",
            isOfficial = o.IsOfficial,
            performanceLabel = o.PerformanceLabel,
            deliveryLabel = o.DeliveryLabel,
            warranty = o.Warranty,
            price = o.Price.Amount,
            originalPrice = o.OriginalPrice != null ? (decimal?)o.OriginalPrice.Amount : null,
            discountPercent = o.DiscountPercent,
            stats = o.MemberSinceLabel is null
                ? null
                : new
                {
                    memberSinceLabel = o.MemberSinceLabel,
                    onTimeSupplyPercent = o.OnTimeSupplyPercent ?? 0,
                    shipCommitmentPercent = o.ShipCommitmentPercent ?? 0,
                    noReturnPercent = o.NoReturnPercent ?? 0,
                },
        }).ToList();

        return Results.Ok(mapped);
    }

    private static object MapSynthetic(Domain.Products.Product product)
    {
        var content = ProductPdpContentEndpoints.ReadContent(product);
        var delivery =
            !string.IsNullOrWhiteSpace(content?.DeliveryMethodLabel)
                ? content!.DeliveryMethodLabel!
            : !string.IsNullOrWhiteSpace(content?.DeliveryTitle)
                ? content!.DeliveryTitle!
                : "باربری توسط میکس پلاس";
        var warranty = !string.IsNullOrWhiteSpace(content?.Warranty)
            ? content!.Warranty!
            : "گارانتی اصالت و سلامت فیزیکی کالا";

        return new
        {
            id = product.SellerExternalKey,
            name = product.SellerName,
            href = $"/seller/{product.SellerExternalKey}",
            isOfficial = true,
            performanceLabel = "عالی",
            deliveryLabel = delivery,
            warranty,
            price = product.Price.Amount,
            originalPrice = product.OriginalPrice != null ? (decimal?)product.OriginalPrice.Amount : null,
            discountPercent = product.DiscountPercent,
            stats = new
            {
                memberSinceLabel = "عضو رسمی میکس پلاس",
                onTimeSupplyPercent = 100m,
                shipCommitmentPercent = 100m,
                noReturnPercent = 99m,
            },
        };
    }
}
