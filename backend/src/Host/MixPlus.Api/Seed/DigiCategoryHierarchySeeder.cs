using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;
using MixPlus.Modules.Navigation.Domain;
using MixPlus.Modules.Navigation.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Rebuilds Digikala-style nested category tree + mega-menu from
/// <c>product-details.json</c> breadcrumbs (L1 → L2 → leaf).
/// </summary>
public static class DigiCategoryHierarchySeeder
{
    private static readonly Dictionary<string, string> SlugMap = new(StringComparer.Ordinal)
    {
        ["لوازم خانگی برقی"] = "home-appliances",
        ["لوازم توکار"] = "built-in",
        ["لوازم پخت و پز"] = "cooking",
        ["گاز صفحه ای"] = "cooktop",
        ["هود"] = "hood",
        ["فر"] = "oven",
        ["سرخ کن"] = "fryer",
        ["اجاق گاز"] = "gas-stove",
        ["مایکروویو، مایکروفر"] = "microwave",
        ["مخلوط کن"] = "blender",
        ["خانه و آشپزخانه"] = "home-kitchen",
        ["شستشو و نظافت"] = "wash-clean",
        ["سینک"] = "sink",
    };

    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (!config.GetValue("Seed:DigiCategoryHierarchy", true))
        {
            logger.LogInformation("Seed:DigiCategoryHierarchy=false — skip.");
            return;
        }

