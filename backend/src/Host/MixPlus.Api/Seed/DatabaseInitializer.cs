using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Cart.Infrastructure.Persistence;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Identity.Infrastructure.Persistence;
using MixPlus.Modules.Media.Infrastructure.Persistence;
using MixPlus.Modules.Merchandising.Domain;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;
using MixPlus.Modules.Navigation.Domain;
using MixPlus.Modules.Navigation.Infrastructure.Persistence;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Applies EF Core migrations per module, then seeds homepage/nav from frontend mock JSON.
/// </summary>
public static class DatabaseInitializer
{
    private static readonly string[] ModuleSchemas =
    [
        CatalogDbContext.Schema,
        SellersDbContext.Schema,
        MerchandisingDbContext.Schema,
        NavigationDbContext.Schema,
        PromotionsDbContext.Schema,
        IdentityDbContext.Schema,
        MediaDbContext.Schema,
        CartDbContext.Schema,
    ];

    public static async Task InitializeAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInitializer");
        var config = services.GetRequiredService<IConfiguration>();

        await MigrateModulesAsync(services, config, logger);

        if (!config.GetValue("Seed:Enabled", true))
        {
            logger.LogInformation("Seed:Enabled=false — skipping seed.");
            return;
        }

        await SeedHomeAndNavAsync(services, config, logger);
        await CatalogSeeder.SeedAsync(services, config, logger);
        await VariantSeeder.SeedAsync(services, config, logger);
        await OfferSeeder.SeedAsync(services, config, logger);
        await HomeCompositionSeeder.SeedAsync(services, config, logger);
        await NavigationSeeder.SeedAsync(services, config, logger);
    }

    private static async Task MigrateModulesAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger)
    {
        DbContext[] contexts =
        [
            services.GetRequiredService<CatalogDbContext>(),
            services.GetRequiredService<SellersDbContext>(),
            services.GetRequiredService<MerchandisingDbContext>(),
            services.GetRequiredService<NavigationDbContext>(),
            services.GetRequiredService<PromotionsDbContext>(),
            services.GetRequiredService<IdentityDbContext>(),
            services.GetRequiredService<MediaDbContext>(),
            services.GetRequiredService<CartDbContext>(),
        ];

        // Schema-only reset (app role cannot recreate the database).
        if (config.GetValue("Seed:ResetDatabase", false))
        {
            logger.LogWarning("Seed:ResetDatabase=true — dropping module schemas only.");
            var first = contexts[0];
            foreach (var schema in ModuleSchemas)
            {
#pragma warning disable EF1002
                await first.Database.ExecuteSqlRawAsync(
                    $"DROP SCHEMA IF EXISTS \"{schema}\" CASCADE;");
#pragma warning restore EF1002
            }
        }

        foreach (var context in contexts)
        {
            var pending = await context.Database.GetPendingMigrationsAsync();
            logger.LogInformation(
                "{Context}: applying migrations ({Count} pending)",
                context.GetType().Name,
                pending.Count());
            await context.Database.MigrateAsync();
        }
    }

    private static async Task SeedHomeAndNavAsync(
        IServiceProvider services,
        IConfiguration config,
        ILogger logger)
    {
        var merchandising = services.GetRequiredService<MerchandisingDbContext>();
        var navigation = services.GetRequiredService<NavigationDbContext>();

        var homeJson = await ReadSeedFileAsync("home.json");
        var navJson = await ReadSeedFileAsync("nav.json");

        var overwrite = config.GetValue("Seed:Overwrite", false);

        var home = await merchandising.HomePages.FirstOrDefaultAsync(x => x.Key == "default");
        if (home is null)
        {
            merchandising.HomePages.Add(HomePageContent.Create("default", homeJson));
            logger.LogInformation("Seeded merchandising.HomePages from home.json");
        }
        else if (overwrite)
        {
            home.ReplacePayload(homeJson);
            logger.LogInformation("Overwrote merchandising.HomePages from home.json");
        }
        else
        {
            logger.LogInformation("HomePages already present — skip (set Seed:Overwrite=true to refresh)");
        }

        var nav = await navigation.NavContents.FirstOrDefaultAsync(x => x.Key == "default");
        if (nav is null)
        {
            navigation.NavContents.Add(NavContent.Create("default", navJson));
            logger.LogInformation("Seeded navigation.NavContents from nav.json");
        }
        else if (overwrite)
        {
            nav.ReplacePayload(navJson);
            logger.LogInformation("Overwrote navigation.NavContents from nav.json");
        }
        else
        {
            logger.LogInformation("NavContents already present — skip (set Seed:Overwrite=true to refresh)");
        }

        await merchandising.SaveChangesAsync();
        await navigation.SaveChangesAsync();
    }

    private static async Task<string> ReadSeedFileAsync(string fileName)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Seed", "data", fileName);
        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                $"Seed file not found: {path}. Ensure Seed/data/*.json are copied to output.",
                path);
        }

        return await File.ReadAllTextAsync(path);
    }
}
