using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Infrastructure;

public sealed class CatalogProductCardReadPort(CatalogDbContext db) : IProductCardReadPort
{
    public async Task<IReadOnlyList<ProductCardModel>> GetByExternalKeysAsync(
        IEnumerable<string> externalKeys,
        CancellationToken cancellationToken = default)
    {
        var keys = externalKeys
            .Where(k => !string.IsNullOrWhiteSpace(k))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (keys.Count == 0)
        {
            return [];
        }

        var rows = await db.Products.AsNoTracking()
            .Where(x => x.IsPublished && keys.Contains(x.ExternalKey))
            .ToListAsync(cancellationToken);

        var map = rows.ToDictionary(x => x.ExternalKey, StringComparer.OrdinalIgnoreCase);

        // Preserve request order
        return keys
            .Where(map.ContainsKey)
            .Select(k => ToModel(map[k]))
            .ToList();
    }

    public async Task<IReadOnlyList<BrandModel>> GetBrandsAsync(CancellationToken cancellationToken = default)
    {
        return await db.Brands.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new BrandModel(x.ExternalKey, x.Name, x.Slug, x.LogoUrl))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<HomeCategoryModel>> GetHomeCategoriesAsync(
        CancellationToken cancellationToken = default)
    {
        return await db.Categories.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(x => new HomeCategoryModel(x.ExternalKey, x.Title, x.Href, x.ImageUrl ?? string.Empty))
            .ToListAsync(cancellationToken);
    }

    private static ProductCardModel ToModel(Product product)
    {
        IReadOnlyList<string>? badges = null;
        if (!string.IsNullOrWhiteSpace(product.BadgesJson))
        {
            badges = JsonSerializer.Deserialize<List<string>>(product.BadgesJson);
        }

        return new ProductCardModel(
            product.ExternalKey,
            product.Title,
            product.Slug,
            product.ImageUrl,
            product.BrandExternalKey,
            product.BrandName,
            product.BrandLogoUrl,
            product.SellerExternalKey,
            product.SellerName,
            new MoneyModel(product.Price.Amount, product.Price.Currency),
            product.OriginalPrice is null
                ? null
                : new MoneyModel(product.OriginalPrice.Amount, product.OriginalPrice.Currency),
            product.DiscountPercent,
            product.Rating,
            product.ReviewCount,
            badges,
            product.Condition == ProductCondition.Used ? "used" : "new",
            product.InStock);
    }
}
