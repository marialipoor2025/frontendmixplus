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
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string ProductKeysJson { get; private set; } = "[]";

    public static ProductRail Create(
        string externalKey,
        string title,
        int sortOrder,
        string? subtitle = null,
        string? href = null,
        bool showUsedLabel = false)
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
            SortOrder = sortOrder,
            IsActive = true,
            ProductKeysJson = "[]",
        };
    }

    public void Update(string title, string? subtitle, string? href, bool showUsedLabel, int sortOrder)
    {
        Title = title.Trim();
        Subtitle = subtitle;
        Href = href;
        ShowUsedLabel = showUsedLabel;
        SortOrder = sortOrder;
    }

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
}
