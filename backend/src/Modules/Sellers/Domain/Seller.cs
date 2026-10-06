using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Sellers.Domain;

/// <summary>
/// Seller aggregate — aligns with frontend <c>Seller</c> / admin seller types.
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
    /// <summary>approved | pending | suspended</summary>
    public string Status { get; private set; } = "approved";

    /// <summary>
    /// Identity user id that owns this seller account (Guid-only cross-schema ref).
    /// </summary>
    public Guid? OwnerUserId { get; private set; }

    public static Seller Create(
        string externalKey,
        string name,
        string? slug = null,
        decimal? rating = null,
        string status = "approved")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var resolvedSlug = string.IsNullOrWhiteSpace(slug)
            ? externalKey.Trim().ToLowerInvariant()
            : slug.Trim().ToLowerInvariant();

        var seller = new Seller
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Name = name.Trim(),
            Slug = resolvedSlug,
            Rating = rating,
        };
        seller.SetStatus(status);
        return seller;
    }

    /// <summary>Bind this seller shop to an Identity user (phone/email login).</summary>
    public void AssignOwner(Guid ownerUserId)
    {
        if (ownerUserId == Guid.Empty)
        {
            throw new ArgumentException("Owner user id is required.", nameof(ownerUserId));
        }

        OwnerUserId = ownerUserId;
    }

    public void ClearOwner() => OwnerUserId = null;

    public void Update(string name, string? slug = null, decimal? rating = null)
    {
        Name = name.Trim();
        if (!string.IsNullOrWhiteSpace(slug))
        {
            Slug = slug.Trim().ToLowerInvariant();
        }

        if (rating.HasValue)
        {
            Rating = rating;
        }
    }

    public void SetStatus(string status)
    {
        var normalized = string.IsNullOrWhiteSpace(status)
            ? "approved"
            : status.Trim().ToLowerInvariant();

        Status = normalized switch
        {
            "pending" => "pending",
            "suspended" => "suspended",
            _ => "approved",
        };
        IsActive = Status == "approved";
    }
}
