using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Navigation.Domain;

/// <summary>
/// Persisted main-nav payload matching frontend <c>MainNavData</c> JSON.
/// </summary>
public sealed class NavContent : AggregateRoot
{
    private NavContent()
    {
    }

    public string Key { get; private set; } = "default";
    public string PayloadJson { get; private set; } = "{}";
    public DateTime UpdatedAtUtc { get; private set; }

    public static NavContent Create(string key, string payloadJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentException.ThrowIfNullOrWhiteSpace(payloadJson);

        return new NavContent
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
