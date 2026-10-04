using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Navigation.Domain;

public sealed class NavQuickLink : AggregateRoot
{
    private NavQuickLink()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Href { get; private set; } = string.Empty;
    public string? Icon { get; private set; }
    public bool External { get; private set; }
    public string? Badge { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static NavQuickLink Create(
        string externalKey,
        string title,
        string href,
        int sortOrder,
        string? icon = null,
        bool external = false,
        string? badge = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new NavQuickLink
        {
            Id = StableGuid.From($"nav-quick:{externalKey}"),
            ExternalKey = externalKey.Trim(),
            Title = title.Trim(),
            Href = href?.Trim() ?? string.Empty,
            Icon = icon,
            External = external,
            Badge = badge,
            SortOrder = sortOrder,
            IsActive = true,
        };
    }

    public void Update(
        string title,
        string href,
        int sortOrder,
        string? icon,
        bool external,
        string? badge)
    {
        Title = title.Trim();
        Href = href?.Trim() ?? string.Empty;
        SortOrder = sortOrder;
        Icon = icon;
        External = external;
        Badge = badge;
    }
}
