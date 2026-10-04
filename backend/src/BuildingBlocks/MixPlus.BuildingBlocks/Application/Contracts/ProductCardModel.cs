namespace MixPlus.BuildingBlocks.Application.Contracts;

/// <summary>
/// Cross-module product card shape (matches frontend <c>Product</c>).
/// </summary>
public sealed record ProductCardModel(
    string Id,
    string Title,
    string Slug,
    string ImageUrl,
    string BrandId,
    string BrandName,
    string? BrandLogoUrl,
    string SellerId,
    string SellerName,
    MoneyModel Price,
    MoneyModel? OriginalPrice,
    int? DiscountPercent,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Badges,
    string? Condition,
    bool InStock);

public sealed record MoneyModel(decimal Amount, string Currency);

public sealed record BrandModel(string Id, string Name, string Slug, string LogoUrl);

public sealed record HomeCategoryModel(string Id, string Title, string Href, string ImageUrl);

/// <summary>
/// Read port implemented by Catalog; consumed by Merchandising / Promotions composition.
/// </summary>
public interface IProductCardReadPort
{
    Task<IReadOnlyList<ProductCardModel>> GetByExternalKeysAsync(
        IEnumerable<string> externalKeys,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BrandModel>> GetBrandsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<HomeCategoryModel>> GetHomeCategoriesAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Read port implemented by Promotions; consumed by Merchandising home composition.
/// </summary>
public interface IOfferCampaignReadPort
{
    /// <summary>
    /// Returns Catalog product external keys for an active campaign, or empty if missing/inactive.
    /// </summary>
    Task<IReadOnlyList<string>> GetActiveProductKeysAsync(
        string campaignExternalKey,
        CancellationToken cancellationToken = default);
}
