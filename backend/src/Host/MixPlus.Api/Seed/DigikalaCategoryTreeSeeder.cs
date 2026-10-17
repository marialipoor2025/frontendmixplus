using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Api.Seed;

/// <summary>
/// Digikala-shaped home-appliance taxonomy with unlimited nesting via ParentId.
/// Existing flat categories are attached under the root; MixPlus leaves nest under توکار.
/// </summary>
public static class DigikalaCategoryTreeSeeder
{
    public const string RootKey = "cat-home-appliances";

    public static async Task SeedAsync(
        IServiceProvider services,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var catalog = services.GetRequiredService<CatalogDbContext>();

        var root = await EnsureAsync(
            catalog,
            RootKey,
            "لوازم خانگی برقی",
            "home-appliances",
            "/categories",
            parentKey: null,
            sortOrder: 0,
            cancellationToken);

        // Digikala-style L2 under root (homepage circles).
        var l2 = new (string Key, string Title, string Slug, string Href, int Order)[]
        {
            ("cat-fridge", "یخچال و فریزر", "refrigerator-freezer", "/categories/refrigerator-freezer", 10),
            ("cat-washer", "ماشین لباسشویی", "washing-machines", "/categories/washing-machines", 20),
            ("cat-dishwasher", "ماشین ظرفشویی", "dishwasher", "/categories/dishwasher", 30),
            ("cat-vacuum", "جاروبرقی", "vaccum-cleaner", "/categories/vaccum-cleaner", 40),
            ("cat-air", "تهویه، سرمایش و گرمایش", "airtreatment", "/categories/airtreatment", 50),
            ("cat-tv", "تلویزیون", "tv", "/categories/tv", 60),
            ("cat-cooking", "لوازم پخت و پز", "cooking", "/categories/cooking", 70),
            ("cat-drink", "نوشیدنی ساز", "drink-maker", "/categories/drink-maker", 80),
            ("cat-foodproc", "خردکن و غذاساز", "chopper-foodprocessor", "/categories/chopper-foodprocessor", 90),
            ("cat-iron", "اتو", "iron", "/categories/iron", 100),
            ("cat-water", "تصفیه آب", "water-filters", "/categories/water-filters", 110),
            ("cat-steam", "بخار شو", "steam-cleaner", "/categories/steam-cleaner", 120),
            ("cat-sewing", "چرخ خیاطی", "sewing-machine", "/categories/sewing-machine", 130),
            ("cat-builtin", "لوازم توکار", "built-in-appliances", "/categories/built-in-appliances", 140),
        };

        foreach (var (key, title, slug, href, order) in l2)
        {
            await EnsureAsync(catalog, key, title, slug, href, RootKey, order, cancellationToken);
        }

        // L3 under توکار / پخت‌وپز (MixPlus + Digikala leaves).
        var l3 = new (string Key, string Title, string Slug, string Parent, int Order)[]
        {
            ("cat-cooktop", "اجاق گاز صفحه‌ای", "cooktop", "cat-builtin", 10),
            ("cat-oven", "فر توکار", "built-in-oven", "cat-builtin", 20),
            ("cat-hood", "هود", "hood", "cat-builtin", 30),
            ("cat-sink", "سینک ظرفشویی", "sink", "cat-builtin", 40),
            ("cat-microwave-builtin", "مایکروویو توکار", "built-in-microwave", "cat-builtin", 50),
            ("cat-stove", "اجاق گاز", "stove", "cat-cooking", 10),
            ("cat-microwave", "مایکروویو", "microwave", "cat-cooking", 20),
            ("cat-av", "صوتی و تصویری", "audio-video", "cat-tv", 10),
        };

        foreach (var (key, title, slug, parent, order) in l3)
        {
            await EnsureAsync(
                catalog,
                key,
                title,
                slug,
                $"/categories/{slug}",
                parent,
                order,
                cancellationToken);
        }

        await catalog.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Digikala category tree ready: root={Root}, total={Total}",
            root.ExternalKey,
            await catalog.Categories.CountAsync(cancellationToken));
    }

    private static async Task<Category> EnsureAsync(
        CatalogDbContext catalog,
        string key,
        string title,
        string slug,
        string href,
        string? parentKey,
        int sortOrder,
        CancellationToken ct)
    {
        Guid? parentId = null;
        if (!string.IsNullOrWhiteSpace(parentKey))
        {
            var parent = await catalog.Categories.FirstOrDefaultAsync(x => x.ExternalKey == parentKey, ct);
            parentId = parent?.Id;
        }

        var existing = await catalog.Categories.FirstOrDefaultAsync(x => x.ExternalKey == key, ct);
        if (existing is null)
        {
            // Avoid slug collisions with previously seeded flat nodes.
            var finalSlug = slug;
            if (await catalog.Categories.AnyAsync(x => x.Slug == finalSlug, ct))
            {
                finalSlug = $"{slug}-{key[^4..]}".ToLowerInvariant();
            }

            existing = Category.Create(key, title, finalSlug, href, null, parentId, sortOrder);
            catalog.Categories.Add(existing);
            return existing;
        }

        existing.Update(title, existing.Slug, href, existing.ImageUrl, sortOrder);
        existing.SetParent(parentId);
        existing.SetActive(true);
        return existing;
    }
}