        var dataRoot = DigiSellerScrapeSeeder.ResolveDataRoot(config);
        var path = Path.Combine(dataRoot, "product-details.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Digi category hierarchy skipped — missing {Path}", path);
            return;
        }

        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, cancellationToken));
        if (!doc.RootElement.TryGetProperty("items", out var items)
            || items.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        var catalog = services.GetRequiredService<CatalogDbContext>();
        var navigation = services.GetRequiredService<NavigationDbContext>();
        var merchandising = services.GetRequiredService<MerchandisingDbContext>();

        // productId -> category path titles (excluding digikala root + product title)
        var productPaths = new Dictionary<long, List<string>>();
        var pathCounts = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var item in items.EnumerateArray())
        {
            if (!item.TryGetProperty("id", out var idEl) || !idEl.TryGetInt64(out var id))
            {
                continue;
            }

            if (!item.TryGetProperty("breadcrumb", out var crumbs)
                || crumbs.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            var titles = crumbs.EnumerateArray()
                .Select(c => c.TryGetProperty("title", out var t) ? t.GetString() : null)
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t!.Trim())
                .ToList();

            if (titles.Count < 3) continue;

            // Drop "دیجی‌کالا" and product title (last).
            var pathTitles = titles.Skip(1).Take(titles.Count - 2).ToList();
            if (pathTitles.Count == 0) continue;

            productPaths[id] = pathTitles;
            for (var depth = 1; depth <= pathTitles.Count; depth++)
            {
                var key = string.Join("\u001f", pathTitles.Take(depth));
                pathCounts[key] = pathCounts.GetValueOrDefault(key) + 1;
            }
        }

        if (productPaths.Count == 0)
        {
            logger.LogWarning("Digi category hierarchy skipped — no breadcrumbs in details.");
            return;
        }

        // Detach product categories then replace category rows.
        var products = await catalog.Products
            .Where(x => x.ExternalKey.StartsWith("dkp-"))
            .ToListAsync(cancellationToken);
        foreach (var p in products)
        {
            p.SetCategory(null, null, null);
        }

        catalog.Categories.RemoveRange(await catalog.Categories.ToListAsync(cancellationToken));
        await catalog.SaveChangesAsync(cancellationToken);

        var nodes = new Dictionary<string, Category>(StringComparer.Ordinal);
        Category EnsureNode(IReadOnlyList<string> pathTitles)
        {
            var key = string.Join("\u001f", pathTitles);
            if (nodes.TryGetValue(key, out var existing)) return existing;

            Guid? parentId = null;
            if (pathTitles.Count > 1)
            {
                parentId = EnsureNode(pathTitles.Take(pathTitles.Count - 1).ToList()).Id;
            }

            var title = pathTitles[^1];
            var slug = ResolveSlug(title);
            var externalKey = pathTitles.Count == 1 && slug == "home-appliances"
                ? "cat-home-appliances"
                : $"digi-path-{StableHash(key)}";
            var href = $"/categories/{slug}";
            var sort = pathCounts.GetValueOrDefault(key);
            // Prefer higher product count earlier — invert later via OrderByDescending when seeding menu.
            var category = Category.Create(
                externalKey,
                title,
                slug,
                href,
                imageUrl: null,
                parentId: parentId,
                sortOrder: 1000 - Math.Min(999, sort));
            catalog.Categories.Add(category);
            nodes[key] = category;
            return category;
        }

        foreach (var crumbPath in productPaths.Values)
        {
            EnsureNode(crumbPath);
        }

        await catalog.SaveChangesAsync(cancellationToken);

        var leafByProduct = new Dictionary<long, Category>();
        foreach (var (productId, crumbPath) in productPaths)
        {
            leafByProduct[productId] = EnsureNode(crumbPath);
        }

        var assigned = 0;
        foreach (var product in products)
        {
            if (!TryParseDkp(product.ExternalKey, out var digiId)
                || !leafByProduct.TryGetValue(digiId, out var leaf))
            {
                continue;
            }

            product.SetCategory(leaf.Id, leaf.ExternalKey, leaf.Title);
            assigned++;
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Digi category hierarchy: nodes={Nodes} productsAssigned={Assigned}",
            nodes.Count,
            assigned);

        await SeedMegaMenuAsync(navigation, nodes, pathCounts, logger, cancellationToken);
        await SeedHomeRailsAsync(catalog, merchandising, nodes, logger, cancellationToken);
    }

    private static async Task SeedMegaMenuAsync(
        NavigationDbContext navigation,
        Dictionary<string, Category> nodes,
        Dictionary<string, int> pathCounts,
        ILogger logger,
        CancellationToken ct)
    {
        navigation.MegaLinks.RemoveRange(await navigation.MegaLinks.ToListAsync(ct));
        navigation.MegaColumns.RemoveRange(await navigation.MegaColumns.ToListAsync(ct));
        navigation.MegaCategories.RemoveRange(await navigation.MegaCategories.ToListAsync(ct));
        await navigation.SaveChangesAsync(ct);

        // L1 roots
        var roots = nodes
            .Where(kv => !kv.Key.Contains('\u001f'))
            .OrderByDescending(kv => pathCounts.GetValueOrDefault(kv.Key))
            .ThenBy(kv => kv.Value.Title)
            .ToList();

        var catSort = 0;
        var linkCount = 0;
        foreach (var (rootKey, root) in roots)
        {
            catSort++;
            var megaKey = $"digi-mega-{root.Slug}";
            navigation.MegaCategories.Add(NavMegaCategory.Create(
                megaKey,
                root.Title,
                root.Href,
                icon: "appliance",
                allProductsLabel: $"همه کالاهای {root.Title}",
                sortOrder: catSort));

            // L2 children of this root
            var l2 = nodes
                .Where(kv =>
                {
                    var parts = kv.Key.Split('\u001f');
                    return parts.Length == 2 && parts[0] == rootKey;
                })
                .OrderByDescending(kv => pathCounts.GetValueOrDefault(kv.Key))
                .ThenBy(kv => kv.Value.Title)
                .ToList();

            var colSort = 0;
            foreach (var (l2Key, l2Cat) in l2)
            {
                colSort++;
                var colKey = $"digi-col-{l2Cat.Slug}";
                navigation.MegaColumns.Add(NavMegaColumn.Create(colKey, megaKey, colSort));

                var linkSort = 0;
                navigation.MegaLinks.Add(NavMegaLink.Create(
                    $"digi-link-parent-{l2Cat.ExternalKey}",
                    colKey,
                    l2Cat.Title,
                    l2Cat.Href,
                    MegaLinkKind.Parent,
                    ++linkSort));
                linkCount++;

                var leaves = nodes
                    .Where(kv =>
                    {
                        var parts = kv.Key.Split('\u001f');
                        return parts.Length == 3
                               && parts[0] == root.Title
                               && parts[1] == l2Cat.Title;
                    })
                    .OrderByDescending(kv => pathCounts.GetValueOrDefault(kv.Key))
                    .ThenBy(kv => kv.Value.Title)
                    .ToList();

                foreach (var (_, leaf) in leaves)
                {
                    navigation.MegaLinks.Add(NavMegaLink.Create(
                        $"digi-link-leaf-{leaf.ExternalKey}",
                        colKey,
                        leaf.Title,
                        leaf.Href,
                        MegaLinkKind.Leaf,
                        ++linkSort));
                    linkCount++;
                }
            }
        }

        await navigation.SaveChangesAsync(ct);
        logger.LogInformation(
            "Digi mega-menu: roots={Roots} links={Links}",
            roots.Count,
            linkCount);
    }

    private static async Task SeedHomeRailsAsync(
        CatalogDbContext catalog,
        MerchandisingDbContext merchandising,
        Dictionary<string, Category> nodes,
        ILogger logger,
        CancellationToken ct)
    {
        var existing = await merchandising.ProductRails.ToListAsync(ct);
        merchandising.ProductRails.RemoveRange(existing);

        // Rails for leaf categories that have products.
        var leaves = nodes.Where(kv => kv.Key.Split('\u001f').Length >= 3).Select(kv => kv.Value).ToList();
        const int maxPerRail = 16;
        var sort = 100;
        var rails = 0;

        foreach (var leaf in leaves.OrderBy(x => x.SortOrder).ThenBy(x => x.Title))
        {
            var keys = await catalog.Products.AsNoTracking()
                .Where(x => x.IsPublished && x.CategoryId == leaf.Id)
                .OrderBy(x => x.Title)
                .Select(x => x.ExternalKey)
                .Take(maxPerRail)
                .ToListAsync(ct);
            if (keys.Count == 0) continue;

            var rail = ProductRail.Create(
                $"rail-digi-{leaf.Slug}",
                leaf.Title,
                sort++,
                $"{FaDigits(keys.Count)} کالا",
                leaf.Href,
                showUsedLabel: false);
            rail.SetProductKeys(keys);
            merchandising.ProductRails.Add(rail);
            rails++;
        }

        var popular = await catalog.Products.AsNoTracking()
            .Where(x => x.IsPublished && x.InStock)
            .OrderByDescending(x => x.DiscountPercent ?? 0)
            .ThenBy(x => x.Title)
            .Select(x => x.ExternalKey)
            .Take(maxPerRail)
            .ToListAsync(ct);
        if (popular.Count > 0)
        {
            var rail = ProductRail.Create(
                "rail-popular",
                "محبوب‌ترین‌ها",
                99,
                "محبوب‌ترین کالاها نزد خریداران",
                "/search?sort=popular",
                showUsedLabel: false);
            rail.SetProductKeys(popular);
            merchandising.ProductRails.Add(rail);
            rails++;
        }

        await merchandising.SaveChangesAsync(ct);
        logger.LogInformation("Digi hierarchy home rails={Count}", rails);
    }

    private static string ResolveSlug(string title)
    {
        if (SlugMap.TryGetValue(title, out var mapped)) return mapped;
        return $"digi-{StableHash(title)}";
    }

    private static string StableHash(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash.AsSpan(0, 4)).ToLowerInvariant();
    }

    private static bool TryParseDkp(string externalKey, out long id)
    {
        id = 0;
        if (!externalKey.StartsWith("dkp-", StringComparison.OrdinalIgnoreCase)) return false;
        return long.TryParse(externalKey[4..], NumberStyles.Integer, CultureInfo.InvariantCulture, out id);
    }

    private static string FaDigits(int value) =>
        value.ToString(CultureInfo.InvariantCulture)
            .Replace('0', '۰').Replace('1', '۱').Replace('2', '۲').Replace('3', '۳')
            .Replace('4', '۴').Replace('5', '۵').Replace('6', '۶').Replace('7', '۷')
            .Replace('8', '۸').Replace('9', '۹');
}
