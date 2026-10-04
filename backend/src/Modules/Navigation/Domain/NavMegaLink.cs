using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Navigation.Domain;

public sealed class NavMegaLink : AggregateRoot
{
    private NavMegaLink()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string ColumnExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Href { get; private set; } = string.Empty;
    public MegaLinkKind Kind { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static NavMegaLink Create(
        string externalKey,
        string columnExternalKey,
        string title,
        string href,
        MegaLinkKind kind,
        int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(columnExternalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new NavMegaLink
        {
            Id = StableGuid.From($"nav-link:{externalKey}"),
            ExternalKey = externalKey.Trim(),
            ColumnExternalKey = columnExternalKey.Trim(),
            Title = title.Trim(),
            Href = href?.Trim() ?? string.Empty,
            Kind = kind,
            SortOrder = sortOrder,
            IsActive = true,
        };
    }

    public void Update(string columnExternalKey, string title, string href, MegaLinkKind kind, int sortOrder)
    {
        ColumnExternalKey = columnExternalKey.Trim();
        Title = title.Trim();
        Href = href?.Trim() ?? string.Empty;
        Kind = kind;
        SortOrder = sortOrder;
    }
}

public enum MegaLinkKind
{
    Parent = 0,
    Leaf = 1,
}
