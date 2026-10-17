namespace MixPlus.BuildingBlocks.Application.Contracts;

public sealed record AmazingOfferNominateCommand(
    string ProductExternalKey,
    Guid SellerId,
    string SellerExternalKey,
    int DiscountPercent,
    decimal SalePrice,
    decimal? ListPrice,
    bool ProductPublished,
    bool ProductInStock,
    decimal? ProductRating,
    int ProductReviewCount,
    DateTime? StartsAtUtc = null,
    DateTime? EndsAtUtc = null);

public sealed record AmazingOfferNominationDto(
    string ProductExternalKey,
    string Status,
    string? Reason,
    int DiscountPercent,
    bool InCampaign,
    DateTime NominatedAtUtc,
    DateTime? StartsAtUtc,
    DateTime? EndsAtUtc);

/// <summary>
/// Seller nominations + marketplace qualification for amazing-offers.
/// Implemented by Promotions; called from Catalog seller portal.
/// </summary>
public interface IAmazingOfferNominationPort
{
    Task<AmazingOfferNominationDto?> GetAsync(
        string productExternalKey,
        Guid sellerId,
        CancellationToken cancellationToken = default);

    Task<AmazingOfferNominationDto> NominateAsync(
        AmazingOfferNominateCommand command,
        CancellationToken cancellationToken = default);

    Task WithdrawAsync(
        string productExternalKey,
        Guid sellerId,
        CancellationToken cancellationToken = default);

    /// <summary>Rebuilds the amazing-offers campaign product keys from qualified nominations.</summary>
    Task<IReadOnlyList<string>> RebuildCampaignAsync(CancellationToken cancellationToken = default);
}
