using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Promotions.Domain;

public enum OfferNominationStatus
{
    Pending = 0,
    Qualified = 1,
    Rejected = 2,
    Withdrawn = 3,
}

/// <summary>
/// Seller nomination for the amazing-offers (شگفت‌انگیز) campaign.
/// Snapshot fields are denormalized at nominate/refresh time for qualification without Catalog coupling.
/// </summary>
public sealed class OfferNomination : AggregateRoot
{
    public const string AmazingCampaignKey = "amazing-offers";
    public const int MinDiscountPercent = 10;
    public const int MaxPerSeller = 5;
    public const int MaxCampaignSlots = 48;

    private OfferNomination()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string ProductExternalKey { get; private set; } = string.Empty;
    public Guid SellerId { get; private set; }
    public string SellerExternalKey { get; private set; } = string.Empty;
    public OfferNominationStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime NominatedAtUtc { get; private set; }
    public DateTime? StartsAtUtc { get; private set; }
    public DateTime? EndsAtUtc { get; private set; }
    public int DiscountPercent { get; private set; }
    public decimal SalePrice { get; private set; }
    public decimal? ListPrice { get; private set; }
    public bool ProductPublished { get; private set; }
    public bool ProductInStock { get; private set; }
    public decimal? ProductRating { get; private set; }
    public int ProductReviewCount { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    public static OfferNomination Create(
        string productExternalKey,
        Guid sellerId,
        string sellerExternalKey,
        int discountPercent,
        decimal salePrice,
        decimal? listPrice,
        bool productPublished,
        bool productInStock,
        decimal? productRating,
        int productReviewCount,
        DateTime? startsAtUtc = null,
        DateTime? endsAtUtc = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(productExternalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(sellerExternalKey);

        var key = $"nom-{productExternalKey.Trim()}";
        var utcNow = DateTime.UtcNow;
        var nomination = new OfferNomination
        {
            Id = StableGuid.From(key),
            ExternalKey = key.Length > 100 ? key[..100] : key,
            ProductExternalKey = productExternalKey.Trim(),
            SellerId = sellerId,
            SellerExternalKey = sellerExternalKey.Trim(),
            Status = OfferNominationStatus.Pending,
            NominatedAtUtc = utcNow,
            StartsAtUtc = startsAtUtc,
            EndsAtUtc = endsAtUtc,
            DiscountPercent = Math.Clamp(discountPercent, 0, 99),
            SalePrice = salePrice,
            ListPrice = listPrice,
            ProductPublished = productPublished,
            ProductInStock = productInStock,
            ProductRating = productRating,
            ProductReviewCount = Math.Max(0, productReviewCount),
            UpdatedAtUtc = utcNow,
        };

        nomination.ApplyAutoQualification(utcNow);
        return nomination;
    }

    public void RefreshSnapshot(
        int discountPercent,
        decimal salePrice,
        decimal? listPrice,
        bool productPublished,
        bool productInStock,
        decimal? productRating,
        int productReviewCount,
        DateTime? startsAtUtc,
        DateTime? endsAtUtc)
    {
        DiscountPercent = Math.Clamp(discountPercent, 0, 99);
        SalePrice = salePrice;
        ListPrice = listPrice;
        ProductPublished = productPublished;
        ProductInStock = productInStock;
        ProductRating = productRating;
        ProductReviewCount = Math.Max(0, productReviewCount);
        StartsAtUtc = startsAtUtc;
        EndsAtUtc = endsAtUtc;
        UpdatedAtUtc = DateTime.UtcNow;

        if (Status is OfferNominationStatus.Withdrawn or OfferNominationStatus.Rejected)
        {
            Status = OfferNominationStatus.Pending;
            RejectionReason = null;
        }

        ApplyAutoQualification(DateTime.UtcNow);
    }

    public void Withdraw()
    {
        Status = OfferNominationStatus.Withdrawn;
        RejectionReason = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        Status = OfferNominationStatus.Rejected;
        RejectionReason = string.IsNullOrWhiteSpace(reason) ? "رد شده توسط ادمین" : reason.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ForceQualify()
    {
        Status = OfferNominationStatus.Qualified;
        RejectionReason = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public bool IsWindowActive(DateTime utcNow)
    {
        if (StartsAtUtc is { } start && start > utcNow) return false;
        if (EndsAtUtc is { } end && end < utcNow) return false;
        return true;
    }

    public bool MeetsHardRules(DateTime utcNow)
    {
        if (!ProductPublished || !ProductInStock) return false;
        if (DiscountPercent < MinDiscountPercent) return false;
        if (ListPrice is null || ListPrice <= SalePrice || SalePrice <= 0) return false;
        if (!IsWindowActive(utcNow)) return false;
        // New listings (no reviews yet) are allowed; otherwise keep a soft quality floor.
        if (ProductReviewCount > 0 && ProductRating is { } rating && rating < 3.0m) return false;
        return true;
    }

    /// <summary>Higher score wins a limited campaign slot (Digikala-style ranking).</summary>
    public decimal QualificationScore()
    {
        var ratingBoost = ProductRating ?? 3.5m;
        var reviewBoost = Math.Min(ProductReviewCount, 200) / 200m;
        return DiscountPercent + (ratingBoost * 2m) + (reviewBoost * 5m);
    }

    private void ApplyAutoQualification(DateTime utcNow)
    {
        if (Status is OfferNominationStatus.Withdrawn or OfferNominationStatus.Rejected)
        {
            return;
        }

        if (MeetsHardRules(utcNow))
        {
            Status = OfferNominationStatus.Qualified;
            RejectionReason = null;
            return;
        }

        Status = OfferNominationStatus.Pending;
        RejectionReason = DescribeFailure(utcNow);
    }

    private string DescribeFailure(DateTime utcNow)
    {
        if (!ProductPublished) return "محصول باید منتشر شده باشد";
        if (!ProductInStock) return "محصول باید موجود باشد";
        if (DiscountPercent < MinDiscountPercent)
            return $"حداقل تخفیف شگفت‌انگیز {MinDiscountPercent}٪ است";
        if (ListPrice is null || ListPrice <= SalePrice || SalePrice <= 0)
            return "قیمت اصلی و قیمت فروش معتبر با تخفیف لازم است";
        if (!IsWindowActive(utcNow)) return "بازه زمانی پیشنهاد فعال نیست";
        if (ProductReviewCount > 0 && ProductRating is { } rating && rating < 3.0m)
            return "امتیاز محصول برای نمایش در شگفت‌انگیز کافی نیست";
        return "در صف بررسی صلاحیت";
    }
}
