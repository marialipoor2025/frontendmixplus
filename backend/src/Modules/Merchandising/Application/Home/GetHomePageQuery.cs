using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;

namespace MixPlus.Modules.Merchandising.Application.Home;

public interface IGetHomePageQuery
{
    Task<Result<HomePageDto>> ExecuteAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Composes homepage from Merchandising tables + Catalog/Promotions read ports.
/// </summary>
public sealed class GetHomePageQuery(
    MerchandisingDbContext merchandising,
    IProductCardReadPort catalog,
    IOfferCampaignReadPort promotions) : IGetHomePageQuery
{
    private const string AmazingOffersCampaignKey = "amazing-offers";

    public async Task<Result<HomePageDto>> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var banners = await merchandising.HomeBanners.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var rails = await merchandising.ProductRails.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var offerKeys = await promotions.GetActiveProductKeysAsync(
            AmazingOffersCampaignKey,
            cancellationToken);

        var railKeys = rails.SelectMany(r => r.GetProductKeys()).ToList();
        var allKeys = offerKeys.Concat(railKeys).Distinct(StringComparer.OrdinalIgnoreCase);

        var products = await catalog.GetByExternalKeysAsync(allKeys, cancellationToken);
        var productMap = products.ToDictionary(p => p.Id, StringComparer.OrdinalIgnoreCase);

        var categories = await catalog.GetHomeCategoriesAsync(cancellationToken);
        var brands = await catalog.GetBrandsAsync(cancellationToken);

        HomeBannerDto MapBanner(HomeBanner b) =>
            new(b.ExternalKey, b.Title, b.ImageUrl, b.Href, b.Alt);

        HomeProductDto? MapProduct(string key) =>
            productMap.TryGetValue(key, out var p)
                ? new HomeProductDto(
                    p.Id,
                    p.Title,
                    p.Slug,
                    p.ImageUrl,
                    p.BrandId,
                    p.BrandName,
                    p.BrandLogoUrl,
                    p.SellerId,
                    p.SellerName,
                    new HomeMoneyDto(p.Price.Amount, p.Price.Currency),
                    p.OriginalPrice is null
                        ? null
                        : new HomeMoneyDto(p.OriginalPrice.Amount, p.OriginalPrice.Currency),
                    p.DiscountPercent,
                    p.Rating,
                    p.ReviewCount,
                    p.Badges,
                    p.Condition,
                    p.InStock)
                : null;

        var top = banners.FirstOrDefault(b => b.Slot == BannerSlot.Top);

        var dto = new HomePageDto(
            TopBanner: top is null ? null : MapBanner(top),
            HeroSlides: banners.Where(b => b.Slot == BannerSlot.Hero).Select(MapBanner).ToList(),
            Categories: categories
                .Select(c => new HomeCategoryDto(c.Id, c.Title, c.Href, c.ImageUrl))
                .ToList(),
            AmazingOffers: offerKeys.Select(MapProduct).Where(p => p is not null).Cast<HomeProductDto>().ToList(),
            MidBanners: banners.Where(b => b.Slot == BannerSlot.Mid).Select(MapBanner).ToList(),
            Brands: brands.Select(b => new HomeBrandDto(b.Id, b.Name, b.Slug, b.LogoUrl)).ToList(),
            ProductRails: rails.Select(rail => new HomeProductRailDto(
                rail.ExternalKey,
                rail.Title,
                rail.Subtitle,
                rail.Href,
                rail.ShowUsedLabel ? true : null,
                rail.GetProductKeys()
                    .Select(MapProduct)
                    .Where(p => p is not null)
                    .Cast<HomeProductDto>()
                    .ToList())).ToList(),
            BottomBanners: banners.Where(b => b.Slot == BannerSlot.Bottom).Select(MapBanner).ToList());

        return Result.Success(dto);
    }
}
