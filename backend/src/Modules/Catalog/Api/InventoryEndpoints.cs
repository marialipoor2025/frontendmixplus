using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class InventoryEndpoints
{
    public static void MapInventoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var admin = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        admin.MapGet("/inventory", ListInventory).WithName("AdminListInventory");
        admin.MapPatch("/inventory/{skuId:guid}", AdjustInventory).WithName("AdminAdjustInventory");
    }

    private static async Task<IResult> ListInventory(CatalogDbContext db, CancellationToken ct)
    {
        var skus = await db.Skus.AsNoTracking().OrderBy(x => x.SkuCode).ToListAsync(ct);
        var products = await db.Products.AsNoTracking()
            .Where(p => skus.Select(s => s.ProductId).Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, ct);

        var items = skus.Select(sku =>
        {
            products.TryGetValue(sku.ProductId, out var product);
            return new
            {
                id = sku.Id.ToString("D"),
                sku = sku.SkuCode,
                title = product?.Title ?? sku.ProductExternalKey,
                warehouse = "انبار اصلی",
                onHand = sku.Stock,
                reserved = 0,
            };
        }).ToList();

        return Results.Ok(items);
    }

    private static async Task<IResult> AdjustInventory(
        Guid skuId,
        AdjustInventoryRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var sku = await db.Skus.FirstOrDefaultAsync(x => x.Id == skuId, ct);
        if (sku is null) return Results.NotFound(new { error = "SKU یافت نشد" });

        sku.AdjustStock(body.OnHand);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new
        {
            id = sku.Id.ToString("D"),
            sku = sku.SkuCode,
            onHand = sku.Stock,
            inStock = sku.InStock,
        });
    }

    private sealed record AdjustInventoryRequest(int OnHand);
}
