using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Application.Specs;
using MixPlus.Modules.Catalog.Domain.Specs;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class SpecEndpoints
{
    public static void MapSpecEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var catalog = endpoints.MapGroup("/api/catalog").WithTags("Catalog");
        catalog.MapGet("/products/{productKey}/specs", GetProductSpecs)
            .WithName("GetProductSpecs");

        var admin = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        admin.MapGet("/spec-definitions", ListDefinitions).WithName("AdminListSpecDefinitions");
        admin.MapPut("/spec-definitions/{id}", UpsertDefinition).WithName("AdminUpsertSpecDefinition");
        admin.MapDelete("/spec-definitions/{id}", DeleteDefinition).WithName("AdminDeleteSpecDefinition");
        admin.MapPut("/products/{productKey}/specs", ReplaceProductSpecs)
            .WithName("AdminReplaceProductSpecs");
    }

    private static async Task<IResult> GetProductSpecs(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var groups = await db.SpecGroups.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return Results.Ok(new ProductSpecsDto(groups.Select(ToGroupDto).ToList()));
    }

    private static async Task<IResult> ReplaceProductSpecs(
        string productKey,
        UpsertProductSpecsRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var product = await FindProduct(db, productKey, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        if (body.Groups is null || body.Groups.Count == 0)
        {
            return Results.BadRequest(new { error = "حداقل یک گروه مشخصات لازم است" });
        }

        var existing = await db.SpecGroups.Where(x => x.ProductId == product.Id).ToListAsync(ct);
        db.SpecGroups.RemoveRange(existing);

        var sort = 0;
        foreach (var groupReq in body.Groups)
        {
            if (string.IsNullOrWhiteSpace(groupReq.Title))
            {
                return Results.BadRequest(new { error = "عنوان گروه الزامی است" });
            }

            var attrs = new List<ProductSpecAttribute>();
            var attrSort = 0;
            foreach (var attrReq in groupReq.Attributes ?? [])
            {
                if (string.IsNullOrWhiteSpace(attrReq.Label) || attrReq.Values is null || attrReq.Values.Count == 0)
                {
                    continue;
                }

                attrs.Add(ProductSpecAttribute.Create(attrReq.Label, attrReq.Values, attrSort++));
            }

            if (attrs.Count == 0) continue;

            db.SpecGroups.Add(ProductSpecGroup.Create(
                product.Id,
                product.ExternalKey,
                groupReq.Title,
                sort++,
                groupReq.PreviewCount,
                attrs));
        }

        await db.SaveChangesAsync(ct);

        var saved = await db.SpecGroups.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return Results.Ok(new ProductSpecsDto(saved.Select(ToGroupDto).ToList()));
    }

    private static async Task<IResult> ListDefinitions(CatalogDbContext db, CancellationToken ct)
    {
        var rows = await db.SpecDefinitions.AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Group)
            .ThenBy(x => x.Name)
            .ToListAsync(ct);

        return Results.Ok(rows.Select(ToDefDto).ToList());
    }

    private static async Task<IResult> UpsertDefinition(
        string id,
        UpsertSpecDefinitionRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Name) || string.IsNullOrWhiteSpace(body.Group))
        {
            return Results.BadRequest(new { error = "نام و گروه الزامی است" });
        }

        var key = string.IsNullOrWhiteSpace(body.Id) ? id.Trim() : body.Id.Trim();
        if (string.IsNullOrWhiteSpace(key) || key == "new")
        {
            key = $"sd-{Guid.NewGuid():N}"[..12];
        }

        var existing = await db.SpecDefinitions.FirstOrDefaultAsync(x => x.ExternalKey == key, ct);
        if (existing is null)
        {
            var created = SpecDefinition.Create(
                key,
                body.Name,
                body.Group,
                body.Unit ?? "—",
                body.Category ?? "");
            db.SpecDefinitions.Add(created);
            await db.SaveChangesAsync(ct);
            return Results.Ok(ToDefDto(created));
        }

        existing.Update(body.Name, body.Group, body.Unit ?? "—", body.Category ?? "");
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDefDto(existing));
    }

    private static async Task<IResult> DeleteDefinition(
        string id,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var existing = await db.SpecDefinitions.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (existing is null) return Results.NotFound(new { error = "ویژگی یافت نشد" });
        db.SpecDefinitions.Remove(existing);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<Domain.Products.Product?> FindProduct(
        CatalogDbContext db,
        string productKey,
        CancellationToken ct) =>
        await db.Products.AsNoTracking().FirstOrDefaultAsync(
            x => x.ExternalKey == productKey || x.Slug == productKey,
            ct);

    private static ProductSpecGroupDto ToGroupDto(ProductSpecGroup group) =>
        new(
            group.Id.ToString("D"),
            group.Title,
            group.PreviewCount,
            group.Attributes.OrderBy(a => a.SortOrder)
                .Select(a => new ProductSpecAttributeDto(
                    a.Id.ToString("D"),
                    a.Label,
                    a.GetValues()))
                .ToList());

    private static SpecDefinitionDto ToDefDto(SpecDefinition d) =>
        new(d.ExternalKey, d.Name, d.Group, d.Unit, d.Category);
}
