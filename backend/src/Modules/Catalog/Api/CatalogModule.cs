using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Catalog.Application.Abstractions;
using MixPlus.Modules.Catalog.Application.Products;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Infrastructure;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

public sealed class CatalogModule : IModule
{
    public string Name => "Catalog";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CatalogDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                CatalogDbContext.Schema,
                typeof(CatalogDbContext).Assembly.GetName().Name));

        services.AddScoped<ICatalogDbContext>(sp => sp.GetRequiredService<CatalogDbContext>());
        services.AddScoped<IProductCardReadPort, CatalogProductCardReadPort>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/catalog").WithTags("Catalog");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("CatalogHealth");

        group.MapGet("/products", async (
                CatalogDbContext db,
                string? brandSlug,
                string? categorySlug,
                string? condition,
                string? q,
                string? sort,
                string? brand,
                bool? inStock,
                decimal? minPrice,
                decimal? maxPrice,
                int? page,
                int? pageSize,
                CancellationToken ct) =>
            {
                var query = db.Products.AsNoTracking()
                    .Include(x => x.MediaItems)
                    .Where(x => x.IsPublished);

                if (!string.IsNullOrWhiteSpace(condition))
                {
                    var cond = condition.Trim().ToLowerInvariant();
                    if (cond is "used" or "stock" or "استوک")
                    {
                        query = query.Where(x => x.Condition == ProductCondition.Used);
                    }
                    else if (cond is "new" or "نو")
                    {
                        query = query.Where(x => x.Condition == ProductCondition.New);
                    }
                }

                if (!string.IsNullOrWhiteSpace(brandSlug))
                {
                    var slug = brandSlug.Trim().ToLowerInvariant();
                    var brandKey = await db.Brands.AsNoTracking()
                        .Where(b => b.IsActive && b.Slug == slug)
                        .Select(b => b.ExternalKey)
                        .FirstOrDefaultAsync(ct);

                    if (brandKey is not null)
                    {
                        query = query.Where(x => x.BrandExternalKey == brandKey);
                    }
                    else if (IsSellerHouseBrandSlug(slug))
                    {
                        // Showcase uses /brand/mixplus, but Digi seed stores brand slug hashes
                        // (e.g. e1bf07ea) with Persian name «میکس پلاس». Resolve by name/key.
                        var houseKeys = await db.Brands.AsNoTracking()
                            .Where(b => b.IsActive && (
                                EF.Functions.ILike(b.Name, "%میکس%پلاس%")
                                || EF.Functions.ILike(b.Name, "%میکس پلاس%")
                                || EF.Functions.ILike(b.Name, "%mix+%")
                                || EF.Functions.ILike(b.Name, "%mixplus%")
                                || b.Slug == "mixplus"))
                            .Select(b => b.ExternalKey)
                            .ToListAsync(ct);

                        if (houseKeys.Count > 0)
                        {
                            query = query.Where(x => houseKeys.Contains(x.BrandExternalKey));
                        }
                        else
                        {
                            query = query.Where(x =>
                                EF.Functions.ILike(x.BrandName, "%میکس%")
                                || EF.Functions.ILike(x.BrandName, "%mix+%")
                                || EF.Functions.ILike(x.BrandName, "%mixplus%")
                                || EF.Functions.ILike(x.SellerName, "%میکس%")
                                || x.SellerExternalKey.StartsWith("sel-portal-"));
                        }
                    }
                    else
                    {
                        return Results.Ok(Array.Empty<ProductCardDto>());
                    }
                }

                if (!string.IsNullOrWhiteSpace(categorySlug))
                {
                    var slug = categorySlug.Trim().ToLowerInvariant();
                    var category = await db.Categories.AsNoTracking()
                        .Where(c => c.IsActive && c.Slug == slug)
                        .Select(c => new { c.Id, c.ExternalKey })
                        .FirstOrDefaultAsync(ct);

                    var categoryMatched = false;
                    if (category is not null)
                    {
                        var byCategory = query.Where(x =>
                            x.CategoryId == category.Id ||
                            x.CategoryExternalKey == category.ExternalKey);
                        if (await byCategory.AnyAsync(ct))
                        {
                            query = byCategory;
                            categoryMatched = true;
                        }
                    }

                    if (!categoryMatched)
                    {
                        var terms = CategorySearchTerms(slug);
                        if (terms.Count == 0)
                        {
                            return Results.Ok(Array.Empty<ProductCardDto>());
                        }

                        // Filter in memory: Npgsql cannot translate terms.Any + ILike cleanly.
                        var candidates = await query.ToListAsync(ct);
                        var matchedIds = candidates
                            .Where(x => terms.Any(term =>
                                x.Title.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                                x.Slug.Contains(term, StringComparison.OrdinalIgnoreCase)))
                            .Select(x => x.Id)
                            .ToList();

                        if (matchedIds.Count == 0)
                        {
                            return Results.Ok(Array.Empty<ProductCardDto>());
                        }

                        query = query.Where(x => matchedIds.Contains(x.Id));
                    }
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var term = q.Trim();
                    var pattern = $"%{term}%";
                    query = query.Where(x =>
                        EF.Functions.ILike(x.Title, pattern) ||
                        EF.Functions.ILike(x.BrandName, pattern) ||
                        EF.Functions.ILike(x.Slug, pattern));
                }

                if (!string.IsNullOrWhiteSpace(brand))
                {
                    var brandNames = brand.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Where(b => b.Length > 0)
                        .ToArray();
                    if (brandNames.Length > 0)
                    {
                        query = query.Where(x => brandNames.Contains(x.BrandName));
                    }
                }

                if (inStock == true)
                {
                    query = query.Where(x => x.InStock);
                }

                if (minPrice is > 0)
                {
                    query = query.Where(x => x.Price.Amount >= minPrice.Value);
                }

                if (maxPrice is > 0)
                {
                    query = query.Where(x => x.Price.Amount <= maxPrice.Value);
                }

                query = (sort?.Trim().ToLowerInvariant()) switch
                {
                    "price-asc" => query.OrderBy(x => x.Price.Amount),
                    "price-desc" => query.OrderByDescending(x => x.Price.Amount),
                    "newest" or "shipping" => query.OrderByDescending(x => x.ExternalKey),
                    "popular" or "rating" or "bestseller" or "buyers" =>
                        query.OrderByDescending(x => x.Rating ?? 0),
                    "discount" or "selected" => query.OrderByDescending(x => x.DiscountPercent ?? 0),
                    _ => query.OrderBy(x => x.Title),
                };

                var total = await query.CountAsync(ct);
                var size = Math.Clamp(pageSize ?? 0, 0, 60);
                var pageNumber = Math.Max(1, page ?? 1);
                // pageSize omitted / 0 → return full list (legacy clients).
                List<Product> rows;
                if (size <= 0)
                {
                    rows = await query.ToListAsync(ct);
                    size = Math.Max(total, 1);
                    pageNumber = 1;
                }
                else
                {
                    rows = await query
                        .Skip((pageNumber - 1) * size)
                        .Take(size)
                        .ToListAsync(ct);
                }

                var items = rows.Select(p => ToDto(p)).ToList();
                return Results.Ok(new
                {
                    items,
                    total,
                    page = pageNumber,
                    pageSize = size,
                    // Legacy flat array alias for older clients that still map the root.
                    products = items,
                });
            })
            .WithName("ListCatalogProducts");

        group.MapGet("/products/{productKey}", async (
                string productKey,
                CatalogDbContext db,
                CancellationToken ct) =>
            {
                var product = await db.Products.AsNoTracking()
                    .Include(x => x.MediaItems)
                    .FirstOrDefaultAsync(
                        x => x.IsPublished &&
                             (x.ExternalKey == productKey || x.Slug == productKey),
                        ct);
                if (product is null)
                {
                    return Results.NotFound(new { error = "محصول یافت نشد" });
                }

                Category? category = null;
                if (product.CategoryId is Guid categoryId)
                {
                    category = await db.Categories.AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Id == categoryId, ct);
                }
                else if (!string.IsNullOrWhiteSpace(product.CategoryExternalKey))
                {
                    category = await db.Categories.AsNoTracking()
                        .FirstOrDefaultAsync(c => c.ExternalKey == product.CategoryExternalKey, ct);
                }

                var categoryPath = await BuildCategoryPathAsync(db, category, ct);
                return Results.Ok(ToDto(product, category, categoryPath));
            })
            .WithName("GetCatalogProduct");

        group.MapGet("/brands", async (
                CatalogDbContext db,
                string? slug,
                string? categorySlug,
                CancellationToken ct) =>
            {
                var query = db.Brands.AsNoTracking().Where(x => x.IsActive);
                if (!string.IsNullOrWhiteSpace(slug))
                {
                    var normalized = slug.Trim().ToLowerInvariant();
                    query = query.Where(x => x.Slug == normalized);
                }

                // Brands that actually have published products under a category (incl. descendants).
                if (!string.IsNullOrWhiteSpace(categorySlug))
                {
                    var catKey = categorySlug.Trim().ToLowerInvariant();
                    var category = await db.Categories.AsNoTracking()
                        .FirstOrDefaultAsync(
                            c => c.IsActive && (c.Slug == catKey || c.ExternalKey == catKey),
                            ct);
                    if (category is null)
                    {
                        return Results.Ok(Array.Empty<BrandDto>());
                    }

                    var allCategories = await db.Categories.AsNoTracking()
                        .Where(c => c.IsActive)
                        .Select(c => new { c.Id, c.ParentId })
                        .ToListAsync(ct);
                    var categoryIds = CollectCategorySubtreeIds(
                        allCategories.Select(c => (c.Id, c.ParentId)).ToList(),
                        category.Id);

                    var brandKeys = await db.Products.AsNoTracking()
                        .Where(p =>
                            p.IsPublished
                            && p.CategoryId != null
                            && categoryIds.Contains(p.CategoryId.Value))
                        .Select(p => p.BrandExternalKey)
                        .Distinct()
                        .ToListAsync(ct);

                    query = query.Where(b => brandKeys.Contains(b.ExternalKey));
                }

                var rows = await query
                    .OrderBy(x => x.Name)
                    .Select(x => new BrandDto(x.ExternalKey, x.Name, x.Slug, x.LogoUrl))
                    .ToListAsync(ct);
                return Results.Ok(rows);
            })
            .WithName("ListCatalogBrands");

        group.MapGet("/categories", async (CatalogDbContext db, CancellationToken ct) =>
            {
                var rows = await db.Categories.AsNoTracking()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.SortOrder)
                    .ThenBy(x => x.Title)
                    .ToListAsync(ct);
                var byId = rows.ToDictionary(x => x.Id);
                var dtos = rows.Select(x => new CategoryDto(
                    x.ExternalKey,
                    x.Title,
                    x.Href,
                    x.ImageUrl,
                    x.ParentId is Guid pid && byId.TryGetValue(pid, out var parent)
                        ? parent.ExternalKey
                        : null,
                    x.Slug,
                    x.SortOrder)).ToList();
                return Results.Ok(dtos);
            })
            .WithName("ListCatalogCategories");

        // Nested Digikala-style tree (unlimited depth).
        group.MapGet("/categories/tree", async (
                CatalogDbContext db,
                bool? withProductsOnly,
                CancellationToken ct) =>
            {
                var rows = await db.Categories.AsNoTracking()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.SortOrder)
                    .ThenBy(x => x.Title)
                    .ToListAsync(ct);
                var byId = rows.ToDictionary(x => x.Id);
                var children = rows
                    .GroupBy(x => x.ParentId)
                    .ToDictionary(g => g.Key ?? Guid.Empty, g => g.ToList());

                var productImages = await db.Products.AsNoTracking()
                    .Where(x => x.IsPublished && x.CategoryId != null && x.ImageUrl != "")
                    .GroupBy(x => x.CategoryId!.Value)
                    .Select(g => new { CategoryId = g.Key, ImageUrl = g.Min(p => p.ImageUrl)! })
                    .ToDictionaryAsync(x => x.CategoryId, x => x.ImageUrl, ct);

                var productCategoryIds = productImages.Keys.ToHashSet();
                // Also count products without image for withProductsOnly filter.
                var catsWithProducts = await db.Products.AsNoTracking()
                    .Where(x => x.IsPublished && x.CategoryId != null)
                    .Select(x => x.CategoryId!.Value)
                    .Distinct()
                    .ToListAsync(ct);
                foreach (var id in catsWithProducts) productCategoryIds.Add(id);

                bool SubtreeHasProducts(Guid id)
                {
                    var stack = new Stack<Guid>();
                    stack.Push(id);
                    while (stack.Count > 0)
                    {
                        var current = stack.Pop();
                        if (productCategoryIds.Contains(current)) return true;
                        if (!children.TryGetValue(current, out var kids)) continue;
                        foreach (var kid in kids) stack.Push(kid.Id);
                    }

                    return false;
                }

                string? ResolveImage(Category c)
                {
                    if (!string.IsNullOrWhiteSpace(c.ImageUrl)) return c.ImageUrl;
                    // Prefer a product photo from this node, then walk children (BFS).
                    if (productImages.TryGetValue(c.Id, out var direct)) return direct;
                    var queue = new Queue<Guid>();
                    queue.Enqueue(c.Id);
                    while (queue.Count > 0)
                    {
                        var current = queue.Dequeue();
                        if (productImages.TryGetValue(current, out var img)) return img;
                        if (!children.TryGetValue(current, out var kids)) continue;
                        foreach (var kid in kids) queue.Enqueue(kid.Id);
                    }

                    return c.ImageUrl;
                }

                List<object> Build(Guid? parentId)
                {
                    var key = parentId ?? Guid.Empty;
                    if (!children.TryGetValue(key, out var list)) return [];
                    var filtered = withProductsOnly == true
                        ? list.Where(c => SubtreeHasProducts(c.Id)).ToList()
                        : list;
                    return filtered.Select(c => (object)new
                    {
                        id = c.ExternalKey,
                        title = c.Title,
                        slug = c.Slug,
                        href = c.Href,
                        imageUrl = ResolveImage(c),
                        parentId = c.ParentId is Guid pid && byId.TryGetValue(pid, out var p)
                            ? p.ExternalKey
                            : null,
                        sortOrder = c.SortOrder,
                        children = Build(c.Id),
                    }).ToList();
                }

                return Results.Ok(Build(null));
            })
            .WithName("ListCatalogCategoryTree");

        endpoints.MapAdminCatalogEndpoints();
        endpoints.MapAdminCategoryEndpoints();
        endpoints.MapAdminBrandEndpoints();
        endpoints.MapVariantEndpoints();
        endpoints.MapInventoryEndpoints();
        endpoints.MapOfferEndpoints();
        endpoints.MapProductOfferEndpoints();
        endpoints.MapReviewEndpoints();
        endpoints.MapProductMediaEndpoints();
        endpoints.MapSpecEndpoints();
        endpoints.MapProductPdpContentEndpoints();
        endpoints.MapSellerCatalogEndpoints();
    }

    private static async Task<IReadOnlyList<CategoryPathItemDto>> BuildCategoryPathAsync(
        CatalogDbContext db,
        Category? leaf,
        CancellationToken ct)
    {
        if (leaf is null) return [];

        var all = await db.Categories.AsNoTracking()
            .Where(x => x.IsActive)
            .ToDictionaryAsync(x => x.Id, ct);

        var path = new List<CategoryPathItemDto>();
        Category? current = leaf;
        var guard = 0;
        while (current is not null && guard++ < 16)
        {
            path.Insert(0, new CategoryPathItemDto(
                current.ExternalKey,
                current.Title,
                current.Slug,
                current.Href));
            if (current.ParentId is not Guid pid || !all.TryGetValue(pid, out current))
            {
                break;
            }
        }

        return path;
    }

    private static ProductCardDto ToDto(
        Product product,
        Category? category = null,
        IReadOnlyList<CategoryPathItemDto>? categoryPath = null)
    {
        IReadOnlyList<string>? badges = null;
        if (!string.IsNullOrWhiteSpace(product.BadgesJson))
        {
            badges = JsonSerializer.Deserialize<List<string>>(product.BadgesJson);
        }

        var categoryId = category?.ExternalKey ?? product.CategoryExternalKey;
        var categoryName = category?.Title ?? product.CategoryName;
        var categorySlug = category?.Slug;
        var categoryHref = category?.Href
            ?? (string.IsNullOrWhiteSpace(categorySlug)
                ? null
                : $"/categories/{categorySlug}");

        var imageUrl = CatalogCardImages.ResolveCardImageUrl(product);

        return new ProductCardDto(
            product.ExternalKey,
            product.Title,
            product.Slug,
            imageUrl,
            product.BrandExternalKey,
            product.BrandName,
            product.BrandLogoUrl,
            product.SellerExternalKey,
            product.SellerName,
            new MoneyDto(product.Price.Amount, product.Price.Currency),
            product.OriginalPrice is null
                ? null
                : new MoneyDto(product.OriginalPrice.Amount, product.OriginalPrice.Currency),
            product.DiscountPercent,
            product.Rating,
            product.ReviewCount,
            badges,
            product.Condition == ProductCondition.Used ? "used" : "new",
            product.InStock,
            categoryId,
            categoryName,
            categorySlug,
            categoryHref,
            product.SkuCode,
            product.ImageAlt,
            categoryPath);
    }

    /// <summary>
    /// Build search tokens for nested PLP slugs when products aren't category-linked yet.
    /// </summary>
    private static List<string> CategorySearchTerms(string slug)
    {
        var terms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var part in slug.Split('-', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (part.Length < 3)
            {
                continue;
            }

            // Skip low-signal English glue words.
            if (part is "the" or "and" or "for" or "with")
            {
                continue;
            }

            terms.Add(part);
        }

        if (slug.Contains("refrigerator", StringComparison.OrdinalIgnoreCase) ||
            slug.Contains("fridge", StringComparison.OrdinalIgnoreCase) ||
            slug.Contains("freezer", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("یخچال");
            terms.Add("فریزر");
            terms.Add("fridge");
            terms.Add("freezer");
            terms.Add("refrigerator");
        }

        if (slug.Contains("side", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("side");
            terms.Add("ساید");
        }

        if (slug.Contains("twin", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("twin");
            terms.Add("دوقلو");
        }

        if (slug.Contains("combi", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("combi");
            terms.Add("کمبی");
        }

        if (slug.Contains("washing", StringComparison.OrdinalIgnoreCase) ||
            slug.Contains("washer", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("لباسشویی");
            terms.Add("washer");
        }

        if (slug.Contains("dishwasher", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("ظرفشویی");
            terms.Add("dishwasher");
        }

        if (slug.Contains("vacuum", StringComparison.OrdinalIgnoreCase) ||
            slug.Contains("vaccum", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("جاروبرقی");
            terms.Add("vacuum");
        }

        if (slug is "tv" || slug.Contains("television", StringComparison.OrdinalIgnoreCase))
        {
            terms.Add("تلویزیون");
            terms.Add("tv");
        }

        return terms.ToList();
    }

    /// <summary>
    /// Storefront curated marks that represent a seller shop (not a manufacturer brand row).
    /// </summary>
    private static bool IsSellerHouseBrandSlug(string slug) =>
        slug is "mixplus" or "mix+" or "mix-plus";

    private static HashSet<Guid> CollectCategorySubtreeIds(
        IReadOnlyList<(Guid Id, Guid? ParentId)> categories,
        Guid rootId)
    {
        var childrenByParent = categories
            .Where(c => c.ParentId is not null)
            .GroupBy(c => c.ParentId!.Value)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Id).ToList());

        var ids = new HashSet<Guid> { rootId };
        var stack = new Stack<Guid>();
        stack.Push(rootId);
        while (stack.Count > 0)
        {
            var current = stack.Pop();
            if (!childrenByParent.TryGetValue(current, out var kids))
            {
                continue;
            }

            foreach (var kid in kids)
            {
                if (ids.Add(kid))
                {
                    stack.Push(kid);
                }
            }
        }

        return ids;
    }
}
