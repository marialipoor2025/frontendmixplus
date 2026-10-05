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
                string? q,
                string? sort,
                CancellationToken ct) =>
            {
                var query = db.Products.AsNoTracking().Where(x => x.IsPublished);

                if (!string.IsNullOrWhiteSpace(brandSlug))
                {
                    var slug = brandSlug.Trim().ToLowerInvariant();
                    var brandKey = await db.Brands.AsNoTracking()
                        .Where(b => b.IsActive && b.Slug == slug)
                        .Select(b => b.ExternalKey)
                        .FirstOrDefaultAsync(ct);

                    if (brandKey is null)
                    {
                        return Results.Ok(Array.Empty<ProductCardDto>());
                    }

                    query = query.Where(x => x.BrandExternalKey == brandKey);
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

                var rows = await query.ToListAsync(ct);
                return Results.Ok(rows.Select(ToDto).ToList());
            })
            .WithName("ListCatalogProducts");

        group.MapGet("/products/{productKey}", async (
                string productKey,
                CatalogDbContext db,
                CancellationToken ct) =>
            {
                var product = await db.Products.AsNoTracking()
                    .FirstOrDefaultAsync(
                        x => x.IsPublished &&
                             (x.ExternalKey == productKey || x.Slug == productKey),
                        ct);
                return product is null
                    ? Results.NotFound(new { error = "محصول یافت نشد" })
                    : Results.Ok(ToDto(product));
            })
            .WithName("GetCatalogProduct");

        group.MapGet("/brands", async (CatalogDbContext db, string? slug, CancellationToken ct) =>
            {
                var query = db.Brands.AsNoTracking().Where(x => x.IsActive);
                if (!string.IsNullOrWhiteSpace(slug))
                {
                    var normalized = slug.Trim().ToLowerInvariant();
                    query = query.Where(x => x.Slug == normalized);
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
                    .Select(x => new CategoryDto(
                        x.ExternalKey,
                        x.Title,
                        x.Href,
                        x.ImageUrl,
                        x.ParentId.HasValue ? x.ParentId.Value.ToString("D") : null,
                        x.Slug,
                        x.SortOrder))
                    .ToListAsync(ct);
                return Results.Ok(rows);
            })
            .WithName("ListCatalogCategories");

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
    }

    private static ProductCardDto ToDto(Product product)
    {
        IReadOnlyList<string>? badges = null;
        if (!string.IsNullOrWhiteSpace(product.BadgesJson))
        {
            badges = JsonSerializer.Deserialize<List<string>>(product.BadgesJson);
        }

        return new ProductCardDto(
            product.ExternalKey,
            product.Title,
            product.Slug,
            product.ImageUrl,
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
            product.InStock);
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
}
