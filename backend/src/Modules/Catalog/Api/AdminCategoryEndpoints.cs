using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Application.Categories;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class AdminCategoryEndpoints
{
    public static void MapAdminCategoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        group.MapGet("/categories", ListCategories).WithName("AdminListCategories");
        group.MapPost("/categories", CreateCategory).WithName("AdminCreateCategory");
        group.MapPut("/categories/{id}", UpdateCategory).WithName("AdminUpdateCategory");
        group.MapDelete("/categories/{id}", DeleteCategory).WithName("AdminDeleteCategory");
    }

    private static async Task<IResult> ListCategories(CatalogDbContext db, CancellationToken ct)
    {
        var rows = await db.Categories.AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(ct);

        var byId = rows.ToDictionary(x => x.Id);
        var items = rows.Select(c => ToDto(c, byId)).ToList();
        return Results.Ok(items);
    }

    private static async Task<IResult> CreateCategory(
        UpsertAdminCategoryRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var validation = Validate(body);
        if (validation is not null) return validation;

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"cat-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        if (await db.Categories.AnyAsync(x => x.ExternalKey == externalKey, ct))
        {
            return Results.Conflict(new { error = "شناسه دسته تکراری است" });
        }

        var slug = body.Slug.Trim().ToLowerInvariant();
        if (await db.Categories.AnyAsync(x => x.Slug == slug, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        var parentId = await ResolveParentIdAsync(db, body.ParentId, ct);
        if (body.ParentId is not null && parentId is null)
        {
            return Results.BadRequest(new { error = "دسته والد یافت نشد" });
        }

        var href = string.IsNullOrWhiteSpace(body.Href)
            ? $"/category/{slug}"
            : body.Href.Trim();

        var category = Category.Create(
            externalKey,
            body.Title,
            slug,
            href,
            body.ImageUrl,
            parentId,
            body.SortOrder);
        category.SetActive(body.IsActive);

        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);

        var all = await db.Categories.AsNoTracking().ToDictionaryAsync(x => x.Id, ct);
        return Results.Created(
            $"/api/admin/catalog/categories/{category.ExternalKey}",
            ToDto(category, all));
    }

    private static async Task<IResult> UpdateCategory(
        string id,
        UpsertAdminCategoryRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var validation = Validate(body);
        if (validation is not null) return validation;

        var category = await db.Categories.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (category is null) return Results.NotFound(new { error = "دسته یافت نشد" });

        var slug = body.Slug.Trim().ToLowerInvariant();
        if (await db.Categories.AnyAsync(x => x.Slug == slug && x.ExternalKey != id, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        if (!string.IsNullOrWhiteSpace(body.ParentId) && body.ParentId == id)
        {
            return Results.BadRequest(new { error = "دسته نمی‌تواند والد خودش باشد" });
        }

        var parentId = await ResolveParentIdAsync(db, body.ParentId, ct);
        if (body.ParentId is not null && parentId is null)
        {
            return Results.BadRequest(new { error = "دسته والد یافت نشد" });
        }

        var href = string.IsNullOrWhiteSpace(body.Href)
            ? $"/category/{slug}"
            : body.Href.Trim();

        category.Update(body.Title, slug, href, body.ImageUrl, body.SortOrder);
        category.SetParent(parentId);
        category.SetActive(body.IsActive);
        await db.SaveChangesAsync(ct);

        var all = await db.Categories.AsNoTracking().ToDictionaryAsync(x => x.Id, ct);
        return Results.Ok(ToDto(category, all));
    }

    private static async Task<IResult> DeleteCategory(
        string id,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var category = await db.Categories.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (category is null) return Results.NotFound(new { error = "دسته یافت نشد" });

        if (await db.Categories.AnyAsync(x => x.ParentId == category.Id, ct))
        {
            return Results.BadRequest(new { error = "ابتدا زیردسته‌ها را حذف یا جابه‌جا کنید" });
        }

        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static IResult? Validate(UpsertAdminCategoryRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return Results.BadRequest(new { error = "عنوان الزامی است" });
        if (string.IsNullOrWhiteSpace(body.Slug))
            return Results.BadRequest(new { error = "اسلاگ الزامی است" });
        return null;
    }

    private static async Task<Guid?> ResolveParentIdAsync(
        CatalogDbContext db,
        string? parentExternalKey,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(parentExternalKey)) return null;
        var parent = await db.Categories.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == parentExternalKey, ct);
        return parent?.Id;
    }

    private static AdminCategoryDto ToDto(
        Category category,
        IReadOnlyDictionary<Guid, Category> byId)
    {
        string? parentKey = null;
        string? parentTitle = null;
        if (category.ParentId is Guid pid && byId.TryGetValue(pid, out var parent))
        {
            parentKey = parent.ExternalKey;
            parentTitle = parent.Title;
        }

        return new AdminCategoryDto(
            category.ExternalKey,
            category.Title,
            category.Slug,
            category.Href,
            category.ImageUrl,
            parentKey,
            parentTitle,
            category.SortOrder,
            category.IsActive,
            0);
    }
}
