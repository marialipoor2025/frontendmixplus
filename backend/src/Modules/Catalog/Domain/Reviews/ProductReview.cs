using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Reviews;

public sealed class ProductReview : AggregateRoot
{
    private ProductReview()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string ProductSlug { get; private set; } = string.Empty;
    public string ProductTitle { get; private set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public bool IsAnonymous { get; private set; }
    public int Rating { get; private set; }
    public string Excerpt { get; private set; } = string.Empty;
    /// <summary>pending | approved | rejected</summary>
    public string Status { get; private set; } = "pending";
    public DateTime CreatedAtUtc { get; private set; }

    public static ProductReview Create(
        string externalKey,
        string productSlug,
        string productTitle,
        string customerName,
        int rating,
        string excerpt,
        bool isAnonymous = false)
    {
        return new ProductReview
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            ProductSlug = productSlug.Trim().ToLowerInvariant(),
            ProductTitle = productTitle.Trim(),
            CustomerName = customerName.Trim(),
            IsAnonymous = isAnonymous,
            Rating = Math.Clamp(rating, 1, 5),
            Excerpt = excerpt.Trim(),
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    public void SetStatus(string status)
    {
        Status = status.Trim().ToLowerInvariant() switch
        {
            "approved" => "approved",
            "rejected" => "rejected",
            _ => "pending",
        };
    }
}
