using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;
using MixPlus.Modules.Promotions.Domain;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Seeds Merchandising banners/rails + Promotions amazing-offers from home.json.
/// </summary>
public static class HomeCompositionSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var merchandising = services.GetRequiredService<MerchandisingDbContext>();
        var promotions = services.GetRequiredService<PromotionsDbContext>();
        var overwrite = config.GetValue("Seed:Overwrite", false);

        var hasBanners = await merchandising.HomeBanners.AnyAsync(cancellationToken);
        var hasRails = await merchandising.ProductRails.AnyAsync(cancellationToken);
        var hasCampaign = await promotions.OfferCampaigns.AnyAsync(cancellationToken);

        if (hasBanners && hasRails && hasCampaign && !overwrite)
        {
            logger.LogInformation(
                "Home composition already present — skip (Seed:Overwrite=true to refresh)");
            return;
        }

        var homeJson = await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "Seed", "data", "home.json"),
            cancellationToken);
        var home = JsonSerializer.Deserialize<HomeSeedDocument>(homeJson, JsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize home.json for home composition seed.");

        await SeedBannersAsync(merchandising, home, overwrite, logger, cancellationToken);
        await SeedRailsAsync(merchandising, home, overwrite, logger, cancellationToken);
        await SeedCampaignAsync(promotions, home, overwrite, logger, cancellationToken);

        logger.LogInformation(
            "Home composition seed complete: banners={Banners}, rails={Rails}, campaigns={Campaigns}",
            await merchandising.HomeBanners.CountAsync(cancellationToken),
            await merchandising.ProductRails.CountAsync(cancellationToken),
            await promotions.OfferCampaigns.CountAsync(cancellationToken));
    }

    private static async Task SeedBannersAsync(
        MerchandisingDbContext db,
        HomeSeedDocument home,
        bool overwrite,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var sort = 0;
        var entries = new List<(BannerSlot Slot, BannerSeed Banner)>();

        if (home.TopBanner is not null)
        {
            entries.Add((BannerSlot.Top, home.TopBanner));
        }

        foreach (var slide in home.HeroSlides ?? [])
        {
            entries.Add((BannerSlot.Hero, slide));
        }

        foreach (var mid in home.MidBanners ?? [])
        {
            entries.Add((BannerSlot.Mid, mid));
        }

        foreach (var bottom in home.BottomBanners ?? [])
        {
            entries.Add((BannerSlot.Bottom, bottom));
        }

        foreach (var (slot, banner) in entries)
        {
            sort++;
            var existing = await db.HomeBanners.FirstOrDefaultAsync(
                x => x.ExternalKey == banner.Id,
                cancellationToken);

            if (existing is null)
            {
                db.HomeBanners.Add(HomeBanner.Create(
                    banner.Id,
                    banner.Title,
                    banner.ImageUrl,
                    banner.Href,
                    banner.Alt,
                    slot,
                    sort));
            }
            else if (overwrite)
            {
                existing.Update(banner.Title, banner.ImageUrl, banner.Href, banner.Alt, sort);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} home banners", entries.Count);
    }

    private static async Task SeedRailsAsync(
        MerchandisingDbContext db,
        HomeSeedDocument home,
        bool overwrite,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var sort = 0;
        foreach (var rail in home.ProductRails ?? [])
        {
            sort++;
            var productKeys = (rail.Products ?? []).Select(p => p.Id).ToList();
            var existing = await db.ProductRails.FirstOrDefaultAsync(
                x => x.ExternalKey == rail.Id,
                cancellationToken);

            if (existing is null)
            {
                var entity = ProductRail.Create(
                    rail.Id,
                    rail.Title,
                    sort,
                    rail.Subtitle,
                    rail.Href,
                    rail.ShowUsedLabel ?? false);
                entity.SetProductKeys(productKeys);
                db.ProductRails.Add(entity);
            }
            else if (overwrite)
            {
                existing.Update(
                    rail.Title,
                    rail.Subtitle,
                    rail.Href,
                    rail.ShowUsedLabel ?? false,
                    sort);
                existing.SetProductKeys(productKeys);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} product rails", (home.ProductRails ?? []).Count);
    }

    private static async Task SeedCampaignAsync(
        PromotionsDbContext db,
        HomeSeedDocument home,
        bool overwrite,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        const string key = "amazing-offers";
        var productKeys = (home.AmazingOffers ?? []).Select(p => p.Id).ToList();
        var existing = await db.OfferCampaigns.FirstOrDefaultAsync(
            x => x.ExternalKey == key,
            cancellationToken);

        if (existing is null)
        {
            var campaign = OfferCampaign.Create(key, "پیشنهاد شگفت‌انگیز");
            campaign.SetProductKeys(productKeys);
            db.OfferCampaigns.Add(campaign);
        }
        else if (overwrite)
        {
            existing.SetProductKeys(productKeys);
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded amazing-offers campaign with {Count} products", productKeys.Count);
    }

    private sealed record HomeSeedDocument(
        BannerSeed? TopBanner,
        IReadOnlyList<BannerSeed>? HeroSlides,
        IReadOnlyList<BannerSeed>? MidBanners,
        IReadOnlyList<BannerSeed>? BottomBanners,
        IReadOnlyList<ProductRefSeed>? AmazingOffers,
        IReadOnlyList<RailSeed>? ProductRails);

    private sealed record BannerSeed(
        string Id,
        string Title,
        string ImageUrl,
        string Href,
        string Alt);

    private sealed record RailSeed(
        string Id,
        string Title,
        string? Subtitle,
        string? Href,
        bool? ShowUsedLabel,
        IReadOnlyList<ProductRefSeed>? Products);

    private sealed record ProductRefSeed(string Id);
}
