namespace MixPlus.Modules.Catalog.Application.Products;

/// <summary>Admin product card — homepage <c>Product</c> fields plus publish flag.</summary>
public sealed record AdminProductDto(
    string Id,
    string Title,
    string Slug,
    string ImageUrl,
    string BrandId,
    string BrandName,
    string? BrandLogoUrl,
    string SellerId,
    string SellerName,
    MoneyDto Price,
    MoneyDto? OriginalPrice,
    int? DiscountPercent,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Badges,
    string? Condition,
    bool InStock,
    bool IsPublished);

public sealed record UpsertAdminProductRequest(
    string? Id,
    string Title,
    string Slug,
    string ImageUrl,
    string BrandId,
    string BrandName,
    string? BrandLogoUrl,
    string SellerId,
    string SellerName,
    MoneyDto Price,
    MoneyDto? OriginalPrice,
    int? DiscountPercent,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Badges,
    string? Condition,
    bool InStock,
    bool IsPublished);

public sealed record SetProductStatusRequest(bool IsPublished);
