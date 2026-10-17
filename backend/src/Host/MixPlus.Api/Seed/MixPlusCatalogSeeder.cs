using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Domain.Specs;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Identity.Domain;
using MixPlus.Modules.Identity.Infrastructure.Persistence;
using MixPlus.Modules.Media.Application;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Domain;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Registers seller «میکس پلاس» and upserts products from <c>Seed/data/mixplus-products.json</c>
/// (generated from <c>data entry/products.xlsx</c>).
/// </summary>
public static class MixPlusCatalogSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Seed", "data", "mixplus-products.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("MixPlus catalog seed skipped — missing {Path}", path);
            return;
        }

        var doc = JsonSerializer.Deserialize<MixPlusImportDocument>(
            await File.ReadAllTextAsync(path, cancellationToken),
            JsonOptions);
        if (doc?.Seller is null || doc.Products is null || doc.Products.Count == 0)
        {
            logger.LogWarning("MixPlus catalog seed skipped — empty or invalid JSON");
            return;
        }

        var overwrite = config.GetValue("Seed:OverwriteMixPlus", true)
            || config.GetValue("Seed:Overwrite", false);

        var sellers = services.GetRequiredService<SellersDbContext>();
        var catalog = services.GetRequiredService<CatalogDbContext>();
        var identity = services.GetRequiredService<IdentityDbContext>();
        var media = services.GetRequiredService<IMediaUploadService>();
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(45) };
        http.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (compatible; MixPlusImporter/1.0; +https://mixplusshop.ir)");
        http.DefaultRequestHeaders.Accept.ParseAdd("image/*,*/*");

        var seller = await EnsureSellerAsync(sellers, identity, doc.Seller, logger, cancellationToken);
        var brand = await EnsureBrandAsync(catalog, doc.Brand, logger, cancellationToken);
        await EnsureBrandAsync(
            catalog,
            new BrandSeed("b-moulinex", "Moulinex", "moulinex", "/placeholders/product-appliance.png"),
            logger,
            cancellationToken);
        var categories = await EnsureCategoriesAsync(catalog, doc.Products, logger, cancellationToken);

        if (overwrite)
        {
            // Drop prior MixPlus import rows so renamed external keys don't leave orphans.
            var stale = await catalog.Products
                .Where(x => x.SellerExternalKey == seller.ExternalKey || x.ExternalKey.StartsWith("mp-"))
                .ToListAsync(cancellationToken);
            if (stale.Count > 0)
            {
                var staleIds = stale.Select(x => x.Id).ToList();
                var staleSpecs = await catalog.SpecGroups
                    .Where(x => staleIds.Contains(x.ProductId))
                    .ToListAsync(cancellationToken);
                if (staleSpecs.Count > 0)
                {
                    catalog.SpecGroups.RemoveRange(staleSpecs);
                }

                catalog.Products.RemoveRange(stale);
                await catalog.SaveChangesAsync(cancellationToken);
                logger.LogInformation("MixPlus seed: removed {Count} previous import products", stale.Count);
            }
        }

        var usedSlugs = await catalog.Products.AsNoTracking()
            .Select(x => new { x.Id, x.Slug })
            .ToListAsync(cancellationToken);
        var slugOwners = usedSlugs.ToDictionary(x => x.Slug, x => x.Id, StringComparer.OrdinalIgnoreCase);

        var created = 0;
        var updated = 0;
        var imagesOk = 0;
        var imagesFail = 0;

        foreach (var row in doc.Products)
        {
            if (string.IsNullOrWhiteSpace(row.ExternalKey) || string.IsNullOrWhiteSpace(row.Title))
            {
                continue;
            }

            var existing = await catalog.Products
                .Include(x => x.MediaItems)
                .FirstOrDefaultAsync(x => x.ExternalKey == row.ExternalKey, cancellationToken);

            if (existing is not null && !overwrite)
            {
                continue;
            }

            var slug = EnsureUniqueSlug(slugOwners, row.Slug, row.ExternalKey, existing?.Id);
            var currency = "IRT";
            var sale = Money.Create(row.SalePrice, currency);
            var list = row.DiscountPercent is > 0 && row.ListPrice > row.SalePrice
                ? Money.Create(row.ListPrice, currency)
                : null;

            // Empty = frontend renders a per-category colored placeholder (no appliance PNG).
            var imageUrl = string.Empty;
            Guid? mediaId = null;
            if (!string.IsNullOrWhiteSpace(row.ImageUrl)
                && !row.ImageUrl.Contains("yourdomain.com", StringComparison.OrdinalIgnoreCase)
                && Uri.TryCreate(row.ImageUrl, UriKind.Absolute, out _))
            {
                var downloaded = await TryDownloadMediaAsync(
                    media,
                    http,
                    row.ImageUrl!,
                    row.Slug ?? row.ExternalKey,
                    logger,
                    cancellationToken);
                if (downloaded is { } asset)
                {
                    mediaId = Guid.Parse(asset.Id);
                    var gallery = asset.Variants.FirstOrDefault(v => v.Key == "gallery")
                        ?? asset.Variants.FirstOrDefault(v => v.Key == "original")
                        ?? asset.Variants.FirstOrDefault();
                    if (gallery is not null)
                    {
                        imageUrl = gallery.Url.StartsWith("/api/", StringComparison.Ordinal)
                            ? gallery.Url
                            : $"/api/media/{asset.Id}/gallery";
                    }
                    else
                    {
                        imageUrl = $"/api/media/{asset.Id}/gallery";
                    }

                    imagesOk++;
                }
                else
                {
                    // Keep absolute remote URL so Next can still load it via remotePatterns if allowed.
                    imageUrl = row.ImageUrl!;
                    imagesFail++;
                }
            }

            var brandKey = ResolveBrandKey(row.BrandName, brand);
            var brandName = string.IsNullOrWhiteSpace(row.BrandName) ? brand.Name : row.BrandName.Trim();

            Product product;
            if (existing is null)
            {
                product = Product.Create(
                    row.ExternalKey,
                    row.Title,
                    slug,
                    imageUrl,
                    brandKey,
                    brandName,
                    seller.ExternalKey,
                    seller.Name,
                    sale,
                    inStock: row.InStock,
                    isPublished: row.IsPublished);
                catalog.Products.Add(product);
                created++;
            }
            else
            {
                product = existing;
                product.UpdateCore(
                    row.Title,
                    slug,
                    imageUrl,
                    brandKey,
                    brandName,
                    seller.ExternalKey,
                    seller.Name,
                    sale);
                product.SetPublished(row.IsPublished);
                updated++;
            }

            product.ApplyDetails(
                brand.LogoUrl,
                list,
                row.DiscountPercent,
                rating: null,
                reviewCount: null,
                badges: null,
                ProductCondition.New,
                row.InStock);

            if (!string.IsNullOrWhiteSpace(row.CategoryKey)
                && categories.TryGetValue(row.CategoryKey, out var category))
            {
                product.SetCategory(category.Id, category.ExternalKey, category.Title);
            }

            product.ApplyCommerceAndSeo(
                row.SkuCode,
                row.WeightKg,
                row.AllowCashOnDelivery,
                row.MinOrderQuantity <= 0 ? 1 : row.MinOrderQuantity,
                row.TaxPercent,
                row.DutyPercent,
                NullIfEmpty(ToPlainText(row.MetaTitle ?? "")),
                NullIfEmpty(ToPlainText(row.MetaDescription ?? "")),
                NullIfEmpty(ToPlainText(row.MetaKeywords ?? "")),
                NullIfEmpty(ToPlainText(row.ImageAlt ?? "")) ?? row.Title,
                row.SchemaJson is null ? null : JsonSerializer.Serialize(row.SchemaJson));

            // Split XLS description → PDP sections (intro / review / features / warranty).
            var introFull = ToPlainText(row.IntroFull ?? "");
            if (string.IsNullOrWhiteSpace(introFull))
            {
                // Fallback: only the intro portion if older JSON without split fields.
                introFull = ToPlainText(row.DescriptionPlain ?? row.DescriptionHtml ?? "");
            }

            var introPreview = string.IsNullOrWhiteSpace(row.IntroPreview)
                ? TruncatePlain(introFull, 180)
                : ToPlainText(row.IntroPreview);
            var expertFull = ToPlainText(row.ExpertReviewFull ?? "");
            var expertPreview = string.IsNullOrWhiteSpace(row.ExpertReviewPreview)
                ? TruncatePlain(expertFull, 180)
                : ToPlainText(row.ExpertReviewPreview);
            var warranty = ToPlainText(row.Warranty ?? "");
            var features = (row.Features ?? [])
                .Where(f => !string.IsNullOrWhiteSpace(f.Label) && !string.IsNullOrWhiteSpace(f.Value))
                .Select(f => new
                {
                    id = string.IsNullOrWhiteSpace(f.Id) ? Guid.NewGuid().ToString("N")[..8] : f.Id!,
                    label = ToPlainText(f.Label!),
                    value = ToPlainText(f.Value!),
                })
                .ToList();

            var pdp = new
            {
                introPreview,
                introFull,
                expertReviewTitle = string.IsNullOrWhiteSpace(expertFull)
                    ? ""
                    : (NullIfEmpty(ToPlainText(row.ExpertReviewTitle ?? "")) ?? "نقد و بررسی"),
                expertReviewPreview = expertPreview,
                expertReviewFull = expertFull,
                features,
                showWarranty = !string.IsNullOrWhiteSpace(warranty),
                warranty,
                showDelivery = false,
                deliveryTitle = "",
                deliveryMethodLabel = "",
                deliveryCostLabel = "",
                showPricePolicy = false,
                pricePolicyLabel = "",
                showInsurance = false,
                brandIntro = ToPlainText(row.BrandIntro ?? ""),
                allowCashOnDelivery = row.AllowCashOnDelivery,
                minOrderQuantity = row.MinOrderQuantity <= 0 ? 1 : row.MinOrderQuantity,
                weightKg = row.WeightKg,
                skuCode = row.SkuCode,
                metaTitle = ToPlainText(row.MetaTitle ?? ""),
                metaDescription = ToPlainText(row.MetaDescription ?? ""),
                metaKeywords = ToPlainText(row.MetaKeywords ?? ""),
            };
            product.ReplacePdpContent(JsonSerializer.Serialize(pdp, JsonOptions));

            if (mediaId is Guid mid)
            {
                product.ReplaceMedia([(mid, true)], imageUrl);
            }
            else
            {
                product.SetCardImage(imageUrl);
            }

            await catalog.SaveChangesAsync(cancellationToken);
            await ReplaceImportSpecsAsync(catalog, product, row.Specs, cancellationToken);

            // Persist in batches to keep memory/transaction size reasonable.
            if ((created + updated) % 25 == 0)
            {
                await catalog.SaveChangesAsync(cancellationToken);
            }
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "MixPlus catalog seed: seller={Seller} created={Created} updated={Updated} imagesOk={ImgOk} imagesFail={ImgFail} totalRows={Total}",
            seller.ExternalKey,
            created,
            updated,
            imagesOk,
            imagesFail,
            doc.Products.Count);

        var merchandising = services.GetRequiredService<MerchandisingDbContext>();
        await SeedCategoryHomeRailsAsync(catalog, merchandising, seller.ExternalKey, logger, cancellationToken);
    }

    /// <summary>
    /// Digikala-style homepage rails: broad appliance sections (any seller/brand) + popular products.
    /// Replaces MixPlus-only leaf rails (rail-mp-*).
    /// </summary>
    private static async Task SeedCategoryHomeRailsAsync(
        CatalogDbContext catalog,
        MerchandisingDbContext merchandising,
        string sellerExternalKey,
        ILogger logger,
        CancellationToken ct)
    {
        _ = sellerExternalKey;
        const int maxPerRail = 16;
        const int sortBase = 100;

        // Digikala «لوازم خانگی برقی» style sections → matching category keys (parent + MixPlus leaves).
        var sections = new (string RailKey, string Title, string Href, string[] CategoryKeys)[]
        {
            ("rail-cat-builtin", "لوازم توکار", "/categories/built-in-appliances",
            [
                "cat-builtin",
                "c-mp-87dd3abe33", "c-mp-bc077a334e", "c-mp-a5ea97f384", "c-mp-fbc904729c",
                "c-mp-f03069e731", "c-mp-537da60363", "c-mp-barista", "c-mp-49ba62d328",
                "c-mp-granite-sink", "c-mp-inset-fantasy-sink", "c-mp-outset-fantasy-sink",
                "c-mp-undermount-sink", "c-mp-hand-made-box", "c-mp-7bca76d581", "c-mp-51d01b0a95",
            ]),
            ("rail-cat-cooking", "لوازم پخت و پز", "/categories/cooking",
            [
                "cat-cooking", "c-mp-01631b8e14", "c-mp-e4ddf0cfb9", "c-mp-276fbbf974", "c-mp-49ba62d328",
            ]),
            ("rail-cat-fridge", "یخچال و فریزر", "/categories/refrigerator-freezer", ["cat-fridge"]),
            ("rail-cat-washer", "ماشین لباسشویی", "/categories/washing-machines", ["cat-washer"]),
            ("rail-cat-dishwasher", "ماشین ظرفشویی", "/categories/dishwasher", ["cat-dishwasher"]),
            ("rail-cat-tv", "تلویزیون", "/categories/tv", ["cat-tv", "cat-av"]),
            ("rail-cat-vacuum", "جاروبرقی", "/categories/vaccum-cleaner", ["cat-vacuum"]),
            ("rail-cat-air", "تهویه و سرمایش", "/categories/airtreatment", ["cat-air"]),
        };

        var keepKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var sort = sortBase;
        var railsTouched = 0;

        foreach (var section in sections)
        {
            var keys = section.CategoryKeys;
            var products = await catalog.Products.AsNoTracking()
                .Where(x =>
                    x.IsPublished
                    && x.CategoryExternalKey != null
                    && keys.Contains(x.CategoryExternalKey))
                .OrderByDescending(x => x.DiscountPercent ?? 0)
                .ThenByDescending(x => x.Rating ?? 0)
                .ThenBy(x => x.Title)
                .Select(x => new { x.ExternalKey, x.SellerExternalKey })
                .ToListAsync(ct);

            if (products.Count == 0)
            {
                continue;
            }

            var productKeys = products
                .Select(x => x.ExternalKey)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(maxPerRail)
                .ToList();
            var sellerCount = products
                .Select(x => x.SellerExternalKey)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count();

            var subtitle = sellerCount > 1
                ? $"{products.Count} کالا · {sellerCount} فروشنده"
                : $"{products.Count} کالا";

            keepKeys.Add(section.RailKey);
            await UpsertRailAsync(
                merchandising,
                section.RailKey,
                section.Title,
                subtitle,
                section.Href,
                sort,
                productKeys,
                ct);
            sort++;
            railsTouched++;
        }

        // Popular = rating × reviews, then discount (marketplace-wide, not seller-specific).
        var popularKeys = await catalog.Products.AsNoTracking()
            .Where(x => x.IsPublished && x.InStock)
            .OrderByDescending(x => (x.Rating ?? 0m) * (x.ReviewCount ?? 0))
            .ThenByDescending(x => x.DiscountPercent ?? 0)
            .ThenByDescending(x => x.ReviewCount ?? 0)
            .Select(x => x.ExternalKey)
            .Take(maxPerRail)
            .ToListAsync(ct);

        if (popularKeys.Count > 0)
        {
            const string popularKey = "rail-popular";
            keepKeys.Add(popularKey);
            await UpsertRailAsync(
                merchandising,
                popularKey,
                "محبوب‌ترین‌ها",
                "بر اساس امتیاز و تعداد دیدگاه خریداران",
                "/search?sort=popular",
                sortBase - 1,
                popularKeys,
                ct);
            railsTouched++;
        }

        // Drop legacy MixPlus-only leaf rails and unused section rails.
        var managed = await merchandising.ProductRails
            .Where(x =>
                x.ExternalKey.StartsWith("rail-mp-")
                || x.ExternalKey.StartsWith("rail-cat-")
                || x.ExternalKey == "rail-popular")
            .ToListAsync(ct);
        var orphans = managed.Where(x => !keepKeys.Contains(x.ExternalKey)).ToList();
        if (orphans.Count > 0)
        {
            merchandising.ProductRails.RemoveRange(orphans);
        }

        await merchandising.SaveChangesAsync(ct);
        logger.LogInformation(
            "Marketplace home rails: upserted={Upserted} removedOrphans={Orphans} kept={Kept}",
            railsTouched,
            orphans.Count,
            keepKeys.Count);
    }

    private static async Task UpsertRailAsync(
        MerchandisingDbContext merchandising,
        string railKey,
        string title,
        string subtitle,
        string href,
        int sortOrder,
        IReadOnlyList<string> productKeys,
        CancellationToken ct)
    {
        var existing = await merchandising.ProductRails.FirstOrDefaultAsync(
            x => x.ExternalKey == railKey,
            ct);
        if (existing is null)
        {
            var rail = ProductRail.Create(railKey, title, sortOrder, subtitle, href, showUsedLabel: false);
            rail.SetProductKeys(productKeys);
            merchandising.ProductRails.Add(rail);
        }
        else
        {
            existing.Update(title, subtitle, href, showUsedLabel: false, sortOrder: sortOrder);
            existing.SetProductKeys(productKeys);
        }
    }

    private static async Task<Seller> EnsureSellerAsync(
        SellersDbContext sellers,
        IdentityDbContext identity,
        SellerSeed sellerSeed,
        ILogger logger,
        CancellationToken ct)
    {
        var phone = NormalizePhone(sellerSeed.OwnerPhone);
        var ownerId = StableGuid.From($"user:phone:{phone}");

        var user = await identity.Users.FirstOrDefaultAsync(x => x.Id == ownerId, ct);
        if (user is null)
        {
            user = User.CreatePhone(phone);
            identity.Users.Add(user);
            await identity.SaveChangesAsync(ct);
            logger.LogInformation("MixPlus seed: created identity user for {Phone}", phone);
        }

        // OwnerUserId is unique — release it from any other shop (e.g. demo portal seller).
        var conflicts = await sellers.Sellers
            .Where(x => x.OwnerUserId == ownerId && x.ExternalKey != sellerSeed.ExternalKey)
            .ToListAsync(ct);
        foreach (var conflict in conflicts)
        {
            logger.LogInformation(
                "MixPlus seed: clearing owner {Phone} from seller {Key}",
                phone,
                conflict.ExternalKey);
            conflict.ClearOwner();
        }

        var seller = await sellers.Sellers.FirstOrDefaultAsync(
            x => x.ExternalKey == sellerSeed.ExternalKey,
            ct);
        if (seller is null)
        {
            seller = Seller.Create(
                sellerSeed.ExternalKey,
                sellerSeed.Name,
                sellerSeed.Slug,
                sellerSeed.Rating,
                status: "approved");
            seller.AssignOwner(ownerId);
            sellers.Sellers.Add(seller);
            logger.LogInformation("MixPlus seed: created seller {Key}", sellerSeed.ExternalKey);
        }
        else
        {
            seller.Update(sellerSeed.Name, sellerSeed.Slug, sellerSeed.Rating);
            seller.SetStatus("approved");
            seller.AssignOwner(ownerId);
            logger.LogInformation("MixPlus seed: refreshed seller {Key} ownerPhone={Phone}", sellerSeed.ExternalKey, phone);
        }

        await sellers.SaveChangesAsync(ct);
        return seller;
    }

    private static async Task<Brand> EnsureBrandAsync(
        CatalogDbContext catalog,
        BrandSeed? brandSeed,
        ILogger logger,
        CancellationToken ct)
    {
        brandSeed ??= new BrandSeed("b-mixplus", "Mixplus", "mixplus", "/brand/mixplus-logo.svg");
        var brand = await catalog.Brands.FirstOrDefaultAsync(x => x.ExternalKey == brandSeed.ExternalKey, ct);
        if (brand is null)
        {
            brand = Brand.Create(
                brandSeed.ExternalKey,
                brandSeed.Name,
                brandSeed.Slug,
                brandSeed.LogoUrl ?? "/brand/mixplus-logo.svg");
            catalog.Brands.Add(brand);
            await catalog.SaveChangesAsync(ct);
            logger.LogInformation("MixPlus seed: created brand {Key}", brand.ExternalKey);
        }

        return brand;
    }

    private static async Task<Dictionary<string, Category>> EnsureCategoriesAsync(
        CatalogDbContext catalog,
        IReadOnlyList<ProductSeed> products,
        ILogger logger,
        CancellationToken ct)
    {
        var map = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase);
        var order = 0;
        foreach (var group in products
                     .Where(p => !string.IsNullOrWhiteSpace(p.CategoryKey) && !string.IsNullOrWhiteSpace(p.CategoryName))
                     .GroupBy(p => p.CategoryKey!, StringComparer.OrdinalIgnoreCase))
        {
            var key = group.Key;
            var title = group.First().CategoryName!.Trim();
            var slug = SlugFromCategory(title, key);
            var href = $"/categories/{slug}";

            var category = await catalog.Categories.FirstOrDefaultAsync(x => x.ExternalKey == key, ct);
            if (category is null)
            {
                // Slug collisions across imports → suffix with key fragment.
                if (await catalog.Categories.AnyAsync(x => x.Slug == slug, ct))
                {
                    slug = $"{slug}-{key[^6..]}".ToLowerInvariant();
                    href = $"/categories/{slug}";
                }

                // Prefer Digikala parents when present (tree seeder runs first).
                Guid? parentId = null;
                var preferredParent = PreferParentKey(key);
                if (preferredParent is not null)
                {
                    parentId = (await catalog.Categories.AsNoTracking()
                        .FirstOrDefaultAsync(x => x.ExternalKey == preferredParent, ct))?.Id;
                }

                category = Category.Create(key, title, slug, href, imageUrl: null, parentId, sortOrder: order++);
                catalog.Categories.Add(category);
            }
            else
            {
                category.Update(title, category.Slug, category.Href, category.ImageUrl, category.SortOrder);
                category.SetActive(true);
            }

            map[key] = category;
        }

        await catalog.SaveChangesAsync(ct);
        logger.LogInformation("MixPlus seed: ensured {Count} categories", map.Count);
        return map;
    }

    private static string? PreferParentKey(string categoryKey) =>
        categoryKey.Trim().ToLowerInvariant() switch
        {
            "cat-cooktop" or "cat-oven" or "cat-hood" or "cat-sink" or "cat-microwave-builtin"
                => "cat-builtin",
            "cat-stove" or "cat-microwave" => "cat-cooking",
            "cat-av" => "cat-tv",
            "cat-fridge" or "cat-washer" or "cat-dishwasher" or "cat-vacuum"
                or "cat-air" or "cat-tv" or "cat-cooking" or "cat-drink"
                or "cat-foodproc" or "cat-iron" or "cat-water" or "cat-steam"
                or "cat-sewing" or "cat-builtin"
                => DigikalaCategoryTreeSeeder.RootKey,
            _ => DigikalaCategoryTreeSeeder.RootKey,
        };

    private static string ResolveBrandKey(string? brandName, Brand defaultBrand)
    {
        if (string.IsNullOrWhiteSpace(brandName))
        {
            return defaultBrand.ExternalKey;
        }

        var n = brandName.Trim().ToLowerInvariant().Replace(" ", "", StringComparison.Ordinal);
        if (n.Contains("moulinex", StringComparison.Ordinal))
        {
            return "b-moulinex";
        }

        return defaultBrand.ExternalKey;
    }

    private static string EnsureUniqueSlug(
        Dictionary<string, Guid> slugOwners,
        string? preferred,
        string externalKey,
        Guid? existingId)
    {
        var slug = string.IsNullOrWhiteSpace(preferred)
            ? externalKey.ToLowerInvariant()
            : preferred.Trim().ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\-]+", "-").Trim('-');
        if (string.IsNullOrWhiteSpace(slug))
        {
            slug = externalKey.ToLowerInvariant();
        }

        var candidate = slug;
        var i = 2;
        while (slugOwners.TryGetValue(candidate, out var ownerId)
               && (existingId is null || ownerId != existingId))
        {
            candidate = $"{slug}-{i++}";
        }

        slugOwners[candidate] = existingId ?? StableGuid.From(externalKey);
        return candidate;
    }

    private static async Task<MediaAssetDto?> TryDownloadMediaAsync(
        IMediaUploadService media,
        HttpClient http,
        string url,
        string fileHint,
        ILogger logger,
        CancellationToken ct)
    {
        try
        {
            using var response = await http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("MixPlus image HTTP {Status} for {Url}", (int)response.StatusCode, url);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            var ext = Path.GetExtension(new Uri(url).AbsolutePath);
            if (string.IsNullOrWhiteSpace(ext) || ext.Length > 5)
            {
                ext = ".png";
            }

            var fileName = $"{SanitizeFile(fileHint)}{ext}";
            var contentType = GuessImageContentType(
                ext,
                response.Content.Headers.ContentType?.MediaType);
            // Buffer fully — some CDNs return octet-stream and non-seekable streams.
            await using var buffer = new MemoryStream();
            await stream.CopyToAsync(buffer, ct);
            buffer.Position = 0;
            var result = await media.UploadAsync(buffer, fileName, contentType, ct);
            if (!result.IsSuccess)
            {
                logger.LogWarning("MixPlus image upload failed: {Error}", result.Error);
                return null;
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "MixPlus image download failed for {Url}", url);
            return null;
        }
    }

    private static string SanitizeFile(string value)
    {
        var s = Regex.Replace(value, @"[^a-zA-Z0-9\-_]+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(s) ? "product" : s[..Math.Min(s.Length, 60)];
    }

    private static string GuessImageContentType(string extension, string? headerType)
    {
        if (!string.IsNullOrWhiteSpace(headerType)
            && headerType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
            && !headerType.Equals("image/*", StringComparison.OrdinalIgnoreCase))
        {
            return headerType;
        }

        return extension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            _ => "image/png",
        };
    }

    private static string SlugFromCategory(string title, string key)
    {
        var latin = Regex.Matches(title, "[A-Za-z0-9]+")
            .Select(m => m.Value.ToLowerInvariant())
            .Take(5)
            .ToArray();
        if (latin.Length > 0)
        {
            return string.Join('-', latin);
        }

        return key.ToLowerInvariant();
    }

    private static string NormalizePhone(string? phone)
    {
        var digits = new string((phone ?? "").Where(char.IsDigit).ToArray());
        if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
        {
            digits = "0" + digits[2..];
        }

        return digits;
    }

    private static string TruncatePlain(string text, int n)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var t = text.Trim();
        return t.Length <= n ? t : t[..n];
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static async Task ReplaceImportSpecsAsync(
        CatalogDbContext catalog,
        Product product,
        IReadOnlyList<SpecSeed>? specs,
        CancellationToken ct)
    {
        var existing = await catalog.SpecGroups
            .Where(x => x.ProductId == product.Id)
            .ToListAsync(ct);
        if (existing.Count > 0)
        {
            catalog.SpecGroups.RemoveRange(existing);
        }

        if (specs is null || specs.Count == 0)
        {
            return;
        }

        var attrs = new List<ProductSpecAttribute>();
        var sort = 0;
        foreach (var spec in specs)
        {
            if (string.IsNullOrWhiteSpace(spec.Label) || string.IsNullOrWhiteSpace(spec.Value))
            {
                continue;
            }

            attrs.Add(ProductSpecAttribute.Create(
                ToPlainText(spec.Label),
                [ToPlainText(spec.Value)],
                sort++));
        }

        if (attrs.Count == 0)
        {
            return;
        }

        catalog.SpecGroups.Add(ProductSpecGroup.Create(
            product.Id,
            product.ExternalKey,
            "مشخصات فنی",
            sortOrder: 0,
            previewCount: Math.Min(6, attrs.Count),
            attrs));
    }

    /// <summary>Strip tags/scripts/emojis — XLS HTML must never reach the PDP as markup.</summary>
    private static string ToPlainText(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "";
        var t = raw;
        t = Regex.Replace(t, "<script[\\s\\S]*?</script>", " ", RegexOptions.IgnoreCase);
        t = Regex.Replace(t, "<style[\\s\\S]*?</style>", " ", RegexOptions.IgnoreCase);
        t = Regex.Replace(t, "<noscript[\\s\\S]*?</noscript>", " ", RegexOptions.IgnoreCase);
        t = Regex.Replace(t, "<(br|hr)\\s*/?>", "\n", RegexOptions.IgnoreCase);
        t = Regex.Replace(t, "</(p|div|h[1-6]|li|tr|section|article)>", "\n", RegexOptions.IgnoreCase);
        t = Regex.Replace(t, "<[^>]+>", " ");
        t = System.Net.WebUtility.HtmlDecode(t);
        t = t.Replace('\u00a0', ' ');
        t = t.Replace("❤️", string.Empty).Replace("❤", string.Empty).Replace("♥", string.Empty);
        // Symbol/other pictographs (emoji leftovers) — keep letters/digits/punctuation.
        t = Regex.Replace(t, @"\p{So}", string.Empty);
        t = Regex.Replace(t, @"\p{Cs}", string.Empty);
        var lines = t.Split('\n')
            .Select(line => Regex.Replace(line, "[ \\t\\f\\v]+", " ").Trim())
            .Where(line => line.Length > 0);
        return string.Join("\n", lines).Trim();
    }

    private sealed record MixPlusImportDocument(
        SellerSeed? Seller,
        BrandSeed? Brand,
        IReadOnlyList<ProductSeed>? Products);

    private sealed record SellerSeed(
        string ExternalKey,
        string Name,
        string? Slug,
        string? OwnerPhone,
        decimal? Rating);

    private sealed record BrandSeed(
        string ExternalKey,
        string Name,
        string Slug,
        string? LogoUrl);

    private sealed record ProductSeed(
        int Row,
        string ExternalKey,
        string Title,
        string? Slug,
        string? CategoryName,
        string? CategoryKey,
        string? DescriptionHtml,
        string? DescriptionPlain,
        string? IntroPreview,
        string? IntroFull,
        string? ExpertReviewTitle,
        string? ExpertReviewPreview,
        string? ExpertReviewFull,
        IReadOnlyList<FeatureSeed>? Features,
        string? Warranty,
        IReadOnlyList<SpecSeed>? Specs,
        string? BrandIntro,
        string? Tagline,
        decimal ListPrice,
        decimal SalePrice,
        int? DiscountPercent,
        int Stock,
        bool InStock,
        bool IsPublished,
        decimal? WeightKg,
        bool AllowCashOnDelivery,
        int MinOrderQuantity,
        decimal? TaxPercent,
        decimal? DutyPercent,
        string? MetaTitle,
        string? MetaDescription,
        string? MetaKeywords,
        string? ImageAlt,
        string? SkuCode,
        string? BrandName,
        string? ImageUrl,
        JsonElement? SchemaJson);

    private sealed record FeatureSeed(string? Id, string? Label, string? Value);

    private sealed record SpecSeed(string? Id, string? Label, string? Value);
}
