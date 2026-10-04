namespace MixPlus.Modules.Merchandising.Application.Home;

/// <summary>
/// API contract matching frontend <c>HomePageData</c> / <c>GET /api/home</c>.
/// </summary>
public sealed record HomePageDto(
    HomeBannerDto? TopBanner,
    IReadOnlyList<HomeBannerDto> HeroSlides,
    IReadOnlyList<HomeCategoryDto> Categories,
    IReadOnlyList<HomeProductDto> AmazingOffers,
    IReadOnlyList<HomeBannerDto> MidBanners,
    IReadOnlyList<HomeBrandDto> Brands,
    IReadOnlyList<HomeProductRailDto> ProductRails,
    IReadOnlyList<HomeBannerDto> BottomBanners);

public sealed record HomeBannerDto(
    string Id,
    string Title,
    string ImageUrl,
    string Href,
    string Alt);

public sealed record HomeCategoryDto(
    string Id,
    string Title,
    string Href,
    string ImageUrl);

public sealed record HomeBrandDto(
    string Id,
    string Name,
    string Slug,
    string LogoUrl);

public sealed record HomeMoneyDto(decimal Amount, string Currency);

public sealed record HomeProductDto(
    string Id,
    string Title,
    string Slug,
    string ImageUrl,
    string BrandId,
    string BrandName,
    string? BrandLogoUrl,
    string SellerId,
    string SellerName,
    HomeMoneyDto Price,
    HomeMoneyDto? OriginalPrice,
    int? DiscountPercent,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Badges,
    string? Condition,
    bool InStock);

public sealed record HomeProductRailDto(
    string Id,
    string Title,
    string? Subtitle,
    string? Href,
    bool? ShowUsedLabel,
    IReadOnlyList<HomeProductDto> Products);
