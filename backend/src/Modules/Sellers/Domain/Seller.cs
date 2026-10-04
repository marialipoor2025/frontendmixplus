using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Sellers.Domain;

/// <summary>
/// Seller aggregate — aligns with frontend <c>Seller</c> type.
/// </summary>
public sealed class Seller : AggregateRoot
{
    private Seller()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public decimal? Rating { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static Seller Create(string externalKey, string name, string? slug = null, decimal? rating = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var resolvedSlug = string.IsNullOrWhiteSpace(slug)
            ? externalKey.Trim().ToLowerInvariant()
            : slug.Trim().ToLowerInvariant();

        return new Seller
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Name = name.Trim(),
            Slug = resolvedSlug,
            Rating = rating,
            IsActive = true,
        };
    }

    public void Update(string name, string? slug = null)
    {
        Name = name.Trim();
        if (!string.IsNullOrWhiteSpace(slug))
        {
            Slug = slug.Trim().ToLowerInvariant();
        }
    }
}
