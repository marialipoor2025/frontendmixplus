namespace MixPlus.Modules.Catalog.Application.Products;

/// <summary>Matches frontend <c>Product</c> / Merchandising product card shape.</summary>
public sealed record ProductCardDto(
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
    bool InStock);

public sealed record MoneyDto(decimal Amount, string Currency);

public sealed record BrandDto(string Id, string Name, string Slug, string LogoUrl);

public sealed record CategoryDto(
    string Id,
    string Title,
    string Href,
    string? ImageUrl,
    string? ParentId,
    string Slug,
    int SortOrder);
