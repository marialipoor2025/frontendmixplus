using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Navigation.Domain;

public sealed class NavMegaCategory : AggregateRoot
{
    private NavMegaCategory()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Href { get; private set; } = string.Empty;
    public string Icon { get; private set; } = string.Empty;
    public string AllProductsLabel { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static NavMegaCategory Create(
        string externalKey,
        string title,
        string href,
        string icon,
        string allProductsLabel,
        int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new NavMegaCategory
        {
            Id = StableGuid.From($"nav-cat:{externalKey}"),
            ExternalKey = externalKey.Trim(),
            Title = title.Trim(),
            Href = href?.Trim() ?? string.Empty,
            Icon = icon?.Trim() ?? string.Empty,
            AllProductsLabel = allProductsLabel?.Trim() ?? string.Empty,
            SortOrder = sortOrder,
            IsActive = true,
        };
    }

    public void Update(
        string title,
        string href,
        string icon,
        string allProductsLabel,
        int sortOrder)
    {
        Title = title.Trim();
        Href = href?.Trim() ?? string.Empty;
        Icon = icon?.Trim() ?? string.Empty;
        AllProductsLabel = allProductsLabel?.Trim() ?? string.Empty;
        SortOrder = sortOrder;
    }
}
