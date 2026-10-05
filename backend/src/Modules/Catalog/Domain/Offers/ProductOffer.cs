using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Offers;

/// <summary>
/// Marketplace offer: one seller selling a catalog product (#39).
/// </summary>
public sealed class ProductOffer : AggregateRoot
{
    private ProductOffer()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public Guid ProductId { get; private set; }
    public string ProductSlug { get; private set; } = string.Empty;
    public string SellerExternalKey { get; private set; } = string.Empty;
    public string SellerName { get; private set; } = string.Empty;
    public bool IsOfficial { get; private set; }
    public string PerformanceLabel { get; private set; } = string.Empty;
    public string DeliveryLabel { get; private set; } = string.Empty;
    public string Warranty { get; private set; } = string.Empty;
    public Money Price { get; private set; } = Money.Create(0);
    public Money? OriginalPrice { get; private set; }
    public int? DiscountPercent { get; private set; }
    public string? MemberSinceLabel { get; private set; }
    public decimal? OnTimeSupplyPercent { get; private set; }
    public decimal? ShipCommitmentPercent { get; private set; }
    public decimal? NoReturnPercent { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    public static ProductOffer Create(
        string externalKey,
        Guid productId,
        string productSlug,
        string sellerExternalKey,
        string sellerName,
        Money price,
        bool isOfficial = false,
        string performanceLabel = "عالی",
        string deliveryLabel = "",
        string warranty = "",
        Money? originalPrice = null,
        int? discountPercent = null,
        int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(productSlug);
        ArgumentException.ThrowIfNullOrWhiteSpace(sellerExternalKey);

        return new ProductOffer
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            ProductId = productId,
            ProductSlug = productSlug.Trim().ToLowerInvariant(),
            SellerExternalKey = sellerExternalKey.Trim(),
            SellerName = sellerName.Trim(),
            IsOfficial = isOfficial,
            PerformanceLabel = string.IsNullOrWhiteSpace(performanceLabel) ? "عالی" : performanceLabel.Trim(),
            DeliveryLabel = deliveryLabel?.Trim() ?? string.Empty,
            Warranty = warranty?.Trim() ?? string.Empty,
            Price = price,
            OriginalPrice = originalPrice,
            DiscountPercent = discountPercent,
            IsActive = true,
            SortOrder = sortOrder,
        };
    }

    public void SetStats(
        string? memberSinceLabel,
        decimal? onTimeSupplyPercent,
        decimal? shipCommitmentPercent,
        decimal? noReturnPercent)
    {
        MemberSinceLabel = memberSinceLabel;
        OnTimeSupplyPercent = onTimeSupplyPercent;
        ShipCommitmentPercent = shipCommitmentPercent;
        NoReturnPercent = noReturnPercent;
    }

    public void SetActive(bool active) => IsActive = active;
}
