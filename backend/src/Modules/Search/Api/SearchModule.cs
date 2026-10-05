using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;

namespace MixPlus.Modules.Search.Api;

/// <summary>
/// Search &amp; discovery — query + suggest over Catalog via <see cref="IProductCardReadPort"/>.
/// </summary>
public sealed class SearchModule : IModule
{
    public string Name => "Search";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/search").WithTags("Search");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("SearchHealth");

        group.MapGet("/", async (
                string? q,
                int limit,
                IProductCardReadPort catalog,
                CancellationToken ct) =>
            {
                if (string.IsNullOrWhiteSpace(q))
                {
                    return Results.Ok(Array.Empty<object>());
                }

                var rows = await catalog.SearchProductsAsync(q, limit <= 0 ? 48 : limit, ct);
                return Results.Ok(rows.Select(ToDto).ToList());
            })
            .WithName("SearchProducts");

        group.MapGet("/suggest", async (
                string? q,
                int limit,
                IProductCardReadPort catalog,
                CancellationToken ct) =>
            {
                if (string.IsNullOrWhiteSpace(q))
                {
                    return Results.Ok(Array.Empty<object>());
                }

                var rows = await catalog.SuggestAsync(q, limit <= 0 ? 8 : limit, ct);
                return Results.Ok(rows.Select(s => new
                {
                    id = s.Id,
                    label = s.Label,
                    href = s.Href,
                    kind = s.Kind,
                }).ToList());
            })
            .WithName("SearchSuggest");
    }

    private static object ToDto(ProductCardModel p) => new
    {
        id = p.Id,
        title = p.Title,
        slug = p.Slug,
        imageUrl = p.ImageUrl,
        brandId = p.BrandId,
        brandName = p.BrandName,
        brandLogoUrl = p.BrandLogoUrl,
        sellerId = p.SellerId,
        sellerName = p.SellerName,
        price = new { amount = p.Price.Amount, currency = p.Price.Currency },
        originalPrice = p.OriginalPrice is null
            ? null
            : new { amount = p.OriginalPrice.Amount, currency = p.OriginalPrice.Currency },
        discountPercent = p.DiscountPercent,
        rating = p.Rating,
        reviewCount = p.ReviewCount,
        badges = p.Badges,
        condition = p.Condition,
        inStock = p.InStock,
    };
}
