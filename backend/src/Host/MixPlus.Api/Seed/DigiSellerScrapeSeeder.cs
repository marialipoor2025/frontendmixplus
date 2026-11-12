using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Domain.Digi;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Upserts Digikala seller scrape JSON (product-management / product-list / variants / category form)
/// into catalog Digi* mirror tables.
/// </summary>
public static class DigiSellerScrapeSeeder
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
        if (!config.GetValue("Seed:DigiScrape", true))
        {
            logger.LogInformation("Seed:DigiScrape=false — skipping Digikala scrape seed.");
            return;
        }

        var catalog = services.GetRequiredService<CatalogDbContext>();
        var dataRoot = ResolveDataRoot(config);
        var scrapedAt = DateTimeOffset.UtcNow;

        await SeedManagedAsync(catalog, dataRoot, scrapedAt, logger, cancellationToken);
        if (config.GetValue("Seed:DigiMarketplace", false))
        {
            await SeedMarketplaceAsync(catalog, dataRoot, scrapedAt, logger, cancellationToken);
        }
        else
        {
            // Digi seller panel must not use product-creation/search/v2 marketplace scrape.
            var marketplace = await catalog.DigiMarketplaceProducts.ToListAsync(cancellationToken);
            if (marketplace.Count > 0)
            {
                catalog.DigiMarketplaceProducts.RemoveRange(marketplace);
                logger.LogInformation(
                    "Cleared {Count} DigiMarketplaceProducts (Seed:DigiMarketplace=false)",
                    marketplace.Count);
            }
            else
            {
                logger.LogInformation(
                    "Seed:DigiMarketplace=false — skipping product-creation/search/v2 marketplace seed.");
            }
        }

        await SeedVariantsAsync(catalog, dataRoot, scrapedAt, logger, cancellationToken);
        await SeedCategorySchemaAsync(catalog, dataRoot, scrapedAt, logger, cancellationToken);

        await catalog.SaveChangesAsync(cancellationToken);
    }

    internal static string ResolveDataRoot(IConfiguration config)
    {
        var configured = config["Seed:DigiScrapePath"];
        if (!string.IsNullOrWhiteSpace(configured) && Directory.Exists(configured))
        {
            return configured;
        }

        // Prefer repo data/digikala-scrape when running from solution / published host.
        var candidates = new[]
        {
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..", "..", "data", "digikala-scrape")),
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..", "data", "digikala-scrape")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "data", "digikala-scrape")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "data", "digikala-scrape")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "data", "digikala-scrape")),
        };

        foreach (var c in candidates)
        {
            if (Directory.Exists(c))
            {
                return c;
            }
        }

        return candidates[0];
    }

    private static async Task SeedManagedAsync(
        CatalogDbContext catalog,
        string dataRoot,
        DateTimeOffset scrapedAt,
        ILogger logger,
        CancellationToken ct)
    {
        var path = Path.Combine(dataRoot, "product-management.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Digi scrape missing: {Path}", path);
            return;
        }

        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, ct));
        if (!doc.RootElement.TryGetProperty("items", out var items) || items.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        var fileScrapedAt = TryGetScrapedAt(doc.RootElement) ?? scrapedAt;
        var upserts = 0;
        foreach (var item in items.EnumerateArray())
        {
            var productId = item.GetProperty("product_id").GetInt64();
            var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
            var categoryTitle = null as string;
            if (item.TryGetProperty("main_category_title", out var cat) && cat.ValueKind == JsonValueKind.Object)
            {
                categoryTitle = cat.EnumerateObject().FirstOrDefault().Value.GetString();
            }

            var moderation = item.TryGetProperty("moderation_status", out var ms) &&
                             ms.ValueKind == JsonValueKind.Object &&
                             ms.TryGetProperty("status", out var st)
                ? st.GetString()
                : null;

            var payload = item.GetRawText();
            var existing = await catalog.DigiManagedProducts
                .FirstOrDefaultAsync(x => x.DigikalaProductId == productId, ct);
            if (existing is null)
            {
                catalog.DigiManagedProducts.Add(DigiManagedProduct.Create(
                    productId,
                    title,
                    payload,
                    fileScrapedAt,
                    titleEn: GetString(item, "title_en"),
                    brandTitle: GetString(item, "brand_title") ?? GetString(item, "brand_title_fa"),
                    brandId: GetLong(item, "brand_id"),
                    categoryTitle: categoryTitle,
                    status: GetString(item, "status"),
                    moderationStatus: moderation,
                    variantsCount: GetInt(item, "variants_count") ?? 0,
                    imageUrl: GetString(item, "image_src"),
                    productUrl: GetString(item, "product_url"),
                    site: GetString(item, "site"),
                    active: GetBool(item, "active") ?? true,
                    isOwner: GetBool(item, "is_owner") ?? false));
            }
            else
            {
                existing.ReplaceFromScrape(
                    title,
                    payload,
                    fileScrapedAt,
                    GetString(item, "title_en"),
                    GetString(item, "brand_title") ?? GetString(item, "brand_title_fa"),
                    GetLong(item, "brand_id"),
                    categoryTitle,
                    GetString(item, "status"),
                    moderation,
                    GetInt(item, "variants_count") ?? 0,
                    GetString(item, "image_src"),
                    GetString(item, "product_url"),
                    GetString(item, "site"),
                    GetBool(item, "active") ?? true,
                    GetBool(item, "is_owner") ?? false);
            }

            upserts++;
        }

        logger.LogInformation("DigiManagedProducts upserted {Count} rows from {Path}", upserts, path);
    }

    private static async Task SeedMarketplaceAsync(
        CatalogDbContext catalog,
        string dataRoot,
        DateTimeOffset scrapedAt,
        ILogger logger,
        CancellationToken ct)
    {
        var path = Path.Combine(dataRoot, "product-list.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Digi scrape missing: {Path}", path);
            return;
        }

        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, ct));
        if (!doc.RootElement.TryGetProperty("items", out var items) || items.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        var fileScrapedAt = TryGetScrapedAt(doc.RootElement) ?? scrapedAt;
        var upserts = 0;
        foreach (var item in items.EnumerateArray())
        {
            var productId = item.GetProperty("id").GetInt64();
            var title = GetString(item, "title") ?? "";
            var brand = item.TryGetProperty("brand", out var b) && b.ValueKind == JsonValueKind.Object
                ? GetString(b, "title_fa") ?? GetString(b, "title")
                : GetString(item, "brand");
            var category = item.TryGetProperty("category", out var c) && c.ValueKind == JsonValueKind.Object
                ? GetString(c, "title_fa") ?? GetString(c, "title")
                : GetString(item, "category");

            var payload = item.GetRawText();
            var existing = await catalog.DigiMarketplaceProducts
                .FirstOrDefaultAsync(x => x.DigikalaProductId == productId, ct);
            if (existing is null)
            {
                catalog.DigiMarketplaceProducts.Add(DigiMarketplaceProduct.Create(
                    productId,
                    title,
                    payload,
                    fileScrapedAt,
                    status: GetString(item, "status"),
                    minPriceRial: GetLong(item, "min_price"),
                    commission: GetString(item, "commission") ?? GetLong(item, "commission")?.ToString(),
                    marketPriceRial: GetLong(item, "market_price"),
                    priceType: GetString(item, "price_type"),
                    numberOfSellers: GetInt(item, "number_of_sellers") ?? 0,
                    isSelling: GetBool(item, "is_selling") ?? false,
                    brand: brand,
                    category: category,
                    imageUrl: GetString(item, "image_src"),
                    site: GetString(item, "site")));
            }
            else
            {
                existing.ReplaceFromScrape(
                    title,
                    payload,
                    fileScrapedAt,
                    GetString(item, "status"),
                    GetLong(item, "min_price"),
                    GetString(item, "commission") ?? GetLong(item, "commission")?.ToString(),
                    GetLong(item, "market_price"),
                    GetString(item, "price_type"),
                    GetInt(item, "number_of_sellers") ?? 0,
                    GetBool(item, "is_selling") ?? false,
                    brand,
                    category,
                    GetString(item, "image_src"),
                    GetString(item, "site"));
            }

            upserts++;
            if (upserts % 500 == 0)
            {
                await catalog.SaveChangesAsync(ct);
                logger.LogInformation("DigiMarketplaceProducts progress {Count}...", upserts);
            }
        }

        logger.LogInformation("DigiMarketplaceProducts upserted {Count} rows from {Path}", upserts, path);
    }

    private static async Task SeedVariantsAsync(
        CatalogDbContext catalog,
        string dataRoot,
        DateTimeOffset scrapedAt,
        ILogger logger,
        CancellationToken ct)
    {
        var path = Path.Combine(dataRoot, "variant-management.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Digi scrape missing: {Path}", path);
            return;
        }

        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, ct));
        if (!doc.RootElement.TryGetProperty("items", out var items) || items.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        var fileScrapedAt = TryGetScrapedAt(doc.RootElement) ?? scrapedAt;
        var upserts = 0;
        foreach (var item in items.EnumerateArray())
        {
            var variantId = item.GetProperty("id").GetInt64();
            var productId = GetLong(item, "product_id") ?? 0;
            var title = GetString(item, "title") ?? GetString(item, "product_title") ?? "";
            var stock = GetInt(item, "seller_stock");
            if (stock is null && item.TryGetProperty("price_list", out var pl) && pl.ValueKind == JsonValueKind.Object)
            {
                stock = GetInt(pl, "seller_stock");
            }

            var payload = item.GetRawText();
            var existing = await catalog.DigiSellerVariants
                .FirstOrDefaultAsync(x => x.DigikalaVariantId == variantId, ct);
            if (existing is null)
            {
                catalog.DigiSellerVariants.Add(DigiSellerVariant.Create(
                    variantId,
                    productId,
                    title,
                    payload,
                    fileScrapedAt,
                    productVariantId: GetLong(item, "product_variant_id"),
                    supplierCode: GetString(item, "supplier_code"),
                    productTitle: GetString(item, "product_title"),
                    categoryTitle: GetString(item, "main_category_title"),
                    categoryId: GetLong(item, "category_id"),
                    active: GetBool(item, "active") ?? false,
                    priceSaleRial: GetLong(item, "price_sale") ?? GetLong(item, "cash_selling_price"),
                    marketPriceRial: GetLong(item, "market_price"),
                    priceType: GetString(item, "price_type"),
                    sellerStock: stock,
                    imageUrl: GetString(item, "image_src"),
                    productUrl: GetString(item, "product_url")));
            }
            else
            {
                existing.ReplaceFromScrape(
                    productId,
                    title,
                    payload,
                    fileScrapedAt,
                    GetLong(item, "product_variant_id"),
                    GetString(item, "supplier_code"),
                    GetString(item, "product_title"),
                    GetString(item, "main_category_title"),
                    GetLong(item, "category_id"),
                    GetBool(item, "active") ?? false,
                    GetLong(item, "price_sale") ?? GetLong(item, "cash_selling_price"),
                    GetLong(item, "market_price"),
                    GetString(item, "price_type"),
                    stock,
                    GetString(item, "image_src"),
                    GetString(item, "product_url"));
            }

            upserts++;
        }

        logger.LogInformation("DigiSellerVariants upserted {Count} rows from {Path}", upserts, path);
    }

    private static async Task SeedCategorySchemaAsync(
        CatalogDbContext catalog,
        string dataRoot,
        DateTimeOffset scrapedAt,
        ILogger logger,
        CancellationToken ct)
    {
        var path = Path.Combine(dataRoot, "reverse-dkp-22846237-microwave.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Digi scrape missing: {Path}", path);
            return;
        }

        var raw = await File.ReadAllTextAsync(path, ct);
        using var doc = JsonDocument.Parse(raw);
        var root = doc.RootElement;
        var categoryId = root.GetProperty("categoryId").GetInt64();
        var leaf = GetString(root, "leafTitle") ?? "مایکروویو، مایکروفر";
        var pathJson = root.TryGetProperty("categoryPath", out var cp) ? cp.GetRawText() : null;
        var fileScrapedAt = TryGetScrapedAt(root) ?? scrapedAt;

        var existing = await catalog.DigiCategoryFormSchemas
            .FirstOrDefaultAsync(x => x.DigikalaCategoryId == categoryId, ct);
        if (existing is null)
        {
            catalog.DigiCategoryFormSchemas.Add(
                DigiCategoryFormSchema.Create(categoryId, leaf, raw, fileScrapedAt, pathJson));
        }
        else
        {
            existing.Replace(leaf, raw, fileScrapedAt, pathJson);
        }

        logger.LogInformation("DigiCategoryFormSchemas upserted category {CategoryId}", categoryId);
    }

    private static DateTimeOffset? TryGetScrapedAt(JsonElement root)
    {
        if (root.TryGetProperty("scrapedAt", out var s) && s.ValueKind == JsonValueKind.String)
        {
            if (DateTimeOffset.TryParse(s.GetString(), out var dto))
            {
                return dto;
            }
        }

        return null;
    }

    private static string? GetString(JsonElement el, string name) =>
        el.TryGetProperty(name, out var p) && p.ValueKind == JsonValueKind.String ? p.GetString() : null;

    private static long? GetLong(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p))
        {
            return null;
        }

        return p.ValueKind switch
        {
            JsonValueKind.Number when p.TryGetInt64(out var n) => n,
            JsonValueKind.String when long.TryParse(p.GetString(), out var n) => n,
            _ => null,
        };
    }

    private static int? GetInt(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p))
        {
            return null;
        }

        return p.ValueKind switch
        {
            JsonValueKind.Number when p.TryGetInt32(out var n) => n,
            JsonValueKind.String when int.TryParse(p.GetString(), out var n) => n,
            _ => null,
        };
    }

    private static bool? GetBool(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p))
        {
            return null;
        }

        return p.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null,
        };
    }
}
