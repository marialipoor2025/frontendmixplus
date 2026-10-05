namespace MixPlus.Modules.Catalog.Application.Categories;

public sealed record AdminCategoryDto(
    string Id,
    string Title,
    string Slug,
    string Href,
    string? ImageUrl,
    string? ParentId,
    string? ParentTitle,
    int SortOrder,
    bool IsActive,
    int ProductCount);

public sealed record UpsertAdminCategoryRequest(
    string? Id,
    string Title,
    string Slug,
    string Href,
    string? ImageUrl,
    string? ParentId,
    int SortOrder,
    bool IsActive);
