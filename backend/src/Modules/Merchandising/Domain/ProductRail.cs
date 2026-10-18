using System.Text.Json;
using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Merchandising.Domain;

/// <summary>
/// Curated product rail on the homepage. Product keys reference Catalog.ExternalKey.
/// </summary>
public sealed class ProductRail : AggregateRoot
{
    private ProductRail()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Subtitle { get; private set; }
    public string? Href { get; private set; }
    public bool ShowUsedLabel { get; private set; }
    /// <summary>Show star rating + review count on product cards in this rail.</summary>
    public bool ShowReviewScore { get; private set; } = true;
    /// <summary>Show merchandising badges (mixplus-choice / opportunity) on cards.</summary>
    public bool ShowCardLabels { get; private set; }
    /// <summary>beside | top — where card labels render when enabled.</summary>
    public string LabelPosition { get; private set; } = "beside";
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string ProductKeysJson { get; private set; } = "[]";

    public static ProductRail Create(
        string externalKey,
        string title,
        int sortOrder,
        string? subtitle = null,
        string? href = null,
        bool showUsedLabel = false,
        bool showReviewScore = true,
        bool showCardLabels = false,
        string labelPosition = "beside")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new ProductRail
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Title = title.Trim(),
            Subtitle = subtitle,
            Href = href,
            ShowUsedLabel = showUsedLabel,
            ShowReviewScore = showReviewScore,
            ShowCardLabels = showCardLabels,
            LabelPosition = NormalizeLabelPosition(labelPosition),
            SortOrder = sortOrder,
            IsActive = true,
            ProductKeysJson = "[]",
        };
    }

    public void Update(
        string title,
        string? subtitle,
        string? href,
        bool showUsedLabel,
        int sortOrder,
        bool showReviewScore = true,
        bool showCardLabels = false,
        string? labelPosition = null)
    {
        Title = title.Trim();
        Subtitle = subtitle;
        Href = href;
        ShowUsedLabel = showUsedLabel;
        ShowReviewScore = showReviewScore;
        ShowCardLabels = showCardLabels;
        if (!string.IsNullOrWhiteSpace(labelPosition))
        {
            LabelPosition = NormalizeLabelPosition(labelPosition);
        }

        SortOrder = sortOrder;
    }

    public void SetActive(bool isActive) => IsActive = isActive;

    public void SetProductKeys(IEnumerable<string> productExternalKeys)
    {
        var keys = productExternalKeys
            .Where(k => !string.IsNullOrWhiteSpace(k))
            .Select(k => k.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        ProductKeysJson = JsonSerializer.Serialize(keys);
    }

    public IReadOnlyList<string> GetProductKeys()
    {
        if (string.IsNullOrWhiteSpace(ProductKeysJson))
        {
            return [];
        }

        return JsonSerializer.Deserialize<List<string>>(ProductKeysJson) ?? [];
    }

    private static string NormalizeLabelPosition(string? raw) =>
        string.Equals(raw?.Trim(), "top", StringComparison.OrdinalIgnoreCase)
            ? "top"
            : "beside";
}
