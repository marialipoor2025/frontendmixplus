using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Navigation.Domain;
using MixPlus.Modules.Navigation.Infrastructure.Persistence;

namespace MixPlus.Modules.Navigation.Application;

public interface IGetMainNavQuery
{
    Task<Result<MainNavDto>> ExecuteAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Composes main nav from normalized Navigation tables.
/// </summary>
public sealed class GetMainNavQuery(NavigationDbContext db) : IGetMainNavQuery
{
    public async Task<Result<MainNavDto>> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var settings = await db.NavSettings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == NavSettings.DefaultKey, cancellationToken);

        if (settings is null)
        {
            return Result.Failure<MainNavDto>(
                "Navigation settings are not seeded. Run the API once with Seed:Enabled=true.");
        }

        var quickLinks = await db.QuickLinks.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var categories = await db.MegaCategories.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var columns = await db.MegaColumns.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var links = await db.MegaLinks.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var linksByColumn = links
            .GroupBy(l => l.ColumnExternalKey, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<MegaMenuLinkDto>)g
                    .Select(l => new MegaMenuLinkDto(
                        l.ExternalKey,
                        l.Title,
                        l.Href,
                        l.Kind == MegaLinkKind.Parent ? "parent" : "leaf"))
                    .ToList(),
                StringComparer.OrdinalIgnoreCase);

        var columnsByCategory = columns
            .GroupBy(c => c.CategoryExternalKey, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<MegaMenuColumnDto>)g
                    .Select(c => new MegaMenuColumnDto(
                        c.ExternalKey,
                        linksByColumn.TryGetValue(c.ExternalKey, out var colLinks) ? colLinks : []))
                    .ToList(),
                StringComparer.OrdinalIgnoreCase);

        var dto = new MainNavDto(
            settings.CategoryTriggerLabel,
            categories.Select(c => new MegaMenuCategoryDto(
                c.ExternalKey,
                c.Title,
                c.Href,
                c.Icon,
                c.AllProductsLabel,
                columnsByCategory.TryGetValue(c.ExternalKey, out var cols) ? cols : [])).ToList(),
            quickLinks.Select(q => new NavQuickLinkDto(
                q.ExternalKey,
                q.Title,
                q.Href,
                q.Icon,
                q.External ? true : null,
                q.Badge)).ToList(),
            new SellerCtaDto(settings.SellerCtaTitle, settings.SellerCtaHref));

        return Result.Success(dto);
    }
}
