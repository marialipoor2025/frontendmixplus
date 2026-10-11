namespace MixPlus.BuildingBlocks.Application.Contracts;

public sealed record CouponQuoteModel(
    string Code,
    string DiscountLabel,
    /// <summary>Fixed-amount discount in IRT when parsable; otherwise 0 and label-only.</summary>
    decimal DiscountAmount,
    bool IsValid,
    string? Error);

/// <summary>Promotions implements; Cart/Checkout validates codes without referencing Promotions.</summary>
public interface ICouponValidationPort
{
    Task<CouponQuoteModel> ValidateAsync(string code, decimal subtotal, CancellationToken cancellationToken = default);

    Task IncrementUsageAsync(string code, CancellationToken cancellationToken = default);
}
