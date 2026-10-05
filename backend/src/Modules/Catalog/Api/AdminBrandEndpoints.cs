using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Application.Brands;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class AdminBrandEndpoints
{
    public static void MapAdminBrandEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        group.MapGet("/brands", ListBrands).WithName("AdminListBrands");
        group.MapPost("/brands", CreateBrand).WithName("AdminCreateBrand");
        group.MapPut("/brands/{id}", UpdateBrand).WithName("AdminUpdateBrand");
        group.MapDelete("/brands/{id}", DeleteBrand).WithName("AdminDeleteBrand");
    }

    private static async Task<IResult> ListBrands(CatalogDbContext db, CancellationToken ct)
    {
        var brands = await db.Brands.AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        var counts = await db.Products.AsNoTracking()
            .GroupBy(x => x.BrandExternalKey)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

        var items = brands.Select(b => new AdminBrandDto(
            b.ExternalKey,
            b.Name,
            b.Slug,
            b.LogoUrl,
            b.IsActive,
            counts.GetValueOrDefault(b.ExternalKey))).ToList();

        return Results.Ok(items);
    }

    private static async Task<IResult> CreateBrand(
        UpsertAdminBrandRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var validation = Validate(body);
        if (validation is not null) return validation;

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"br-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        if (await db.Brands.AnyAsync(x => x.ExternalKey == externalKey, ct))
        {
            return Results.Conflict(new { error = "شناسه برند تکراری است" });
        }

        var slug = body.Slug.Trim().ToLowerInvariant();
        if (await db.Brands.AnyAsync(x => x.Slug == slug, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        var brand = Brand.Create(
            externalKey,
            body.Name,
            slug,
            string.IsNullOrWhiteSpace(body.LogoUrl)
                ? "/placeholders/product-appliance.png"
                : body.LogoUrl.Trim());
        brand.SetActive(body.IsActive);

        db.Brands.Add(brand);
        await db.SaveChangesAsync(ct);
        return Results.Created(
            $"/api/admin/catalog/brands/{brand.ExternalKey}",
            new AdminBrandDto(brand.ExternalKey, brand.Name, brand.Slug, brand.LogoUrl, brand.IsActive, 0));
    }

    private static async Task<IResult> UpdateBrand(
        string id,
        UpsertAdminBrandRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var validation = Validate(body);
        if (validation is not null) return validation;

        var brand = await db.Brands.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (brand is null) return Results.NotFound(new { error = "برند یافت نشد" });

        var slug = body.Slug.Trim().ToLowerInvariant();
        if (await db.Brands.AnyAsync(x => x.Slug == slug && x.ExternalKey != id, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        brand.Update(
            body.Name,
            slug,
            string.IsNullOrWhiteSpace(body.LogoUrl) ? brand.LogoUrl : body.LogoUrl.Trim());
        brand.SetActive(body.IsActive);
        await db.SaveChangesAsync(ct);

        var count = await db.Products.AsNoTracking()
            .CountAsync(x => x.BrandExternalKey == brand.ExternalKey, ct);

        return Results.Ok(new AdminBrandDto(
            brand.ExternalKey,
            brand.Name,
            brand.Slug,
            brand.LogoUrl,
            brand.IsActive,
            count));
    }

    private static async Task<IResult> DeleteBrand(
        string id,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var brand = await db.Brands.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (brand is null) return Results.NotFound(new { error = "برند یافت نشد" });

        if (await db.Products.AnyAsync(x => x.BrandExternalKey == brand.ExternalKey, ct))
        {
            return Results.BadRequest(new { error = "برند دارای محصول است؛ ابتدا محصولات را جابه‌جا کنید" });
        }

        db.Brands.Remove(brand);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static IResult? Validate(UpsertAdminBrandRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
            return Results.BadRequest(new { error = "نام برند الزامی است" });
        if (string.IsNullOrWhiteSpace(body.Slug))
            return Results.BadRequest(new { error = "اسلاگ الزامی است" });
        return null;
    }
}
