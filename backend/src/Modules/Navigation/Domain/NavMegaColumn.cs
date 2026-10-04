using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Navigation.Domain;

public sealed class NavMegaColumn : AggregateRoot
{
    private NavMegaColumn()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string CategoryExternalKey { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static NavMegaColumn Create(string externalKey, string categoryExternalKey, int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(categoryExternalKey);

        return new NavMegaColumn
        {
            Id = StableGuid.From($"nav-col:{externalKey}"),
            ExternalKey = externalKey.Trim(),
            CategoryExternalKey = categoryExternalKey.Trim(),
            SortOrder = sortOrder,
            IsActive = true,
        };
    }

    public void Update(string categoryExternalKey, int sortOrder)
    {
        CategoryExternalKey = categoryExternalKey.Trim();
        SortOrder = sortOrder;
    }
}
