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
