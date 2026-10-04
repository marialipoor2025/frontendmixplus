using System.Text.Json;
using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Promotions.Domain;

/// <summary>
/// Amazing-offers campaign. Product keys reference Catalog.ExternalKey.
/// </summary>
public sealed class OfferCampaign : AggregateRoot
{
    private OfferCampaign()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public DateTime? StartsAtUtc { get; private set; }
    public DateTime? EndsAtUtc { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string ProductKeysJson { get; private set; } = "[]";

    public static OfferCampaign Create(
        string externalKey,
        string title,
        DateTime? startsAtUtc = null,
        DateTime? endsAtUtc = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new OfferCampaign
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Title = title.Trim(),
            StartsAtUtc = startsAtUtc,
            EndsAtUtc = endsAtUtc,
            IsActive = true,
            ProductKeysJson = "[]",
        };
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
