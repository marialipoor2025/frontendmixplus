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
    string? CategoryId,
    string? CategoryName,
    MoneyDto Price,
    MoneyDto? OriginalPrice,
    int? DiscountPercent,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Badges,
    string? Condition,
    bool InStock,
    bool IsPublished,
    IReadOnlyList<ProductMediaDto>? Gallery = null);

public sealed record ProductMediaDto(
    string Id,
    string Url,
    string ThumbUrl,
    string Alt,
    bool IsPrimary);

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
    string? CategoryId,
    MoneyDto Price,
    MoneyDto? OriginalPrice,
    int? DiscountPercent,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Badges,
    string? Condition,
    bool InStock,
    bool IsPublished,
    /// <summary>Ordered Media asset ids (opaque Guids). First / primary drives card image when ImageUrl empty.</summary>
    IReadOnlyList<string>? MediaIds = null);

public sealed record SetProductStatusRequest(bool IsPublished);

public sealed record ProductGalleryDto(
    IReadOnlyList<ProductMediaDto> Images);
