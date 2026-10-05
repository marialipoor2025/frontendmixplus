using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Identity.Domain;

/// <summary>
/// Saved product on a customer's wishlist (#54).
/// </summary>
public sealed class WishlistItem : AggregateRoot
{
    private WishlistItem()
    {
    }

    public Guid UserId { get; private set; }
    public string ProductSlug { get; private set; } = string.Empty;
    public string ProductTitle { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public decimal PriceAmount { get; private set; }
    public string PriceCurrency { get; private set; } = "IRT";
    public DateTime CreatedAtUtc { get; private set; }

    public static WishlistItem Create(
        Guid userId,
        string productSlug,
        string productTitle,
        string imageUrl,
        decimal priceAmount,
        string priceCurrency = "IRT")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(productSlug);
        ArgumentException.ThrowIfNullOrWhiteSpace(productTitle);

        var slug = productSlug.Trim().ToLowerInvariant();
        return new WishlistItem
        {
            Id = StableGuid.From($"wishlist:{userId:D}:{slug}"),
            UserId = userId,
            ProductSlug = slug,
            ProductTitle = productTitle.Trim(),
            ImageUrl = imageUrl?.Trim() ?? string.Empty,
            PriceAmount = priceAmount,
            PriceCurrency = string.IsNullOrWhiteSpace(priceCurrency) ? "IRT" : priceCurrency.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
        };
    }
}
