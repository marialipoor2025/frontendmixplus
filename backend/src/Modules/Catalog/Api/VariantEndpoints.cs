using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Application.Variants;
using MixPlus.Modules.Catalog.Domain.Variants;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class VariantEndpoints
{
    public static void MapVariantEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var publicGroup = endpoints.MapGroup("/api/catalog").WithTags("Catalog");
        publicGroup.MapGet("/products/{productKey}/variants", GetProductVariants)
            .WithName("GetProductVariants");

        var admin = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        admin.MapGet("/variants", ListAdminVariants).WithName("AdminListVariants");
        admin.MapGet("/products/{productKey}/option-groups", ListOptionGroups)
            .WithName("AdminListOptionGroups");
        admin.MapPut("/products/{productKey}/option-groups", ReplaceOptionGroups)
            .WithName("AdminReplaceOptionGroups");
        admin.MapGet("/products/{productKey}/skus", ListSkus).WithName("AdminListSkus");
        admin.MapPost("/products/{productKey}/skus", CreateSku).WithName("AdminCreateSku");
        admin.MapPut("/products/{productKey}/skus/{skuId:guid}", UpdateSku)
            .WithName("AdminUpdateSku");
        admin.MapDelete("/products/{productKey}/skus/{skuId:guid}", DeleteSku)
            .WithName("AdminDeleteSku");
    }

    private static async Task<IResult> GetProductVariants(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == productKey || x.Slug == productKey, ct);
        if (product is null)
        {
            return Results.NotFound(new { error = "محصول یافت نشد" });
        }

        var groups = await db.OptionGroups.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var skus = await db.Skus.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SkuCode)
            .ToListAsync(ct);

        var selected = new Dictionary<string, string>();
        foreach (var group in groups)
        {
            var first = group.Values.OrderBy(v => v.SortOrder).FirstOrDefault(v => v.Available)
                        ?? group.Values.OrderBy(v => v.SortOrder).FirstOrDefault();
            if (first is not null)
            {
                selected[group.Id.ToString("D")] = first.Id.ToString("D");
            }
        }

        return Results.Ok(new ProductVariantsDto(
            groups.Select(ToGroupDto).ToList(),
            selected,
            skus.Select(ToSkuDto).ToList()));
    }

    private static async Task<IResult> ListAdminVariants(CatalogDbContext db, CancellationToken ct)
    {
        var skus = await db.Skus.AsNoTracking().OrderBy(x => x.SkuCode).ToListAsync(ct);
        var products = await db.Products.AsNoTracking()
            .Where(p => skus.Select(s => s.ProductId).Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, ct);
        var groups = await db.OptionGroups.AsNoTracking()
            .Where(g => skus.Select(s => s.ProductId).Contains(g.ProductId))
            .ToListAsync(ct);

        var items = skus.Select(sku =>
        {
            products.TryGetValue(sku.ProductId, out var product);
            var labels = BuildAttributeLabel(sku, groups.Where(g => g.ProductId == sku.ProductId));
            return new AdminVariantListItemDto(
                sku.Id.ToString("D"),
                product?.ExternalKey ?? sku.ProductExternalKey,
                product?.Title ?? sku.ProductExternalKey,
                sku.SkuCode,
                labels,
                sku.Price.Amount,
                sku.Stock,
                sku.InStock);
        }).ToList();

        return Results.Ok(items);
    }

    private static async Task<IResult> ListOptionGroups(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var groups = await db.OptionGroups.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        return Results.Ok(groups.Select(ToGroupDto).ToList());
    }

    private static async Task<IResult> ReplaceOptionGroups(
        string productKey,
        List<UpsertOptionGroupRequest> body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var existing = await db.OptionGroups.Where(x => x.ProductId == product.Id).ToListAsync(ct);
        db.OptionGroups.RemoveRange(existing);

        var sort = 0;
        foreach (var group in body)
        {
            sort++;
            var values = (group.Values ?? [])
                .Select((v, i) => ProductOptionValue.Create(
                    v.Label,
                    v.SwatchHex,
                    v.Available,
                    v.SortOrder > 0 ? v.SortOrder : i + 1,
                    Guid.TryParse(v.Id, out var id) ? id : null))
                .ToList();

            db.OptionGroups.Add(ProductOptionGroup.Create(
                product.Id,
                product.ExternalKey,
                group.Code,
                group.Name,
                group.Ui,
                group.SortOrder > 0 ? group.SortOrder : sort,
                values));
        }

        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> ListSkus(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var skus = await db.Skus.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SkuCode)
            .ToListAsync(ct);
        return Results.Ok(skus.Select(ToSkuDto).ToList());
    }

    private static async Task<IResult> CreateSku(
        string productKey,
        UpsertSkuRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        if (await db.Skus.AnyAsync(x => x.SkuCode == body.Sku.Trim().ToUpperInvariant(), ct))
        {
            return Results.BadRequest(new { error = "SKU تکراری است" });
        }

        var optionIds = ParseOptionIds(body.OptionValueIds);
        var sku = ProductSku.Create(
            product.Id,
            product.ExternalKey,
            body.Sku,
            optionIds,
            Money.Create(body.Price),
            body.Stock,
            body.OriginalPrice is null ? null : Money.Create(body.OriginalPrice.Value),
            body.DiscountPercent);

        db.Skus.Add(sku);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/admin/catalog/products/{productKey}/skus/{sku.Id:D}", ToSkuDto(sku));
    }

    private static async Task<IResult> UpdateSku(
        string productKey,
        Guid skuId,
        UpsertSkuRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var sku = await db.Skus.FirstOrDefaultAsync(x => x.Id == skuId && x.ProductId == product.Id, ct);
        if (sku is null) return Results.NotFound(new { error = "تنوع یافت نشد" });

        var code = body.Sku.Trim().ToUpperInvariant();
        if (await db.Skus.AnyAsync(x => x.SkuCode == code && x.Id != skuId, ct))
        {
            return Results.BadRequest(new { error = "SKU تکراری است" });
        }

        sku.Update(
            body.Sku,
            ParseOptionIds(body.OptionValueIds),
            Money.Create(body.Price),
            body.Stock,
            body.OriginalPrice is null ? null : Money.Create(body.OriginalPrice.Value),
            body.DiscountPercent);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToSkuDto(sku));
    }

    private static async Task<IResult> DeleteSku(
        string productKey,
        Guid skuId,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var sku = await db.Skus.FirstOrDefaultAsync(x => x.Id == skuId && x.ProductId == product.Id, ct);
        if (sku is null) return Results.NotFound(new { error = "تنوع یافت نشد" });

        db.Skus.Remove(sku);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<Domain.Products.Product?> FindProduct(
        CatalogDbContext db,
        string productKey,
        CancellationToken ct) =>
        await db.Products.FirstOrDefaultAsync(
            x => x.ExternalKey == productKey || x.Slug == productKey,
            ct);

    private static VariantOptionGroupDto ToGroupDto(ProductOptionGroup group) =>
        new(
            group.Id.ToString("D"),
            group.Code,
            group.Name,
            group.Ui,
            group.Values.OrderBy(v => v.SortOrder)
                .Select(v => new VariantOptionValueDto(
                    v.Id.ToString("D"),
                    v.Label,
                    v.SwatchHex,
                    v.Available))
                .ToList());

    private static VariantSkuDto ToSkuDto(ProductSku sku) =>
        new(
            sku.Id.ToString("D"),
            sku.SkuCode,
            sku.GetOptionValueIds().Select(x => x.ToString("D")).ToList(),
            sku.Price.Amount,
            sku.OriginalPrice?.Amount,
            sku.DiscountPercent,
            sku.InStock,
            sku.Stock);

    private static List<Guid> ParseOptionIds(IReadOnlyList<string>? ids) =>
        (ids ?? [])
        .Select(x => Guid.TryParse(x, out var g) ? g : Guid.Empty)
        .Where(x => x != Guid.Empty)
        .ToList();

    private static string BuildAttributeLabel(
        ProductSku sku,
        IEnumerable<ProductOptionGroup> groups)
    {
        var valueIds = sku.GetOptionValueIds().ToHashSet();
        var parts = new List<string>();
        foreach (var group in groups.OrderBy(g => g.SortOrder))
        {
            var value = group.Values.FirstOrDefault(v => valueIds.Contains(v.Id));
            if (value is not null)
            {
                parts.Add($"{group.Name}: {value.Label}");
            }
        }

        return parts.Count == 0 ? sku.SkuCode : string.Join(" · ", parts);
    }
}
