using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Merchandising.Domain;

/// <summary>
/// Banner content for homepage hero / mid / bottom slots.
/// </summary>
public sealed class HomeBanner : AggregateRoot
{
    private HomeBanner()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public string Href { get; private set; } = string.Empty;
    public string Alt { get; private set; } = string.Empty;
    public BannerSlot Slot { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static HomeBanner Create(
        string externalKey,
        string title,
        string imageUrl,
        string href,
        string alt,
        BannerSlot slot,
        int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);

        return new HomeBanner
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Title = title,
            ImageUrl = imageUrl,
            Href = href,
            Alt = alt,
            Slot = slot,
            SortOrder = sortOrder,
            IsActive = true,
        };
    }

    public void Update(string title, string imageUrl, string href, string alt, int sortOrder)
    {
        Title = title;
        ImageUrl = imageUrl;
        Href = href;
        Alt = alt;
        SortOrder = sortOrder;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}

public enum BannerSlot
{
    Top = 0,
    Hero = 1,
    Mid = 2,
    Bottom = 3,
}
