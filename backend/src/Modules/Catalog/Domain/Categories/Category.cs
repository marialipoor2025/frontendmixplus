using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Categories;

/// <summary>
/// Category node used by homepage circles and (later) PLP / taxonomy.
/// </summary>
public sealed class Category : AggregateRoot
{
    private Category()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Href { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public Guid? ParentId { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static Category Create(
        string externalKey,
        string title,
        string slug,
        string href,
        string? imageUrl = null,
        Guid? parentId = null,
        int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);

        return new Category
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Title = title.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            Href = href,
            ImageUrl = imageUrl,
            ParentId = parentId,
            SortOrder = sortOrder,
            IsActive = true,
        };
    }

    public void Update(string title, string slug, string href, string? imageUrl, int sortOrder)
    {
        Title = title.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Href = href;
        ImageUrl = imageUrl;
        SortOrder = sortOrder;
    }
}
