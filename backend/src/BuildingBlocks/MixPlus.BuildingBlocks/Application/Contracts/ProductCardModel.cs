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
/// Read port implemented by Catalog; consumed by Merchandising / Promotions / Search.
/// </summary>
public interface IProductCardReadPort
{
    Task<IReadOnlyList<ProductCardModel>> GetByExternalKeysAsync(
        IEnumerable<string> externalKeys,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BrandModel>> GetBrandsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<HomeCategoryModel>> GetHomeCategoriesAsync(CancellationToken cancellationToken = default);

    /// <summary>Published products matching a search query (title/brand/slug).</summary>
    Task<IReadOnlyList<ProductCardModel>> SearchProductsAsync(
        string query,
        int limit = 48,
        CancellationToken cancellationToken = default);

    /// <summary>Autocomplete suggestions for header search.</summary>
    Task<IReadOnlyList<SearchSuggestionModel>> SuggestAsync(
        string query,
        int limit = 8,
        CancellationToken cancellationToken = default);
}

public sealed record SearchSuggestionModel(
    string Id,
    string Label,
    string Href,
    string Kind);

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
