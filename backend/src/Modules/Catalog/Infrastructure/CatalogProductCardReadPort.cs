using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Catalog.Domain.Categories;
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
            .Include(x => x.MediaItems)
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
        // Homepage circles: active categories that have published products (direct or subtree).
        // Prefer Digikala L2 under root when they have stock; otherwise surface product-bearing
        // MixPlus categories (often root-level) so the rail is never empty.
        const string rootKey = "cat-home-appliances";
        const int maxCircles = 16;

        var allCats = await db.Categories.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);

        var childrenByParent = allCats
            .GroupBy(x => x.ParentId ?? Guid.Empty)
            .ToDictionary(g => g.Key, g => g.Select(c => c.Id).ToList());

        HashSet<Guid> CollectDescendants(Guid id)
        {
            var set = new HashSet<Guid> { id };
            var stack = new Stack<Guid>();
            stack.Push(id);
            while (stack.Count > 0)
            {
                var current = stack.Pop();
                if (!childrenByParent.TryGetValue(current, out var kids)) continue;
                foreach (var kid in kids)
                {
                    if (set.Add(kid)) stack.Push(kid);
                }
            }

            return set;
        }

        var published = await db.Products.AsNoTracking()
            .Include(x => x.MediaItems)
            .Where(x => x.IsPublished && x.CategoryId != null)
            .ToListAsync(cancellationToken);

        var productsByCategory = published
            .GroupBy(x => x.CategoryId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        string ResolveCategoryImage(Category cat, List<Product> productsInSubtree)
        {
            if (!string.IsNullOrWhiteSpace(cat.ImageUrl))
            {
                return cat.ImageUrl!;
            }

            var fromProduct = productsInSubtree
                .Select(ResolveCardImageUrl)
                .FirstOrDefault(url =>
                    !string.IsNullOrWhiteSpace(url)
                    && !url.Equals(CatalogCardImages.DefaultPlaceholder, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(fromProduct))
            {
                return fromProduct;
            }

            return HomeCategoryImageFallback(cat.ExternalKey);
        }

        HomeCategoryModel? TryBuild(Category cat)
        {
            var subtree = CollectDescendants(cat.Id);
            var productsInSubtree = subtree
                .Where(productsByCategory.ContainsKey)
                .SelectMany(id => productsByCategory[id])
                .ToList();
            if (productsInSubtree.Count == 0)
            {
                return null;
            }

            var image = ResolveCategoryImage(cat, productsInSubtree);
            if (string.IsNullOrWhiteSpace(image))
            {
                return null;
            }

            return new HomeCategoryModel(cat.ExternalKey, cat.Title, cat.Href, image);
        }

        var rootId = allCats.FirstOrDefault(x => x.ExternalKey == rootKey)?.Id;
        var result = new List<HomeCategoryModel>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        void Add(HomeCategoryModel? model)
        {
            if (model is null || !seen.Add(model.Id) || result.Count >= maxCircles) return;
            result.Add(model);
        }

        if (rootId is Guid rid)
        {
            foreach (var cat in allCats.Where(x => x.ParentId == rid))
            {
                Add(TryBuild(cat));
            }
        }

        // Supplement with product-bearing categories (MixPlus roots / deep leaves).
        if (result.Count < maxCircles)
        {
            var extras = allCats
                .Where(x =>
                    !string.Equals(x.ExternalKey, rootKey, StringComparison.OrdinalIgnoreCase)
                    && productsByCategory.ContainsKey(x.Id))
                .Select(x => new
                {
                    Cat = x,
                    Count = productsByCategory[x.Id].Count,
                    Model = TryBuild(x),
                })
                .Where(x => x.Model is not null)
                .OrderByDescending(x => x.Count)
                .ThenBy(x => x.Cat.SortOrder)
                .ThenBy(x => x.Cat.Title);

            foreach (var row in extras)
            {
                Add(row.Model);
                if (result.Count >= maxCircles) break;
            }
        }

        return result;
    }

    public async Task<IReadOnlyList<ProductCardModel>> SearchProductsAsync(
        string query,
        int limit = 48,
        CancellationToken cancellationToken = default)
    {
        var q = query.Trim();
        if (q.Length == 0)
        {
            return [];
        }

        limit = limit is < 1 or > 100 ? 48 : limit;
        var pattern = $"%{q}%";

        var rows = await db.Products.AsNoTracking()
            .Include(x => x.MediaItems)
            .Where(x => x.IsPublished && (
                EF.Functions.ILike(x.Title, pattern) ||
                EF.Functions.ILike(x.BrandName, pattern) ||
                EF.Functions.ILike(x.Slug, pattern) ||
                (x.CategoryName != null && EF.Functions.ILike(x.CategoryName, pattern))))
            .OrderBy(x => x.Title)
            .Take(limit)
            .ToListAsync(cancellationToken);

        // Light fuzzy fallback when exact/contains returns nothing.
        if (rows.Count == 0 && q.Length >= 3)
        {
            var candidates = await db.Products.AsNoTracking()
                .Include(x => x.MediaItems)
                .Where(x => x.IsPublished)
                .OrderBy(x => x.Title)
                .Take(200)
                .ToListAsync(cancellationToken);

            rows = candidates
                .Where(p => FuzzyMatch($"{p.Title} {p.BrandName} {p.Slug}", q))
                .Take(limit)
                .ToList();
        }

        return rows.Select(ToModel).ToList();
    }

    public async Task<IReadOnlyList<SearchSuggestionModel>> SuggestAsync(
        string query,
        int limit = 8,
        CancellationToken cancellationToken = default)
    {
        var q = query.Trim();
        if (q.Length < 2)
        {
            return [];
        }

        limit = limit is < 1 or > 20 ? 8 : limit;
        var pattern = $"%{q}%";
        var suggestions = new List<SearchSuggestionModel>
        {
            new($"q-{q}", $"جستجو برای «{q}»", $"/search?q={Uri.EscapeDataString(q)}", "query"),
        };

        var brands = await db.Brands.AsNoTracking()
            .Where(x => x.IsActive && EF.Functions.ILike(x.Name, pattern))
            .OrderBy(x => x.Name)
            .Take(3)
            .ToListAsync(cancellationToken);

        foreach (var brand in brands)
        {
            suggestions.Add(new SearchSuggestionModel(
                $"brand-{brand.ExternalKey}",
                brand.Name,
                $"/brand/{brand.Slug}",
                "brand"));
        }

        var remaining = Math.Max(0, limit - suggestions.Count);
        if (remaining > 0)
        {
            var products = await db.Products.AsNoTracking()
                .Where(x => x.IsPublished && (
                    EF.Functions.ILike(x.Title, pattern) ||
                    EF.Functions.ILike(x.BrandName, pattern)))
                .OrderBy(x => x.Title)
                .Take(remaining)
                .ToListAsync(cancellationToken);

            foreach (var product in products)
            {
                suggestions.Add(new SearchSuggestionModel(
                    product.ExternalKey,
                    product.Title,
                    $"/product/{product.Slug}",
                    "product"));
            }
        }

        return suggestions.Take(limit).ToList();
    }

    public async Task<IReadOnlyList<ProductCardModel>> GetPopularProductsAsync(
        int limit = 48,
        CancellationToken cancellationToken = default)
    {
        limit = limit is < 1 or > 100 ? 48 : limit;

        var rows = await db.Products.AsNoTracking()
            .Include(x => x.MediaItems)
            .Where(x => x.IsPublished && x.InStock)
            .OrderByDescending(x => (x.Rating ?? 0m) * (x.ReviewCount ?? 0))
            .ThenByDescending(x => x.DiscountPercent ?? 0)
            .ThenByDescending(x => x.ReviewCount ?? 0)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return rows.Select(ToModel).ToList();
    }

    private static bool FuzzyMatch(string haystack, string needle)
    {
        var hay = haystack.ToLowerInvariant();
        var tokens = needle.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return tokens.All(token =>
        {
            if (hay.Contains(token, StringComparison.Ordinal)) return true;
            if (token.Length < 3) return false;
            return hay.Split([' ', '-', '_', '/'], StringSplitOptions.RemoveEmptyEntries)
                .Any(word => Levenshtein(token, word) <= 1);
        });
    }

    private static int Levenshtein(string a, string b)
    {
        if (Math.Abs(a.Length - b.Length) > 1) return 2;
        var n = a.Length;
        var m = Math.Min(b.Length, a.Length + 1);
        var prev = Enumerable.Range(0, m + 1).ToArray();
        for (var i = 1; i <= n; i++)
        {
            var cur = new int[m + 1];
            cur[0] = i;
            for (var j = 1; j <= m; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                cur[j] = Math.Min(Math.Min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
            }

            prev = cur;
        }

        return prev[m];
    }

    private static string ResolveCardImageUrl(Product product) =>
        CatalogCardImages.ResolveCardImageUrl(product);

    private static string HomeCategoryImageFallback(string externalKey) =>
        externalKey.Trim().ToLowerInvariant() switch
        {
            "cat-fridge" => "/images/categories/fridge.jpg",
            "cat-washer" => "/images/categories/washer.jpg",
            "cat-dishwasher" => "/images/categories/dishwasher.jpg",
            "cat-vacuum" => "/images/categories/vacuum.jpg",
            "cat-air" => "/images/categories/air.jpg",
            "cat-tv" => "/images/categories/tv.jpg",
            "cat-cooking" => "/images/categories/cooking.jpg",
            "cat-drink" => "/images/categories/drink.jpg",
            "cat-foodproc" => "/images/categories/foodproc.jpg",
            "cat-iron" => "/images/categories/iron.jpg",
            "cat-water" => "/images/categories/water.jpg",
            "cat-steam" => "/images/categories/steam.jpg",
            "cat-sewing" => "/images/categories/sewing.jpg",
            "cat-builtin" => "/images/categories/builtin.jpg",
            "cat-av" => "/images/categories/av.jpg",
            _ => "/placeholders/cat-appliance.png",
        };

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
            ResolveCardImageUrl(product),
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
            product.InStock,
            product.CategoryExternalKey);
    }
}
