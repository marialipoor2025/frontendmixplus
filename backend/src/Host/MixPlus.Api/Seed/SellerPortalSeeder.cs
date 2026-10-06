using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Domain;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Idempotent seed: bind demo seller shop to phone OTP user 09913800445 and assign sample products.
/// </summary>
public static class SellerPortalSeeder
{
    public const string DemoPhone = "09913800445";
    public const string DemoSellerKey = "sel-portal-09913800445";

    /// <summary>UTF-16 escapes keep Persian correct regardless of source-file encoding.</summary>
    public const string DemoSellerName =
        "\u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0645\u06CC\u06A9\u0633\u200C\u067E\u0644\u0627\u0633";

    public static async Task SeedAsync(
        IServiceProvider services,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var sellers = services.GetRequiredService<SellersDbContext>();
        var catalog = services.GetRequiredService<CatalogDbContext>();

        var ownerUserId = StableGuid.From($"user:phone:{DemoPhone}");

        var seller = await sellers.Sellers.FirstOrDefaultAsync(
            x => x.ExternalKey == DemoSellerKey,
            cancellationToken);

        if (seller is null)
        {
            seller = Seller.Create(DemoSellerKey, DemoSellerName, rating: 4.8m, status: "approved");
            seller.AssignOwner(ownerUserId);
            sellers.Sellers.Add(seller);
            logger.LogInformation(
                "Seller portal seed: created seller {Key} owned by user {UserId}",
                DemoSellerKey,
                ownerUserId);
        }
        else
        {
            // Always refresh name/owner so corrupted encodings from prior seeds are repaired.
            seller.AssignOwner(ownerUserId);
            seller.Update(DemoSellerName);
            seller.SetStatus("approved");
            logger.LogInformation(
                "Seller portal seed: refreshed seller {Key} for user {UserId}",
                DemoSellerKey,
                ownerUserId);
        }

        await sellers.SaveChangesAsync(cancellationToken);

        // Assign a handful of published products so the dashboard is usable for PDP image uploads.
        var candidates = await catalog.Products
            .Where(x => x.IsPublished)
            .OrderBy(x => x.ExternalKey)
            .Take(8)
            .ToListAsync(cancellationToken);

        var assigned = 0;
        var renamed = 0;
        foreach (var product in candidates)
        {
            if (product.SellerId == seller.Id)
            {
                if (product.SellerName != DemoSellerName)
                {
                    product.AssignSeller(DemoSellerKey, DemoSellerName);
                    renamed++;
                }

                continue;
            }

            product.AssignSeller(DemoSellerKey, DemoSellerName);
            assigned++;
        }

        if (assigned > 0 || renamed > 0)
        {
            await catalog.SaveChangesAsync(cancellationToken);
        }

        logger.LogInformation(
            "Seller portal seed: seller={Key}, ownerPhone={Phone}, productsAssignedThisRun={Assigned}",
            DemoSellerKey,
            DemoPhone,
            assigned);
    }
}
