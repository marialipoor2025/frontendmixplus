using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Navigation.Domain;
using MixPlus.Modules.Navigation.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Seeds normalized Navigation tables from nav.json.
/// </summary>
public static class NavigationSeeder
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
        var db = services.GetRequiredService<NavigationDbContext>();
        var overwrite = config.GetValue("Seed:Overwrite", false);

        var navJson = await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "Seed", "data", "nav.json"),
            cancellationToken);
        var nav = JsonSerializer.Deserialize<NavSeedDocument>(navJson, JsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize nav.json for navigation seed.");

        var hasSettings = await db.NavSettings.AnyAsync(cancellationToken);
        var hasCategories = await db.MegaCategories.AnyAsync(cancellationToken);

        // Always upsert missing quick links (e.g. new Blog entry) without full overwrite.
        await SeedQuickLinksAsync(db, nav, overwrite, cancellationToken);

        if (hasSettings && hasCategories && !overwrite)
        {
            logger.LogInformation(
                "Navigation mega-menu already present — skip categories (Seed:Overwrite=true to refresh)");
            return;
        }

        await SeedSettingsAsync(db, nav, overwrite, cancellationToken);
        await SeedMegaMenuAsync(db, nav, overwrite, cancellationToken);

        logger.LogInformation(
            "Navigation seed complete: settings=1, quickLinks={Quick}, categories={Cats}, columns={Cols}, links={Links}",
            await db.QuickLinks.CountAsync(cancellationToken),
            await db.MegaCategories.CountAsync(cancellationToken),
            await db.MegaColumns.CountAsync(cancellationToken),
            await db.MegaLinks.CountAsync(cancellationToken));
    }

    private static async Task SeedSettingsAsync(
        NavigationDbContext db,
        NavSeedDocument nav,
        bool overwrite,
        CancellationToken cancellationToken)
    {
        var existing = await db.NavSettings.FirstOrDefaultAsync(
            x => x.Key == NavSettings.DefaultKey,
            cancellationToken);

        var title = nav.SellerCta?.Title ?? string.Empty;
        var href = nav.SellerCta?.Href ?? string.Empty;

        if (existing is null)
        {
            db.NavSettings.Add(NavSettings.Create(
                nav.CategoryTriggerLabel ?? string.Empty,
                title,
                href));
        }
        else if (overwrite)
        {
            existing.Update(nav.CategoryTriggerLabel ?? string.Empty, title, href);
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedQuickLinksAsync(
        NavigationDbContext db,
        NavSeedDocument nav,
        bool overwrite,
        CancellationToken cancellationToken)
    {
        var sort = 0;
        foreach (var link in nav.QuickLinks ?? [])
        {
            sort++;
            var existing = await db.QuickLinks.FirstOrDefaultAsync(
                x => x.ExternalKey == link.Id,
                cancellationToken);

            if (existing is null)
            {
                db.QuickLinks.Add(NavQuickLink.Create(
                    link.Id,
                    link.Title,
                    link.Href,
                    sort,
                    link.Icon,
                    link.External ?? false,
                    link.Badge));
            }
            else
            {
                // Always refresh order/title so navbar order stays aligned with nav.json.
                existing.Update(
                    link.Title,
                    link.Href,
                    sort,
                    link.Icon,
                    link.External ?? false,
                    link.Badge);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedMegaMenuAsync(
        NavigationDbContext db,
        NavSeedDocument nav,
        bool overwrite,
        CancellationToken cancellationToken)
    {
        var catSort = 0;
        foreach (var category in nav.Categories ?? [])
        {
            catSort++;
            var existingCat = await db.MegaCategories.FirstOrDefaultAsync(
                x => x.ExternalKey == category.Id,
                cancellationToken);

            if (existingCat is null)
            {
                db.MegaCategories.Add(NavMegaCategory.Create(
                    category.Id,
                    category.Title,
                    category.Href,
                    category.Icon,
                    category.AllProductsLabel,
                    catSort));
            }
            else if (overwrite)
            {
                existingCat.Update(
                    category.Title,
                    category.Href,
                    category.Icon,
                    category.AllProductsLabel,
                    catSort);
            }

            var colSort = 0;
            foreach (var column in category.Columns ?? [])
            {
                colSort++;
                var existingCol = await db.MegaColumns.FirstOrDefaultAsync(
                    x => x.ExternalKey == column.Id,
                    cancellationToken);

                if (existingCol is null)
                {
                    db.MegaColumns.Add(NavMegaColumn.Create(column.Id, category.Id, colSort));
                }
                else if (overwrite)
                {
                    existingCol.Update(category.Id, colSort);
                }

                var linkSort = 0;
                foreach (var link in column.Links ?? [])
                {
                    linkSort++;
                    var kind = string.Equals(link.Kind, "parent", StringComparison.OrdinalIgnoreCase)
                        ? MegaLinkKind.Parent
                        : MegaLinkKind.Leaf;

                    var existingLink = await db.MegaLinks.FirstOrDefaultAsync(
                        x => x.ExternalKey == link.Id,
                        cancellationToken);

                    if (existingLink is null)
                    {
                        db.MegaLinks.Add(NavMegaLink.Create(
                            link.Id,
                            column.Id,
                            link.Title,
                            link.Href,
                            kind,
                            linkSort));
                    }
                    else if (overwrite)
                    {
                        existingLink.Update(column.Id, link.Title, link.Href, kind, linkSort);
                    }
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private sealed record NavSeedDocument(
        string? CategoryTriggerLabel,
        SellerCtaSeed? SellerCta,
        IReadOnlyList<QuickLinkSeed>? QuickLinks,
        IReadOnlyList<CategorySeed>? Categories);

    private sealed record SellerCtaSeed(string Title, string Href);

    private sealed record QuickLinkSeed(
        string Id,
        string Title,
        string Href,
        string? Icon,
        bool? External,
        string? Badge);

    private sealed record CategorySeed(
        string Id,
        string Title,
        string Href,
        string Icon,
        string AllProductsLabel,
        IReadOnlyList<ColumnSeed>? Columns);

    private sealed record ColumnSeed(string Id, IReadOnlyList<LinkSeed>? Links);

    private sealed record LinkSeed(string Id, string Title, string Href, string Kind);
}
