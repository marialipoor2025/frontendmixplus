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

        // Visual search: accept an image, return near-match candidates.
        // Common approach (Digikala/Amazon): embedding similarity over product images.
        // Until embeddings are trained, return popular in-stock products as a ranked stub.
        group.MapPost("/visual", async (
                HttpRequest request,
                IProductCardReadPort catalog,
                CancellationToken ct) =>
            {
                if (!request.HasFormContentType)
                {
                    return Results.BadRequest(new { error = "تصویر محصول را ارسال کنید" });
                }

                var form = await request.ReadFormAsync(ct);
                var file = form.Files.GetFile("image") ?? form.Files.FirstOrDefault();
                if (file is null || file.Length <= 0)
                {
                    return Results.BadRequest(new { error = "فایل تصویر خالی است" });
                }

                var contentType = file.ContentType ?? string.Empty;
                if (!contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
                    && !file.FileName.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
                    && !file.FileName.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)
                    && !file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
                    && !file.FileName.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.BadRequest(new { error = "فقط تصویر jpg/png/webp مجاز است" });
                }

                var limit = 24;
                if (int.TryParse(form["limit"], out var parsed) && parsed > 0)
                {
                    limit = Math.Min(parsed, 48);
                }

                var rows = await catalog.GetPopularProductsAsync(limit, ct);
                return Results.Ok(new
                {
                    mode = "popular-stub",
                    note = "جستجوی تصویری با embedding در مرحله بعد فعال می‌شود؛ فعلاً نزدیک‌ترین پیشنهادهای محبوب برگردانده شد.",
                    products = rows.Select(ToDto).ToList(),
                });
            })
            .DisableAntiforgery()
            .WithName("SearchVisual");
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
