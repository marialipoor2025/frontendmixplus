using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Promotions.Domain;

/// <summary>
/// Discount coupon for checkout / campaigns.
/// </summary>
public sealed class Coupon : AggregateRoot
{
    private Coupon()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string DiscountLabel { get; private set; } = string.Empty;
    public int UsageCount { get; private set; }
    public int UsageLimit { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static Coupon Create(
        string externalKey,
        string code,
        string discountLabel,
        int usageLimit,
        bool isActive = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);

        return new Coupon
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Code = code.Trim().ToUpperInvariant(),
            DiscountLabel = discountLabel.Trim(),
            UsageCount = 0,
            UsageLimit = Math.Max(0, usageLimit),
            IsActive = isActive,
        };
    }

    public void Update(string code, string discountLabel, int usageLimit, bool isActive)
    {
        Code = code.Trim().ToUpperInvariant();
        DiscountLabel = discountLabel.Trim();
        UsageLimit = Math.Max(0, usageLimit);
        IsActive = isActive;
    }
}
