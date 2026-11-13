using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Offers;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Domain.Variants;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;
using MixPlus.Modules.Navigation.Domain;
using MixPlus.Modules.Navigation.Infrastructure.Persistence;
using MixPlus.Modules.Promotions.Domain;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Domain;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Clears local catalog commerce rows and seeds Products / Categories / home rails / mega-menu
/// from Digikala <c>product-management</c> + <c>variant-management</c> scrapes only
/// (excludes marketplace <c>product-creation/search/v2</c>).
/// </summary>
public static class DigiCatalogFromScrapeSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private static readonly Dictionary<string, string> CategorySlugMap = new(StringComparer.Ordinal)
    {
        ["مایکروویو، مایکروفر"] = "microwave",
        ["سینک"] = "sink",
        ["هود"] = "hood",
        ["مخلوط کن"] = "blender",
        ["سرخ کن"] = "fryer",
        ["گاز صفحه ای"] = "cooktop",
        ["فر"] = "oven",
        ["اجاق گاز"] = "gas-stove",
    };

    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (!config.GetValue("Seed:DigiCatalog", false))
        {
            logger.LogInformation("Seed:DigiCatalog=false — skipping Digi → catalog seed.");
            return;
        }

        var dataRoot = DigiSellerScrapeSeeder.ResolveDataRoot(config);
        var mgmtPath = Path.Combine(dataRoot, "product-management.json");
        var variantPath = Path.Combine(dataRoot, "variant-management.json");
        if (!File.Exists(mgmtPath))
        {
            logger.LogWarning("Digi catalog seed skipped — missing {Path}", mgmtPath);
            return;
        }

        var catalog = services.GetRequiredService<CatalogDbContext>();
        var sellers = services.GetRequiredService<SellersDbContext>();
        var merchandising = services.GetRequiredService<MerchandisingDbContext>();
        var navigation = services.GetRequiredService<NavigationDbContext>();
        var promotions = services.GetRequiredService<PromotionsDbContext>();

        var overwrite = config.GetValue("Seed:Overwrite", false);
        var hasDigiProducts = await catalog.Products.AnyAsync(
            x => x.ExternalKey.StartsWith("dkp-"),
            cancellationToken);
        if (hasDigiProducts && !overwrite)
        {
            logger.LogInformation(
                "Digi catalog products already present — skip (Seed:Overwrite=true to refresh)");
            return;
        }

        logger.LogWarning("Digi catalog seed: clearing local products / related commerce rows…");
        await ClearCatalogCommerceAsync(catalog, logger, cancellationToken);

        var seller = await EnsureSellerAsync(sellers, logger, cancellationToken);
        var mgmtItems = await ReadItemsAsync(mgmtPath, cancellationToken);
        var variantItems = File.Exists(variantPath)
            ? await ReadItemsAsync(variantPath, cancellationToken)
            : [];

        var variantsByProduct = new Dictionary<long, List<JsonElement>>();
        foreach (var item in variantItems)
        {
            var productId = GetLong(item, "product_id") ?? 0;
            if (productId <= 0) continue;
            if (!variantsByProduct.TryGetValue(productId, out var list))
            {
                list = [];
                variantsByProduct[productId] = list;
            }

            list.Add(item);
        }

        var categoryMap = await EnsureCategoriesAsync(
            catalog,
            mgmtItems,
            variantsByProduct,
            logger,
            cancellationToken);

        var brandCache = new Dictionary<string, Brand>(StringComparer.OrdinalIgnoreCase);
        var created = 0;
        var productKeysByCategory = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var item in mgmtItems)
        {
            var productId = GetLong(item, "product_id");
            if (productId is null or <= 0) continue;

            var title = GetString(item, "title_fa")
                ?? GetString(item, "title")
                ?? $"DKP-{productId}";
            title = title.Trim();
            if (title.Length == 0) continue;

            var externalKey = $"dkp-{productId.Value}";
            var slug = externalKey;
            var imageUrl = UpgradeImageUrl(GetString(item, "image_src") ?? "");
            var brandName = GetString(item, "brand_title_fa")
                ?? GetString(item, "brand_title")
                ?? "میکس پلاس";
            brandName = brandName.Split('-')[0].Trim();
            if (brandName.Length == 0) brandName = "میکس پلاس";

            var brand = await EnsureBrandAsync(catalog, brandCache, brandName, cancellationToken);

            variantsByProduct.TryGetValue(productId.Value, out var variants);
            variants ??= [];
            var pricing = ResolvePricing(variants);
            var inStock = pricing.Stock > 0;
            var status = GetString(item, "status");
            var moderation = item.TryGetProperty("moderation_status", out var ms)
                && ms.ValueKind == JsonValueKind.Object
                && ms.TryGetProperty("status", out var st)
                ? st.GetString()
                : null;
            var active = GetBool(item, "active") ?? true;
            var isPublished = active
                && !string.Equals(status, "draft", StringComparison.OrdinalIgnoreCase)
                && (string.IsNullOrWhiteSpace(moderation)
                    || string.Equals(moderation, "approved", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(status, "marketable", StringComparison.OrdinalIgnoreCase));

            var (categoryTitle, categoryId) = ResolveCategory(item, variants);
            Category? category = null;
            if (!string.IsNullOrWhiteSpace(categoryTitle)
                && categoryMap.TryGetValue(categoryTitle, out var cat))
            {
                category = cat;
            }

            var product = Product.Create(
                externalKey,
                title,
                slug,
                imageUrl,
                brand.ExternalKey,
                brand.Name,
                seller.ExternalKey,
                seller.Name,
                Money.Create(pricing.SaleToman, "IRT"),
                inStock: inStock,
                isPublished: isPublished);

            product.ApplyDetails(
                brand.LogoUrl,
                pricing.ListToman is > 0 and var list && list > pricing.SaleToman
                    ? Money.Create(list, "IRT")
                    : null,
                pricing.DiscountPercent,
                rating: null,
                reviewCount: null,
                badges: null,
                ProductCondition.New,
                inStock);

            if (category is not null)
            {
                product.SetCategory(category.Id, category.ExternalKey, category.Title);
            }

            var weightKg = ResolveWeightKg(item);
            var supplierCode = variants
                .Select(v => GetString(v, "supplier_code"))
                .FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));

            product.ApplyCommerceAndSeo(
                supplierCode,
                weightKg,
                allowCashOnDelivery: false,
                minOrderQuantity: 1,
                taxPercent: null,
                dutyPercent: null,
                metaTitle: title,
                metaDescription: null,
                metaKeywords: categoryTitle,
                imageAlt: title,
                schemaJson: null);

            product.ReplacePdpContent(JsonSerializer.Serialize(new
            {
                introPreview = Truncate(title, 120),
                introFull = title,
                expertReviewTitle = "",
                expertReviewPreview = "",
                expertReviewFull = "",
                features = Array.Empty<object>(),
                showWarranty = false,
                warranty = "",
                showDelivery = true,
                deliveryTitle = "ارسال فروشنده",
                deliveryMethodLabel = "ارسال فروشنده",
                deliveryCostLabel = "",
                showPricePolicy = false,
                pricePolicyLabel = "",
                showInsurance = false,
                brandIntro = "",
                allowCashOnDelivery = false,
                minOrderQuantity = 1,
                weightKg,
                skuCode = supplierCode,
                metaTitle = title,
                metaDescription = "",
                metaKeywords = categoryTitle ?? "",
                digikalaProductId = productId.Value,
                digikalaCategoryId = categoryId,
                source = "digikala-seller-scrape",
            }, JsonOptions));

            catalog.Products.Add(product);

            catalog.Offers.Add(ProductOffer.Create(
                $"offer-{externalKey}-primary",
                product.Id,
                product.Slug,
                seller.ExternalKey,
                seller.Name,
                Money.Create(pricing.SaleToman, "IRT"),
                isOfficial: true,
                performanceLabel: "عالی",
                deliveryLabel: "موجود در انبار فروشنده",
                warranty: "",
                originalPrice: pricing.ListToman is > 0 and var ol && ol > pricing.SaleToman
                    ? Money.Create(ol, "IRT")
                    : null,
                discountPercent: pricing.DiscountPercent,
                sortOrder: 0));

            var skuIndex = 0;
            foreach (var variant in variants)
            {
                skuIndex++;
                var variantId = GetLong(variant, "id") ?? skuIndex;
                var stock = GetInt(variant, "seller_stock")
                    ?? GetInt(variant, "left_consumer")
                    ?? GetInt(variant, "marketplace_seller_stock")
                    ?? 0;
                var saleRial = GetLong(variant, "price_sale")
                    ?? GetLong(variant, "cash_selling_price")
                    ?? 0;
                var saleToman = RialToToman(saleRial);
                var listRial = GetLong(variant, "price_list") ?? GetLong(variant, "market_price") ?? 0;
                var listToman = RialToToman(listRial);
                var code = GetString(variant, "supplier_code") ?? $"DKV-{variantId}";

                catalog.Skus.Add(ProductSku.Create(
                    product.Id,
                    product.ExternalKey,
                    $"{code}-{variantId}",
                    [],
                    Money.Create(saleToman > 0 ? saleToman : pricing.SaleToman, "IRT"),
                    Math.Max(0, stock),
                    listToman > saleToman ? Money.Create(listToman, "IRT") : null,
                    DiscountOf(saleToman, listToman)));
            }

            if (category is not null)
            {
                if (!productKeysByCategory.TryGetValue(category.ExternalKey, out var keys))
                {
                    keys = [];
                    productKeysByCategory[category.ExternalKey] = keys;
                }

                keys.Add(externalKey);
            }

            created++;
            if (created % 40 == 0)
            {
                await catalog.SaveChangesAsync(cancellationToken);
            }
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Digi catalog seed: created {Count} products from seller scrape (marketplace search/v2 excluded)",
            created);

        await SeedHomeRailsAsync(merchandising, categoryMap, productKeysByCategory, logger, cancellationToken);
        await SeedAmazingOffersAsync(promotions, productKeysByCategory, logger, cancellationToken);
        await SeedMegaMenuAsync(navigation, categoryMap, logger, cancellationToken);
    }

    private static async Task ClearCatalogCommerceAsync(
        CatalogDbContext catalog,
        ILogger logger,
        CancellationToken ct)
    {
        catalog.Offers.RemoveRange(await catalog.Offers.ToListAsync(ct));
        catalog.Skus.RemoveRange(await catalog.Skus.ToListAsync(ct));
        catalog.OptionGroups.RemoveRange(await catalog.OptionGroups.ToListAsync(ct));
        catalog.SpecGroups.RemoveRange(await catalog.SpecGroups.ToListAsync(ct));
        catalog.Reviews.RemoveRange(await catalog.Reviews.ToListAsync(ct));
        catalog.Products.RemoveRange(await catalog.Products.ToListAsync(ct));
        catalog.Categories.RemoveRange(await catalog.Categories.ToListAsync(ct));
        catalog.DigiMarketplaceProducts.RemoveRange(
            await catalog.DigiMarketplaceProducts.ToListAsync(ct));
        await catalog.SaveChangesAsync(ct);
        logger.LogInformation(
            "Cleared Products/Offers/Skus/Categories and DigiMarketplaceProducts (search/v2 mirror)");
    }

    private static async Task<Seller> EnsureSellerAsync(
        SellersDbContext sellers,
        ILogger logger,
        CancellationToken ct)
    {
        var key = SellerPortalSeeder.DemoSellerKey;
        var name = SellerPortalSeeder.DemoSellerName;
        var ownerUserId = StableGuid.From($"user:phone:{SellerPortalSeeder.DemoPhone}");

        var seller = await sellers.Sellers.FirstOrDefaultAsync(x => x.ExternalKey == key, ct);
        if (seller is null)
        {
            seller = Seller.Create(key, name, rating: 4.8m, status: "approved");
            seller.AssignOwner(ownerUserId);
            sellers.Sellers.Add(seller);
            logger.LogInformation("Digi catalog seed: created seller {Key}", key);
        }
        else
        {
            seller.Update(name);
            seller.SetStatus("approved");
            seller.AssignOwner(ownerUserId);
        }

        await sellers.SaveChangesAsync(ct);
        return seller;
    }

    private static async Task<Brand> EnsureBrandAsync(
        CatalogDbContext catalog,
        Dictionary<string, Brand> cache,
        string brandName,
        CancellationToken ct)
    {
        if (cache.TryGetValue(brandName, out var cached))
        {
            return cached;
        }

        var slug = SlugifyLatin(brandName);
        var key = $"b-digi-{slug}";
        // MixPlus is a seller/brand on Oriya — only that brand gets the MixPlus mark.
        var isMixPlus =
            brandName.Contains("میکس پلاس", StringComparison.OrdinalIgnoreCase)
            || brandName.Contains("mixplus", StringComparison.OrdinalIgnoreCase)
            || brandName.Contains("mix plus", StringComparison.OrdinalIgnoreCase);
        // Only MixPlus keeps the MixPlus mark — never reuse it for Tefal/etc.
        var logoUrl = isMixPlus ? "/brand/mixplus-logo.svg" : "";
        var existing = await catalog.Brands.FirstOrDefaultAsync(x => x.ExternalKey == key, ct);
        if (existing is null)
        {
            existing = Brand.Create(key, brandName, slug, logoUrl);
            catalog.Brands.Add(existing);
            await catalog.SaveChangesAsync(ct);
        }
        else if (!string.Equals(existing.LogoUrl, logoUrl, StringComparison.Ordinal)
                 || !string.Equals(existing.Name, brandName, StringComparison.Ordinal))
        {
            existing.Update(brandName, slug, logoUrl);
            await catalog.SaveChangesAsync(ct);
        }

        cache[brandName] = existing;
        return existing;
    }

    private static async Task<Dictionary<string, Category>> EnsureCategoriesAsync(
        CatalogDbContext catalog,
        List<JsonElement> mgmtItems,
        Dictionary<long, List<JsonElement>> variantsByProduct,
        ILogger logger,
        CancellationToken ct)
    {
        const string rootKey = "cat-home-appliances";
        var root = Category.Create(
            rootKey,
            "لوازم خانگی برقی",
            "home-appliances",
            "/categories/home-appliances",
            imageUrl: null,
            parentId: null,
            sortOrder: 0);
        catalog.Categories.Add(root);

        var titles = new SortedDictionary<string, long?>(StringComparer.Ordinal);
        foreach (var item in mgmtItems)
        {
            var productId = GetLong(item, "product_id") ?? 0;
            variantsByProduct.TryGetValue(productId, out var variants);
            var (title, catId) = ResolveCategory(item, variants ?? []);
            if (string.IsNullOrWhiteSpace(title)) continue;
            if (!titles.ContainsKey(title) || titles[title] is null)
            {
                titles[title] = catId;
            }
        }

        var map = new Dictionary<string, Category>(StringComparer.Ordinal);
        var sort = 0;
        foreach (var (title, digiCatId) in titles)
        {
            sort++;
            var slug = CategorySlugMap.TryGetValue(title, out var mapped)
                ? mapped
                : $"digi-{StableHash(title)}";
            var key = digiCatId is > 0
                ? $"digi-cat-{digiCatId.Value}"
                : $"digi-cat-{slug}";
            var href = $"/categories/{slug}";
            var category = Category.Create(
                key,
                title,
                slug,
                href,
                imageUrl: null,
                parentId: root.Id,
                sortOrder: sort);
            catalog.Categories.Add(category);
            map[title] = category;
        }

        await catalog.SaveChangesAsync(ct);
        logger.LogInformation(
            "Digi catalog seed: root + {Count} leaf categories from scrape",
            map.Count);
        return map;
    }

    private static async Task SeedHomeRailsAsync(
        MerchandisingDbContext merchandising,
        Dictionary<string, Category> categoryMap,
        Dictionary<string, List<string>> productKeysByCategory,
        ILogger logger,
        CancellationToken ct)
    {
        var existing = await merchandising.ProductRails.ToListAsync(ct);
        merchandising.ProductRails.RemoveRange(existing);

        const int maxPerRail = 16;
        var sort = 100;
        var rails = 0;

        foreach (var (title, category) in categoryMap.OrderBy(x => x.Value.SortOrder))
        {
            if (!productKeysByCategory.TryGetValue(category.ExternalKey, out var keys)
                || keys.Count == 0)
            {
                continue;
            }

            var rail = ProductRail.Create(
                $"rail-digi-{category.Slug}",
                title,
                sort++,
                $"{FaDigits(keys.Count)} کالا",
                category.Href,
                showUsedLabel: false);
            rail.SetProductKeys(keys.Take(maxPerRail).ToList());
            merchandising.ProductRails.Add(rail);
            rails++;
        }

        var allKeys = productKeysByCategory.Values.SelectMany(x => x).Distinct().Take(maxPerRail).ToList();
        if (allKeys.Count > 0)
        {
            var popular = ProductRail.Create(
                "rail-popular",
                "محبوب‌ترین‌ها",
                99,
                "محبوب‌ترین کالاها نزد خریداران",
                "/search?sort=popular",
                showUsedLabel: false);
            popular.SetProductKeys(allKeys);
            merchandising.ProductRails.Add(popular);
            rails++;
        }

        await merchandising.SaveChangesAsync(ct);
        logger.LogInformation("Digi catalog seed: home rails={Count}", rails);
    }

    private static async Task SeedAmazingOffersAsync(
        PromotionsDbContext promotions,
        Dictionary<string, List<string>> productKeysByCategory,
        ILogger logger,
        CancellationToken ct)
    {
        const string key = "amazing-offers";
        var keys = productKeysByCategory.Values
            .SelectMany(x => x)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(12)
            .ToList();

        var existing = await promotions.OfferCampaigns.FirstOrDefaultAsync(
            x => x.ExternalKey == key,
            ct);
        if (existing is null)
        {
            var campaign = OfferCampaign.Create(key, "پیشنهاد شگفت‌انگیز");
            campaign.SetProductKeys(keys);
            promotions.OfferCampaigns.Add(campaign);
        }
        else
        {
            existing.SetProductKeys(keys);
        }

        await promotions.SaveChangesAsync(ct);
        logger.LogInformation("Digi catalog seed: amazing-offers={Count}", keys.Count);
    }

    private static async Task SeedMegaMenuAsync(
        NavigationDbContext navigation,
        Dictionary<string, Category> categoryMap,
        ILogger logger,
        CancellationToken ct)
    {
        navigation.MegaLinks.RemoveRange(await navigation.MegaLinks.ToListAsync(ct));
        navigation.MegaColumns.RemoveRange(await navigation.MegaColumns.ToListAsync(ct));
        navigation.MegaCategories.RemoveRange(await navigation.MegaCategories.ToListAsync(ct));
        await navigation.SaveChangesAsync(ct);

        const string megaKey = "digi-home-appliances";
        navigation.MegaCategories.Add(NavMegaCategory.Create(
            megaKey,
            "لوازم خانگی برقی",
            "/categories/home-appliances",
            "appliance",
            "همه کالاهای لوازم خانگی برقی",
            sortOrder: 1));

        const string colKey = "digi-home-appliances-col-1";
        navigation.MegaColumns.Add(NavMegaColumn.Create(colKey, megaKey, sortOrder: 1));

        var linkSort = 0;
        foreach (var category in categoryMap.Values.OrderBy(x => x.SortOrder))
        {
            linkSort++;
            navigation.MegaLinks.Add(NavMegaLink.Create(
                $"digi-link-{category.ExternalKey}",
                colKey,
                category.Title,
                category.Href,
                MegaLinkKind.Leaf,
                linkSort));
        }

        await navigation.SaveChangesAsync(ct);
        logger.LogInformation("Digi catalog seed: mega-menu links={Count}", linkSort);
    }

    private static async Task<List<JsonElement>> ReadItemsAsync(string path, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, ct));
        if (!doc.RootElement.TryGetProperty("items", out var items)
            || items.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return items.EnumerateArray().Select(x => x.Clone()).ToList();
    }

    private static (string? Title, long? CategoryId) ResolveCategory(
        JsonElement item,
        List<JsonElement> variants)
    {
        string? title = null;
        long? categoryId = null;

        if (item.TryGetProperty("main_category_title", out var cat)
            && cat.ValueKind == JsonValueKind.Object)
        {
            foreach (var prop in cat.EnumerateObject())
            {
                if (long.TryParse(prop.Name, out var id))
                {
                    categoryId = id;
                }

                title = prop.Value.GetString();
                break;
            }
        }

        foreach (var variant in variants)
        {
            title ??= GetString(variant, "main_category_title");
            categoryId ??= GetLong(variant, "category_id");
            if (title is not null && categoryId is not null) break;
        }

        return (string.IsNullOrWhiteSpace(title) ? null : title.Trim(), categoryId);
    }

    private static (decimal SaleToman, decimal ListToman, int Stock, int? DiscountPercent) ResolvePricing(
        List<JsonElement> variants)
    {
        if (variants.Count == 0)
        {
            return (0, 0, 0, null);
        }

        JsonElement? best = null;
        long bestSale = long.MaxValue;
        foreach (var v in variants)
        {
            var sale = GetLong(v, "price_sale") ?? GetLong(v, "cash_selling_price") ?? 0;
            if (sale <= 0) continue;
            if (sale < bestSale)
            {
                bestSale = sale;
                best = v;
            }
        }

        best ??= variants[0];
        var saleRial = GetLong(best.Value, "price_sale")
            ?? GetLong(best.Value, "cash_selling_price")
            ?? 0;
        var listRial = GetLong(best.Value, "price_list")
            ?? GetLong(best.Value, "market_price")
            ?? 0;
        // Inactive / unset sale price: still surface list/market so PDP is not 0.
        if (saleRial <= 0 && listRial > 0)
        {
            saleRial = listRial;
        }

        var stock = GetInt(best.Value, "seller_stock")
            ?? GetInt(best.Value, "left_consumer")
            ?? GetInt(best.Value, "marketplace_seller_stock")
            ?? 0;

        var saleToman = RialToToman(saleRial);
        var listToman = RialToToman(listRial);
        return (saleToman, listToman, Math.Max(0, stock), DiscountOf(saleToman, listToman));
    }

    private static decimal? ResolveWeightKg(JsonElement item)
    {
        if (!item.TryGetProperty("product_dimension", out var dim)
            || dim.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var grams = GetInt(dim, "weight");
        if (grams is null or <= 0) return null;
        return Math.Round(grams.Value / 1000m, 3);
    }

    private static decimal RialToToman(long rial) =>
        rial <= 0 ? 0 : Math.Round(rial / 10m, 0, MidpointRounding.AwayFromZero);

    private static int? DiscountOf(decimal sale, decimal list)
    {
        if (list <= 0 || sale <= 0 || list <= sale) return null;
        return (int)Math.Round((1 - (sale / list)) * 100m, 0, MidpointRounding.AwayFromZero);
    }

    private static string UpgradeImageUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return string.Empty;
        return url
            .Replace("/resize,m_lfit,h_115,w_115/", "/resize,m_lfit,h_800,w_800/", StringComparison.Ordinal)
            .Replace("/resize,h_115,w_115/", "/resize,h_800,w_800/", StringComparison.Ordinal);
    }

    private static string SlugifyLatin(string value)
    {
        var normalized = value.Trim().ToLowerInvariant();
        var sb = new StringBuilder(normalized.Length);
        foreach (var ch in normalized)
        {
            if (ch is >= 'a' and <= 'z' or >= '0' and <= '9')
            {
                sb.Append(ch);
            }
            else if (ch is ' ' or '-' or '_')
            {
                sb.Append('-');
            }
        }

        var slug = Regex.Replace(sb.ToString(), "-{2,}", "-").Trim('-');
        return string.IsNullOrWhiteSpace(slug) ? StableHash(value) : slug;
    }

    private static string StableHash(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash.AsSpan(0, 4)).ToLowerInvariant();
    }

    private static string FaDigits(int value) =>
        value.ToString(CultureInfo.InvariantCulture)
            .Replace('0', '۰').Replace('1', '۱').Replace('2', '۲').Replace('3', '۳')
            .Replace('4', '۴').Replace('5', '۵').Replace('6', '۶').Replace('7', '۷')
            .Replace('8', '۸').Replace('9', '۹');

    private static string Truncate(string value, int max) =>
        value.Length <= max ? value : value[..max];

    private static string? GetString(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p)) return null;
        return p.ValueKind switch
        {
            JsonValueKind.String => p.GetString(),
            JsonValueKind.Number => p.ToString(),
            _ => null,
        };
    }

    private static long? GetLong(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p)) return null;
        if (p.ValueKind == JsonValueKind.Number && p.TryGetInt64(out var n)) return n;
        if (p.ValueKind == JsonValueKind.String
            && long.TryParse(p.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var s))
        {
            return s;
        }

        return null;
    }

    private static int? GetInt(JsonElement el, string name)
    {
        var n = GetLong(el, name);
        return n is null ? null : (int)Math.Clamp(n.Value, int.MinValue, int.MaxValue);
    }

    private static bool? GetBool(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p)) return null;
        return p.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null,
        };
    }
}
