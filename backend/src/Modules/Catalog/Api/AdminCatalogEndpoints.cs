using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Application.Products;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class AdminCatalogEndpoints
{
    public static void MapAdminCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");

        group.MapGet("/products", ListProducts).WithName("AdminListProducts");
        group.MapGet("/products/{id}", GetProduct).WithName("AdminGetProduct");
        group.MapPost("/products", CreateProduct).WithName("AdminCreateProduct");
        group.MapPut("/products/{id}", UpdateProduct).WithName("AdminUpdateProduct");
        group.MapPatch("/products/{id}/status", SetStatus).WithName("AdminSetProductStatus");
        group.MapDelete("/products/{id}", UnpublishProduct).WithName("AdminUnpublishProduct");
    }

    private static async Task<IResult> ListProducts(
        CatalogDbContext db,
        string? q,
        bool? isPublished,
        int page = 1,
        int pageSize = 10,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = db.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(x =>
                x.Title.Contains(term) ||
                x.Slug.Contains(term) ||
                x.ExternalKey.Contains(term) ||
                x.BrandName.Contains(term));
        }

        if (isPublished is not null)
        {
            query = query.Where(x => x.IsPublished == isPublished);
        }

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(x => x.IsPublished)
            .ThenBy(x => x.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(ToAdminDto).ToList();
        return Results.Ok(PagedResult<AdminProductDto>.Create(items, page, pageSize, totalCount));
    }

    private static async Task<IResult> GetProduct(string id, CatalogDbContext db, CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        return product is null ? Results.NotFound(new { error = "محصول یافت نشد" }) : Results.Ok(ToAdminDto(product));
    }

    private static async Task<IResult> CreateProduct(
        UpsertAdminProductRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var validation = Validate(body);
        if (validation is not null) return validation;

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"p-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        if (await db.Products.AnyAsync(x => x.ExternalKey == externalKey, ct))
        {
            return Results.Conflict(new { error = "شناسه محصول تکراری است" });
        }

        if (await db.Products.AnyAsync(x => x.Slug == body.Slug.Trim().ToLowerInvariant(), ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        var brandLogo = await ResolveBrandLogoAsync(db, body.BrandId, body.BrandLogoUrl, ct);
        var imageUrl = ResolveImageUrl(body);
        var product = Product.Create(
            externalKey,
            body.Title,
            body.Slug,
            imageUrl,
            body.BrandId,
            body.BrandName,
            body.SellerId,
            body.SellerName,
            Money.Create(body.Price.Amount, body.Price.Currency),
            body.InStock,
            body.IsPublished);

        product.ApplyDetails(
            brandLogo,
            body.OriginalPrice is null ? null : Money.Create(body.OriginalPrice.Amount, body.OriginalPrice.Currency),
            body.DiscountPercent,
            body.Rating,
            body.ReviewCount,
            body.Badges,
            ParseCondition(body.Condition),
            body.InStock);

        await ApplyCategoryAsync(product, body.CategoryId, db, ct);
        ApplyMedia(product, body, imageUrl);

        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/admin/catalog/products/{product.ExternalKey}", ToAdminDto(product));
    }

    private static async Task<IResult> UpdateProduct(
        string id,
        UpsertAdminProductRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var validation = Validate(body);
        if (validation is not null) return validation;

        var product = await db.Products.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var slug = body.Slug.Trim().ToLowerInvariant();
        if (await db.Products.AnyAsync(x => x.Slug == slug && x.ExternalKey != id, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        var brandLogo = await ResolveBrandLogoAsync(db, body.BrandId, body.BrandLogoUrl, ct);
        var imageUrl = ResolveImageUrl(body);
        product.UpdateCore(
            body.Title,
            body.Slug,
            imageUrl,
            body.BrandId,
            body.BrandName,
            body.SellerId,
            body.SellerName,
            Money.Create(body.Price.Amount, body.Price.Currency));

        product.ApplyDetails(
            brandLogo,
            body.OriginalPrice is null ? null : Money.Create(body.OriginalPrice.Amount, body.OriginalPrice.Currency),
            body.DiscountPercent,
            body.Rating,
            body.ReviewCount,
            body.Badges,
            ParseCondition(body.Condition),
            body.InStock);

        await ApplyCategoryAsync(product, body.CategoryId, db, ct);
        ApplyMedia(product, body, imageUrl);
        product.SetPublished(body.IsPublished);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToAdminDto(product));
    }

    private static async Task<IResult> SetStatus(
        string id,
        SetProductStatusRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        product.SetPublished(body.IsPublished);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToAdminDto(product));
    }

    private static async Task<IResult> UnpublishProduct(string id, CatalogDbContext db, CancellationToken ct)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        product.SetPublished(false);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToAdminDto(product));
    }

    private static IResult? Validate(UpsertAdminProductRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });
        if (string.IsNullOrWhiteSpace(body.Slug))
            return Results.BadRequest(new { error = "اسلاگ الزامی است" });
        if (string.IsNullOrWhiteSpace(body.ImageUrl) && (body.MediaIds is null || body.MediaIds.Count == 0))
            return Results.BadRequest(new { error = "تصویر الزامی است" });
        if (string.IsNullOrWhiteSpace(body.BrandId) || string.IsNullOrWhiteSpace(body.BrandName))
            return Results.BadRequest(new { error = "برند الزامی است" });
        if (string.IsNullOrWhiteSpace(body.SellerId) || string.IsNullOrWhiteSpace(body.SellerName))
            return Results.BadRequest(new { error = "فروشنده الزامی است" });
        if (body.Price is null || body.Price.Amount < 0)
            return Results.BadRequest(new { error = "قیمت نامعتبر است" });

        if (body.MediaIds is { Count: > 0 })
        {
            foreach (var id in body.MediaIds)
            {
                if (!Guid.TryParse(id, out _))
                {
                    return Results.BadRequest(new { error = $"شناسه رسانه نامعتبر: {id}" });
                }
            }
        }

        return null;
    }

    private static string ResolveImageUrl(UpsertAdminProductRequest body)
    {
        if (!string.IsNullOrWhiteSpace(body.ImageUrl))
        {
            return body.ImageUrl.Trim();
        }

        var first = body.MediaIds?.FirstOrDefault(x => Guid.TryParse(x, out _));
        return first is null
            ? "/placeholders/product-appliance.png"
            : ProductMediaUrls.Gallery(Guid.Parse(first));
    }

    private static async Task ApplyCategoryAsync(
        Product product,
        string? categoryExternalKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(categoryExternalKey))
        {
            product.SetCategory(null, null, null);
            return;
        }

        var category = await db.Categories.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == categoryExternalKey.Trim(), ct);
        if (category is null)
        {
            product.SetCategory(null, null, null);
            return;
        }

        product.SetCategory(category.Id, category.ExternalKey, category.Title);
    }

    private static void ApplyMedia(Product product, UpsertAdminProductRequest body, string imageUrl)
    {
        if (body.MediaIds is null)
        {
            return;
        }

        var items = body.MediaIds
            .Where(id => Guid.TryParse(id, out _))
            .Select((id, index) => (Guid.Parse(id), index == 0))
            .ToList();

        product.ReplaceMedia(items, imageUrl);
    }

    private static async Task<string?> ResolveBrandLogoAsync(
        CatalogDbContext db,
        string brandId,
        string? fallback,
        CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(fallback)) return fallback;
        var brand = await db.Brands.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == brandId, ct);
        return brand?.LogoUrl;
    }

    private static ProductCondition ParseCondition(string? condition) =>
        string.Equals(condition, "used", StringComparison.OrdinalIgnoreCase)
            ? ProductCondition.Used
            : ProductCondition.New;

    private static AdminProductDto ToAdminDto(Product product)
    {
        IReadOnlyList<string>? badges = null;
        if (!string.IsNullOrWhiteSpace(product.BadgesJson))
        {
            badges = JsonSerializer.Deserialize<List<string>>(product.BadgesJson);
        }

        var gallery = product.MediaItems
            .OrderBy(x => x.SortOrder)
            .Select(x => new ProductMediaDto(
                x.MediaAssetId.ToString("D"),
                ProductMediaUrls.Gallery(x.MediaAssetId),
                ProductMediaUrls.Thumb(x.MediaAssetId),
                product.Title,
                x.IsPrimary))
            .ToList();

        return new AdminProductDto(
            product.ExternalKey,
            product.Title,
            product.Slug,
            product.ImageUrl,
            product.BrandExternalKey,
            product.BrandName,
            product.BrandLogoUrl,
            product.SellerExternalKey,
            product.SellerName,
            product.CategoryExternalKey,
            product.CategoryName,
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
            product.IsPublished,
            gallery.Count > 0 ? gallery : null);
    }
}

internal static class ProductMediaUrls
{
    public static string Gallery(Guid mediaAssetId) => $"/api/media/{mediaAssetId:D}/gallery";
    public static string Thumb(Guid mediaAssetId) => $"/api/media/{mediaAssetId:D}/thumb";
    public static string Card(Guid mediaAssetId) => $"/api/media/{mediaAssetId:D}/card";
}
