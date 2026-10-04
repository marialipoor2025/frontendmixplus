using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Domain;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Seeds Catalog + Sellers tables from frontend homepage mock JSON.
/// </summary>
public static class CatalogSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var catalog = services.GetRequiredService<CatalogDbContext>();
        var sellers = services.GetRequiredService<SellersDbContext>();
        var overwrite = config.GetValue("Seed:Overwrite", false);

        var hasProducts = await catalog.Products.AnyAsync(cancellationToken);
        if (hasProducts && !overwrite)
        {
            logger.LogInformation("Catalog products already present — skip (Seed:Overwrite=true to refresh)");
            return;
        }

        var homeJson = await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "Seed", "data", "home.json"),
            cancellationToken);
        var home = JsonSerializer.Deserialize<HomeSeedDocument>(homeJson, JsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize home.json for catalog seed.");

        var productSources = CollectProducts(home);
        logger.LogInformation("Catalog seed: {Count} unique products from home.json", productSources.Count);

        // Sellers
        foreach (var group in productSources.GroupBy(p => p.SellerId))
        {
            var sample = group.First();
            var existing = await sellers.Sellers.FirstOrDefaultAsync(
                x => x.ExternalKey == sample.SellerId,
                cancellationToken);
            if (existing is null)
            {
                sellers.Sellers.Add(Seller.Create(sample.SellerId, sample.SellerName));
            }
            else if (overwrite)
            {
                existing.Update(sample.SellerName);
            }
        }

        await sellers.SaveChangesAsync(cancellationToken);

        // Brands from showcase + product denormalized brand fields
        var brandMap = new Dictionary<string, BrandSeed>(StringComparer.OrdinalIgnoreCase);
        foreach (var brand in home.Brands ?? [])
        {
            brandMap[brand.Id] = brand;
        }

        foreach (var product in productSources)
        {
            if (!brandMap.ContainsKey(product.BrandId))
            {
                brandMap[product.BrandId] = new BrandSeed(
                    product.BrandId,
                    product.BrandName,
                    product.BrandId.Replace("b-", "", StringComparison.OrdinalIgnoreCase),
                    product.BrandLogoUrl ?? string.Empty);
            }
        }

        foreach (var brand in brandMap.Values)
        {
            var existing = await catalog.Brands.FirstOrDefaultAsync(
                x => x.ExternalKey == brand.Id,
                cancellationToken);
            if (existing is null)
            {
                catalog.Brands.Add(Brand.Create(brand.Id, brand.Name, brand.Slug, brand.LogoUrl ?? string.Empty));
            }
            else if (overwrite)
            {
                existing.Update(brand.Name, brand.Slug, brand.LogoUrl ?? string.Empty);
            }
        }

        // Homepage category circles
        var sort = 0;
        foreach (var category in home.Categories ?? [])
        {
            sort++;
            var slug = SlugFromHref(category.Href) ?? category.Id;
            var existing = await catalog.Categories.FirstOrDefaultAsync(
                x => x.ExternalKey == category.Id,
                cancellationToken);
            if (existing is null)
            {
                catalog.Categories.Add(
                    Category.Create(category.Id, category.Title, slug, category.Href, category.ImageUrl, sortOrder: sort));
            }
            else if (overwrite)
            {
                existing.Update(category.Title, slug, category.Href, category.ImageUrl, sort);
            }
        }

        // Products (disambiguate duplicate mock slugs — unique index on Slug)
        var usedSlugs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var source in productSources)
        {
            var price = Money.Create(source.Price.Amount, source.Price.Currency);
            Money? original = source.OriginalPrice is null
                ? null
                : Money.Create(source.OriginalPrice.Amount, source.OriginalPrice.Currency);
            var condition = string.Equals(source.Condition, "used", StringComparison.OrdinalIgnoreCase)
                ? ProductCondition.Used
                : ProductCondition.New;
            var slug = UniqueSlug(source.Slug, source.Id, usedSlugs);

            var existing = await catalog.Products.FirstOrDefaultAsync(
                x => x.ExternalKey == source.Id,
                cancellationToken);

            if (existing is null)
            {
                var product = Product.Create(
                    source.Id,
                    source.Title,
                    slug,
                    source.ImageUrl,
                    source.BrandId,
                    source.BrandName,
                    source.SellerId,
                    source.SellerName,
                    price,
                    source.InStock);
                product.ApplyDetails(
                    source.BrandLogoUrl,
                    original,
                    source.DiscountPercent,
                    source.Rating,
                    source.ReviewCount,
                    source.Badges,
                    condition,
                    source.InStock);
                catalog.Products.Add(product);
            }
            else if (overwrite)
            {
                existing.UpdateCore(
                    source.Title,
                    slug,
                    source.ImageUrl,
                    source.BrandId,
                    source.BrandName,
                    source.SellerId,
                    source.SellerName,
                    price);
                existing.ApplyDetails(
                    source.BrandLogoUrl,
                    original,
                    source.DiscountPercent,
                    source.Rating,
                    source.ReviewCount,
                    source.Badges,
                    condition,
                    source.InStock);
            }
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Catalog seed complete: brands={Brands}, categories={Categories}, products={Products}, sellers={Sellers}",
            await catalog.Brands.CountAsync(cancellationToken),
            await catalog.Categories.CountAsync(cancellationToken),
            await catalog.Products.CountAsync(cancellationToken),
            await sellers.Sellers.CountAsync(cancellationToken));
    }

    private static List<ProductSeed> CollectProducts(HomeSeedDocument home)
    {
        var map = new Dictionary<string, ProductSeed>(StringComparer.OrdinalIgnoreCase);

        void AddRange(IEnumerable<ProductSeed>? items)
        {
            if (items is null)
            {
                return;
            }

            foreach (var item in items)
            {
                map[item.Id] = item;
            }
        }

        AddRange(home.AmazingOffers);
        foreach (var rail in home.ProductRails ?? [])
        {
            AddRange(rail.Products);
        }

        return map.Values.ToList();
    }

    private static string UniqueSlug(string slug, string externalKey, HashSet<string> used)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        if (used.Add(normalized))
        {
            return normalized;
        }

        var fallback = $"{normalized}-{externalKey.Trim().ToLowerInvariant()}";
        used.Add(fallback);
        return fallback;
    }

    private static string? SlugFromHref(string? href)
    {
        if (string.IsNullOrWhiteSpace(href))
        {
            return null;
        }

        var path = href.Split('?', 2)[0].Trim('/');
        var segment = path.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
        return string.IsNullOrWhiteSpace(segment) ? null : segment.ToLowerInvariant();
    }

    private sealed record HomeSeedDocument(
        IReadOnlyList<CategorySeed>? Categories,
        IReadOnlyList<ProductSeed>? AmazingOffers,
        IReadOnlyList<BrandSeed>? Brands,
        IReadOnlyList<RailSeed>? ProductRails);

    private sealed record CategorySeed(string Id, string Title, string Href, string ImageUrl);

    private sealed record BrandSeed(string Id, string Name, string Slug, string? LogoUrl);

    private sealed record RailSeed(string Id, IReadOnlyList<ProductSeed>? Products);

    private sealed record MoneySeed(decimal Amount, string Currency);

    private sealed record ProductSeed(
        string Id,
        string Title,
        string Slug,
        string ImageUrl,
        string BrandId,
        string BrandName,
        string? BrandLogoUrl,
        string SellerId,
        string SellerName,
        MoneySeed Price,
        MoneySeed? OriginalPrice,
        int? DiscountPercent,
        decimal? Rating,
        int? ReviewCount,
        IReadOnlyList<string>? Badges,
        string? Condition,
        bool InStock);
}
