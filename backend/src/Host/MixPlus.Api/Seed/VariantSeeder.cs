using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Variants;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Seeds a sample color + capacity matrix for the first published product.
/// </summary>
public static class VariantSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var db = services.GetRequiredService<CatalogDbContext>();
        if (await db.OptionGroups.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Catalog variants already present — skip");
            return;
        }

        var product = await db.Products.AsNoTracking()
            .Where(x => x.IsPublished)
            .OrderBy(x => x.Title)
            .FirstOrDefaultAsync(cancellationToken);

        if (product is null)
        {
            logger.LogInformation("No catalog products — skip variant seed");
            return;
        }

        var white = ProductOptionValue.Create("سفید براق", "rgb(255, 253, 250)", true, 1);
        var steel = ProductOptionValue.Create("استیل", "rgb(235, 235, 235)", true, 2);
        var colorGroup = ProductOptionGroup.Create(
            product.Id,
            product.ExternalKey,
            "color",
            "رنگ",
            "swatch",
            1,
            [white, steel]);

        var cap28 = ProductOptionValue.Create("۲۸ فوت", null, true, 1);
        var cap30 = ProductOptionValue.Create("۳۰ فوت", null, true, 2);
        var capacityGroup = ProductOptionGroup.Create(
            product.Id,
            product.ExternalKey,
            "capacity",
            "ظرفیت",
            "chip",
            2,
            [cap28, cap30]);

        db.OptionGroups.AddRange(colorGroup, capacityGroup);

        var basePrice = product.Price.Amount;
        db.Skus.AddRange(
            ProductSku.Create(
                product.Id,
                product.ExternalKey,
                $"{product.Slug}-WG-28".ToUpperInvariant(),
                [white.Id, cap28.Id],
                Money.Create(basePrice),
                9,
                product.OriginalPrice,
                product.DiscountPercent),
            ProductSku.Create(
                product.Id,
                product.ExternalKey,
                $"{product.Slug}-ST-30".ToUpperInvariant(),
                [steel.Id, cap30.Id],
                Money.Create(basePrice + 5_800_000),
                0));

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Seeded variants for product {Key}: 2 option groups, 2 SKUs",
            product.ExternalKey);
    }
}
