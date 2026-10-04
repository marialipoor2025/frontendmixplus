using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Merchandising.Domain;

/// <summary>
/// Persisted homepage payload matching frontend <c>HomePageData</c> JSON.
/// Seeded from frontend mocks; later can be replaced by composed reads.
/// </summary>
public sealed class HomePageContent : AggregateRoot
{
    private HomePageContent()
    {
    }

    public string Key { get; private set; } = "default";
    public string PayloadJson { get; private set; } = "{}";
    public DateTime UpdatedAtUtc { get; private set; }

    public static HomePageContent Create(string key, string payloadJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentException.ThrowIfNullOrWhiteSpace(payloadJson);

        return new HomePageContent
        {
            Id = Guid.NewGuid(),
            Key = key.Trim(),
            PayloadJson = payloadJson,
            UpdatedAtUtc = DateTime.UtcNow,
        };
    }

    public void ReplacePayload(string payloadJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(payloadJson);
        PayloadJson = payloadJson;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
