using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Navigation.Domain;

/// <summary>
/// Singleton-style nav chrome settings (trigger label + seller CTA).
/// </summary>
public sealed class NavSettings : AggregateRoot
{
    public const string DefaultKey = "default";

    private NavSettings()
    {
    }

    public string Key { get; private set; } = DefaultKey;
    public string CategoryTriggerLabel { get; private set; } = string.Empty;
    public string SellerCtaTitle { get; private set; } = string.Empty;
    public string SellerCtaHref { get; private set; } = string.Empty;

    public static NavSettings Create(
        string categoryTriggerLabel,
        string sellerCtaTitle,
        string sellerCtaHref,
        string key = DefaultKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        return new NavSettings
        {
            Id = StableGuid.From($"nav-settings:{key}"),
            Key = key.Trim(),
            CategoryTriggerLabel = categoryTriggerLabel?.Trim() ?? string.Empty,
            SellerCtaTitle = sellerCtaTitle?.Trim() ?? string.Empty,
            SellerCtaHref = sellerCtaHref?.Trim() ?? string.Empty,
        };
    }

    public void Update(string categoryTriggerLabel, string sellerCtaTitle, string sellerCtaHref)
    {
        CategoryTriggerLabel = categoryTriggerLabel?.Trim() ?? string.Empty;
        SellerCtaTitle = sellerCtaTitle?.Trim() ?? string.Empty;
        SellerCtaHref = sellerCtaHref?.Trim() ?? string.Empty;
    }
}
