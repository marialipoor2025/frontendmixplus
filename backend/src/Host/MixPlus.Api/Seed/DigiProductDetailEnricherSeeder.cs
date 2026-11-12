using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Offers;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Domain.Specs;
using MixPlus.Modules.Catalog.Domain.Variants;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Enriches Digi-seeded catalog products with Digikala public PDP payloads
/// (<c>product-details.json</c>) — specs, option groups, SKUs, gallery, intro/review.
/// That published PDP is the registered seller-panel content.
/// </summary>
public static class DigiProductDetailEnricherSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    /// <summary>MixPlus Digikala seller id observed in scrapes.</summary>
    private const long MixPlusDigiSellerId = 1791213;

    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (!config.GetValue("Seed:DigiProductDetails", true))
        {
            logger.LogInformation("Seed:DigiProductDetails=false — skip PDP detail enrich.");
            return;
        }

        var dataRoot = DigiSellerScrapeSeeder.ResolveDataRoot(config);
        var path = Path.Combine(dataRoot, "product-details.json");
        if (!File.Exists(path))
        {
            logger.LogWarning(
                "Digi PDP detail enrich skipped — missing {Path}. Run scripts/scrape-digikala-product-details.mjs",
                path);
            return;
        }

        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, cancellationToken));
        if (!doc.RootElement.TryGetProperty("items", out var items)
            || items.ValueKind != JsonValueKind.Array)
        {
            logger.LogWarning("Digi PDP detail enrich skipped — invalid {Path}", path);
            return;
        }

        var catalog = services.GetRequiredService<CatalogDbContext>();
        var byId = new Dictionary<long, JsonElement>();
        foreach (var item in items.EnumerateArray())
        {
            if (item.TryGetProperty("id", out var idEl) && idEl.TryGetInt64(out var id))
            {
                byId[id] = item.Clone();
            }
        }

        var products = await catalog.Products
            .Where(x => x.ExternalKey.StartsWith("dkp-"))
            .ToListAsync(cancellationToken);

        var digiProductIds = products.Select(x => x.Id).ToList();
        if (digiProductIds.Count > 0)
        {
            // Bulk wipe avoids EF concurrency issues with owned SpecAttributes / OptionValues.
            await catalog.Skus
                .Where(x => digiProductIds.Contains(x.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await catalog.OptionGroups
                .Where(x => digiProductIds.Contains(x.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await catalog.SpecGroups
                .Where(x => digiProductIds.Contains(x.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await catalog.Offers
                .Where(x => x.ExternalKey.StartsWith("offer-dkp-"))
                .ExecuteDeleteAsync(cancellationToken);
            catalog.ChangeTracker.Clear();
            products = await catalog.Products
                .Where(x => x.ExternalKey.StartsWith("dkp-"))
                .ToListAsync(cancellationToken);
        }

        var enriched = 0;
        foreach (var product in products)
        {
            if (!TryParseDkp(product.ExternalKey, out var digiId)
                || !byId.TryGetValue(digiId, out var detail))
            {
                continue;
            }

            EnrichOne(catalog, product, detail);
            enriched++;
            if (enriched % 20 == 0)
            {
                await catalog.SaveChangesAsync(cancellationToken);
            }
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Digi PDP detail enrich: {Enriched}/{Total} products from {Path}",
            enriched,
            products.Count,
            path);
    }

    private static void EnrichOne(
        CatalogDbContext catalog,
        Product product,
        JsonElement detail)
    {

        var imageUrls = DedupeImageUrls(ReadStringArray(detail, "imageUrls"));
        if (imageUrls.Count > 0)
        {
            product.SetCardImage(imageUrls[0]);
        }

        var variants = detail.TryGetProperty("variants", out var varsEl)
            && varsEl.ValueKind == JsonValueKind.Array
            ? varsEl.EnumerateArray().Select(x => x.Clone()).ToList()
            : [];

        // Prefer MixPlus seller variants; fall back to all if filter empties.
        var own = variants
            .Where(v =>
            {
                if (!v.TryGetProperty("seller", out var s) || s.ValueKind != JsonValueKind.Object)
                {
                    return true;
                }

                return GetLong(s, "id") is MixPlusDigiSellerId
                    || string.Equals(GetString(s, "code"), "HDRGK", StringComparison.OrdinalIgnoreCase);
            })
            .ToList();
        if (own.Count > 0) variants = own;

        var optionMap = BuildOptionGroups(catalog, product, variants);
        SeedSkus(catalog, product, variants, optionMap);

        SeedSpecs(catalog, product, detail);

        var warranty = variants
            .Select(v =>
                v.TryGetProperty("warranty", out var w) && w.ValueKind == JsonValueKind.Object
                    ? GetString(w, "title_fa")
                    : null)
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x))
            ?? "";

        var digiSellerName = variants
            .Select(v =>
                v.TryGetProperty("seller", out var s) && s.ValueKind == JsonValueKind.Object
                    ? GetString(s, "title")
                    : null)
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));
        if (!string.IsNullOrWhiteSpace(digiSellerName)
            && !string.Equals(product.SellerName, digiSellerName, StringComparison.Ordinal))
        {
            product.AssignSeller(product.SellerExternalKey, digiSellerName!);
        }

        var returnNotice = GetNestedString(detail, "category", "return_reason_alert")?.Trim() ?? "";

        var introFull = StripHtml(GetNestedString(detail, "review", "description"));
        // Digikala often sends empty "" for short fields — treat as missing.
        var introPreview = Truncate(
            FirstNonEmpty(
                GetNestedString(detail, "review", "short"),
                GetNestedString(detail, "expert_reviews", "short_review"),
                introFull) ?? "",
            220);

        var expertFull = StripHtml(GetNestedString(detail, "expert_reviews", "description"));
        var expertHasAttributes =
            detail.TryGetProperty("expert_reviews", out var expertEl)
            && expertEl.ValueKind == JsonValueKind.Object
            && expertEl.TryGetProperty("attributes", out var attrsEl)
            && attrsEl.ValueKind == JsonValueKind.Array
            && attrsEl.GetArrayLength() > 0;

        // Digikala duplicates the same body into review + expert_reviews when there is
        // no real expert block — keep one copy under معرفی to avoid repetitive PDP text.
        if (string.IsNullOrWhiteSpace(expertFull)
            || (!expertHasAttributes
                && string.Equals(NormalizeCompare(expertFull), NormalizeCompare(introFull), StringComparison.Ordinal)))
        {
            expertFull = "";
        }

        var expertPreview = string.IsNullOrWhiteSpace(expertFull)
            ? ""
            : Truncate(
                FirstNonEmpty(
                    GetNestedString(detail, "expert_reviews", "short_review"),
                    expertFull) ?? "",
                220);

        var features = BuildFeatureChips(detail);

        var pricing = ResolvePrimaryPrice(variants);
        if (pricing.SaleToman > 0)
        {
            product.ApplyPricing(
                Money.Create(pricing.SaleToman, "IRT"),
                pricing.ListToman > pricing.SaleToman
                    ? Money.Create(pricing.ListToman, "IRT")
                    : null,
                pricing.DiscountPercent,
                inStock: pricing.InStock);
        }

        product.ReplacePdpContent(JsonSerializer.Serialize(new
        {
            introPreview,
            introFull,
            expertReviewTitle = string.IsNullOrWhiteSpace(expertFull) ? "" : "نقد و بررسی",
            expertReviewPreview = expertPreview,
            expertReviewFull = expertFull,
            features,
            returnNotice = string.IsNullOrWhiteSpace(returnNotice) ? null : returnNotice,
            showWarranty = !string.IsNullOrWhiteSpace(warranty),
            warranty,
            showDelivery = true,
            deliveryTitle = "ارسال دیجی‌کالا",
            deliveryMethodLabel = "موجود در انبار فروشنده",
            deliveryCostLabel = "",
            showPricePolicy = false,
            pricePolicyLabel = "",
            showInsurance = false,
            galleryImages = imageUrls.Select((url, i) => new
            {
                id = $"digi-img-{i + 1}",
                url,
                alt = product.Title,
            }).ToList(),
            digikalaProductId = detail.GetProperty("id").GetInt64(),
            source = "digikala-public-pdp",
        }, JsonOptions));

        var offerKey = $"offer-{product.ExternalKey}-primary";
        if (pricing.SaleToman > 0)
        {
            catalog.Offers.Add(ProductOffer.Create(
                offerKey,
                product.Id,
                product.Slug,
                product.SellerExternalKey,
                product.SellerName,
                Money.Create(pricing.SaleToman, "IRT"),
                isOfficial: true,
                performanceLabel: "عالی",
                deliveryLabel: "موجود در انبار فروشنده",
                warranty: warranty,
                originalPrice: pricing.ListToman > pricing.SaleToman
                    ? Money.Create(pricing.ListToman, "IRT")
                    : null,
                discountPercent: pricing.DiscountPercent));
        }
    }

    private static Dictionary<(string GroupLabel, string ValueTitle), Guid> BuildOptionGroups(
        CatalogDbContext catalog,
        Product product,
        List<JsonElement> variants)
    {
        // groupLabel -> (valueTitle -> (hex, digiValueId, sort))
        var groups = new Dictionary<string, Dictionary<string, (string? Hex, long? DigiId, int Sort)>>(
            StringComparer.Ordinal);

        foreach (var variant in variants)
        {
            if (!variant.TryGetProperty("themes", out var themes)
                || themes.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var theme in themes.EnumerateArray())
            {
                var label = GetString(theme, "label") ?? "تنوع";
                string? title = null;
                string? hex = null;
                long? digiId = null;
                if (theme.TryGetProperty("value", out var val) && val.ValueKind == JsonValueKind.Object)
                {
                    title = GetString(val, "title");
                    hex = GetString(val, "hex");
                    digiId = GetLong(val, "id");
                }

                if (string.IsNullOrWhiteSpace(title)) continue;

                if (!groups.TryGetValue(label, out var values))
                {
                    values = new Dictionary<string, (string? Hex, long? DigiId, int Sort)>(
                        StringComparer.Ordinal);
                    groups[label] = values;
                }

                if (!values.ContainsKey(title))
                {
                    values[title] = (hex, digiId, values.Count + 1);
                }
            }
        }

        var map = new Dictionary<(string, string), Guid>();
        var groupSort = 0;
        foreach (var (label, values) in groups)
        {
            groupSort++;
            var code = Slugify(label);
            var ui = values.Values.Any(v => !string.IsNullOrWhiteSpace(v.Hex)) ? "swatch" : "chip";
            var optionValues = new List<ProductOptionValue>();
            foreach (var (title, meta) in values.OrderBy(x => x.Value.Sort))
            {
                var id = StableGuid.From(
                    $"digi-opt:{product.ExternalKey}:{meta.DigiId?.ToString(CultureInfo.InvariantCulture) ?? title}");
                optionValues.Add(ProductOptionValue.Create(title, meta.Hex, available: true, meta.Sort, id));
                map[(label, title)] = id;
            }

            catalog.OptionGroups.Add(ProductOptionGroup.Create(
                product.Id,
                product.ExternalKey,
                code,
                label,
                ui,
                groupSort,
                optionValues));
        }

        return map;
    }

    private static void SeedSkus(
        CatalogDbContext catalog,
        Product product,
        List<JsonElement> variants,
        Dictionary<(string GroupLabel, string ValueTitle), Guid> optionMap)
    {
        foreach (var variant in variants)
        {
            var variantId = GetLong(variant, "id") ?? 0;
            var optionIds = new List<Guid>();
            if (variant.TryGetProperty("themes", out var themes)
                && themes.ValueKind == JsonValueKind.Array)
            {
                foreach (var theme in themes.EnumerateArray())
                {
                    var label = GetString(theme, "label") ?? "تنوع";
                    string? title = null;
                    if (theme.TryGetProperty("value", out var val) && val.ValueKind == JsonValueKind.Object)
                    {
                        title = GetString(val, "title");
                    }

                    if (title is not null && optionMap.TryGetValue((label, title), out var oid))
                    {
                        optionIds.Add(oid);
                    }
                }
            }

            var saleRial = 0L;
            var listRial = 0L;
            int? discount = null;
            if (variant.TryGetProperty("price", out var price) && price.ValueKind == JsonValueKind.Object)
            {
                saleRial = GetLong(price, "selling_price") ?? 0;
                listRial = GetLong(price, "rrp_price") ?? saleRial;
                discount = GetInt(price, "discount_percent");
            }

            var sale = RialToToman(saleRial);
            var list = RialToToman(listRial);
            var status = GetString(variant, "status");
            var inStock = !string.Equals(status, "out_of_stock", StringComparison.OrdinalIgnoreCase)
                && sale > 0;
            var stock = inStock ? 5 : 0;

            catalog.Skus.Add(ProductSku.Create(
                product.Id,
                product.ExternalKey,
                $"DKV-{variantId}",
                optionIds,
                Money.Create(sale > 0 ? sale : product.Price.Amount, "IRT"),
                stock,
                list > sale ? Money.Create(list, "IRT") : null,
                discount is > 0 ? discount : DiscountOf(sale, list)));
        }
    }

    private static void SeedSpecs(
        CatalogDbContext catalog,
        Product product,
        JsonElement detail)
    {
        if (!detail.TryGetProperty("specifications", out var specs)
            || specs.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        var groupSort = 0;
        foreach (var group in specs.EnumerateArray())
        {
            var title = GetString(group, "title") ?? "مشخصات";
            if (!group.TryGetProperty("attributes", out var attrs)
                || attrs.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            var list = new List<ProductSpecAttribute>();
            var sort = 0;
            foreach (var attr in attrs.EnumerateArray())
            {
                var label = GetString(attr, "title");
                if (string.IsNullOrWhiteSpace(label)) continue;
                var values = new List<string>();
                if (attr.TryGetProperty("values", out var vals) && vals.ValueKind == JsonValueKind.Array)
                {
                    foreach (var v in vals.EnumerateArray())
                    {
                        if (v.ValueKind == JsonValueKind.String)
                        {
                            var s = (v.GetString() ?? "").Trim();
                            if (s.Length > 0) values.Add(s);
                        }
                    }
                }

                if (values.Count == 0) continue;
                list.Add(ProductSpecAttribute.Create(label.Trim(), values, sort++));
            }

            if (list.Count == 0) continue;
            catalog.SpecGroups.Add(ProductSpecGroup.Create(
                product.Id,
                product.ExternalKey,
                title.Trim(),
                groupSort++,
                previewCount: Math.Min(6, list.Count),
                list));
        }
    }

    private static List<object> BuildFeatureChips(JsonElement detail)
    {
        var chips = new List<object>();
        if (!detail.TryGetProperty("specifications", out var specs)
            || specs.ValueKind != JsonValueKind.Array)
        {
            return chips;
        }

        foreach (var group in specs.EnumerateArray())
        {
            if (!group.TryGetProperty("attributes", out var attrs)
                || attrs.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var attr in attrs.EnumerateArray())
            {
                var label = GetString(attr, "title");
                if (string.IsNullOrWhiteSpace(label)) continue;
                var values = new List<string>();
                if (attr.TryGetProperty("values", out var vals) && vals.ValueKind == JsonValueKind.Array)
                {
                    foreach (var v in vals.EnumerateArray())
                    {
                        if (v.ValueKind == JsonValueKind.String)
                        {
                            var s = (v.GetString() ?? "").Trim();
                            if (s.Length > 0) values.Add(s);
                        }
                    }
                }

                if (values.Count == 0) continue;
                chips.Add(new
                {
                    id = $"feat-{chips.Count + 1}",
                    label = label.Trim(),
                    value = string.Join("، ", values),
                });
                if (chips.Count >= 6) return chips;
            }
        }

        return chips;
    }

    private static (decimal SaleToman, decimal ListToman, int? DiscountPercent, bool InStock) ResolvePrimaryPrice(
        List<JsonElement> variants)
    {
        foreach (var v in variants)
        {
            if (!v.TryGetProperty("price", out var price) || price.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            var sale = RialToToman(GetLong(price, "selling_price") ?? 0);
            if (sale <= 0) continue;
            var list = RialToToman(GetLong(price, "rrp_price") ?? 0);
            var disc = GetInt(price, "discount_percent");
            return (sale, list, disc is > 0 ? disc : DiscountOf(sale, list), true);
        }

        return (0, 0, null, false);
    }

    private static bool TryParseDkp(string externalKey, out long id)
    {
        id = 0;
        if (!externalKey.StartsWith("dkp-", StringComparison.OrdinalIgnoreCase)) return false;
        return long.TryParse(externalKey[4..], NumberStyles.Integer, CultureInfo.InvariantCulture, out id);
    }

    private static decimal RialToToman(long rial) =>
        rial <= 0 ? 0 : Math.Round(rial / 10m, 0, MidpointRounding.AwayFromZero);

    private static int? DiscountOf(decimal sale, decimal list)
    {
        if (list <= 0 || sale <= 0 || list <= sale) return null;
        return (int)Math.Round((1 - (sale / list)) * 100m, 0, MidpointRounding.AwayFromZero);
    }

    private static string Slugify(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value.Trim()));
        return "opt-" + Convert.ToHexString(bytes.AsSpan(0, 4)).ToLowerInvariant();
    }

    private static string Truncate(string value, int max)
    {
        var t = StripHtml(value).Trim();
        if (t.Length <= max) return t;
        // Prefer a clean break near the limit when Digi body has newlines.
        var slice = t[..max];
        var breakAt = slice.LastIndexOfAny(['\n', ' ', '،', '.']);
        if (breakAt >= max / 2) slice = slice[..breakAt];
        return slice.TrimEnd() + "…";
    }

    /// <summary>Preserve Digikala paragraph / section breaks; collapse only horizontal space.</summary>
    private static string StripHtml(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "";
        var t = Regex.Replace(raw, "<br\\s*/?>", "\n", RegexOptions.IgnoreCase);
        t = Regex.Replace(t, "<[^>]+>", " ");
        t = Regex.Replace(t, "[ \\t\\f\\v]+", " ");
        t = Regex.Replace(t, " ?\n ?", "\n");
        t = Regex.Replace(t, "\n{3,}", "\n\n").Trim();
        return t;
    }

    private static string NormalizeCompare(string value) =>
        Regex.Replace(value, "\\s+", " ").Trim();

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var v in values)
        {
            if (!string.IsNullOrWhiteSpace(v)) return v;
        }

        return null;
    }

    private static List<string> ReadStringArray(JsonElement el, string name)
    {
        var list = new List<string>();
        if (!el.TryGetProperty(name, out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return list;
        }

        foreach (var item in arr.EnumerateArray())
        {
            if (item.ValueKind == JsonValueKind.String)
            {
                var s = item.GetString();
                if (!string.IsNullOrWhiteSpace(s)) list.Add(s!);
            }
        }

        return list;
    }

    /// <summary>
    /// Digikala main + list often reuse the same asset hash with different timestamps.
    /// </summary>
    private static List<string> DedupeImageUrls(IReadOnlyList<string> urls)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var list = new List<string>();
        foreach (var url in urls)
        {
            if (string.IsNullOrWhiteSpace(url)) continue;
            var key = DigiImageAssetKey(url);
            if (!seen.Add(key)) continue;
            list.Add(url);
        }

        return list;
    }

    private static string DigiImageAssetKey(string url)
    {
        var m = Regex.Match(url, @"digikala-products/([a-f0-9]+)_", RegexOptions.IgnoreCase);
        return m.Success ? m.Groups[1].Value : url.Split('?')[0];
    }

    private static string? GetNestedString(JsonElement el, string a, string b)
    {
        if (!el.TryGetProperty(a, out var child) || child.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return GetString(child, b);
    }

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
}
