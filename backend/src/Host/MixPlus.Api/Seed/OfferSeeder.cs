using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Offers;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Seeds multi-seller marketplace offers for PDP (#39).
/// </summary>
public static class OfferSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var catalog = services.GetRequiredService<CatalogDbContext>();
        var overwrite = config.GetValue("Seed:Overwrite", false);

        var hasOffers = await catalog.Offers.AnyAsync(cancellationToken);
        if (hasOffers && !overwrite)
        {
            logger.LogInformation("Product offers already present — skip");
            return;
        }

        if (overwrite)
        {
            catalog.Offers.RemoveRange(catalog.Offers);
            await catalog.SaveChangesAsync(cancellationToken);
        }

        var products = await catalog.Products.AsNoTracking()
            .Where(x => x.IsPublished)
            .OrderBy(x => x.Title)
            .Take(40)
            .ToListAsync(cancellationToken);

        if (products.Count == 0)
        {
            logger.LogWarning("No published products — skip offer seed");
            return;
        }

        var created = 0;
        foreach (var product in products)
        {
            var primaryKey = $"offer-{product.ExternalKey}-primary";
            var primary = ProductOffer.Create(
                primaryKey,
                product.Id,
                product.Slug,
                product.SellerExternalKey,
                product.SellerName,
                product.Price,
                isOfficial: true,
                performanceLabel: "عالی",
                deliveryLabel: "باربری توسط میکس پلاس",
                warranty: "گارانتی ۲۴ ماهه انتخاب سرویس حامی",
                originalPrice: product.OriginalPrice,
                discountPercent: product.DiscountPercent,
                sortOrder: 0);
            primary.SetStats("عضو رسمی میکس پلاس", 100, 100, 99.5m);
            catalog.Offers.Add(primary);
            created++;

            // Second marketplace seller for richer PDP seller list.
            var altPrice = Money.Create(
                Math.Max(1000, product.Price.Amount - Math.Round(product.Price.Amount * 0.02m)),
                product.Price.Currency);
            var altKey = $"offer-{product.ExternalKey}-alt";
            var alt = ProductOffer.Create(
                altKey,
                product.Id,
                product.Slug,
                "seller-niavaran",
                "فروشگاه بازرگانی نیاوران",
                altPrice,
                isOfficial: false,
                performanceLabel: "عالی",
                deliveryLabel: "باربری توسط میکس پلاس از ۲ روز دیگر",
                warranty: "گارانتی ۲۴ ماهه انتخاب سرویس حامی",
                sortOrder: 1);
            alt.SetStats("عضو از ۵ سال و ۱۰ ماه", 98.4m, 96.1m, 99m);
            catalog.Offers.Add(alt);
            created++;
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} product offers for {Products} products", created, products.Count);
    }
}
