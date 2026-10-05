namespace MixPlus.Modules.Catalog.Application.Brands;

public sealed record AdminBrandDto(
    string Id,
    string Name,
    string Slug,
    string LogoUrl,
    bool IsActive,
    int ProductCount);

public sealed record UpsertAdminBrandRequest(
    string? Id,
    string Name,
    string Slug,
    string? LogoUrl,
    bool IsActive);
