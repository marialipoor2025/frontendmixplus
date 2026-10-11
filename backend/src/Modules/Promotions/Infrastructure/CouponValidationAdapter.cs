using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Modules.Promotions.Infrastructure;

public sealed class CouponValidationAdapter(PromotionsDbContext db) : ICouponValidationPort
{
    private static readonly Regex AmountRe = new(
        @"(\d[\d,\.]*)",
        RegexOptions.Compiled);

    public async Task<CouponQuoteModel> ValidateAsync(
        string code,
        decimal subtotal,
        CancellationToken cancellationToken = default)
    {
        var normalized = (code ?? string.Empty).Trim().ToUpperInvariant();
        if (normalized.Length == 0)
        {
            return new CouponQuoteModel("", "", 0, false, "کد تخفیف خالی است");
        }

        var coupon = await db.Coupons.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == normalized, cancellationToken);

        if (coupon is null)
        {
            return new CouponQuoteModel(normalized, "", 0, false, "کد تخفیف معتبر نیست");
        }

        if (!coupon.IsActive)
        {
            return new CouponQuoteModel(normalized, coupon.DiscountLabel, 0, false, "کد تخفیف غیرفعال است");
        }

        if (coupon.UsageLimit > 0 && coupon.UsageCount >= coupon.UsageLimit)
        {
            return new CouponQuoteModel(normalized, coupon.DiscountLabel, 0, false, "سقف استفاده از کد تکمیل شده");
        }

        var amount = ParseDiscountAmount(coupon.DiscountLabel, subtotal);
        if (amount <= 0 && coupon.DiscountLabel.Contains('%'))
        {
            // percent already handled inside ParseDiscountAmount
        }

        amount = Math.Clamp(amount, 0, Math.Max(0, subtotal));
        return new CouponQuoteModel(normalized, coupon.DiscountLabel, amount, true, null);
    }

    public async Task IncrementUsageAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = (code ?? string.Empty).Trim().ToUpperInvariant();
        var coupon = await db.Coupons
            .FirstOrDefaultAsync(x => x.Code == normalized, cancellationToken);
        if (coupon is null) return;
        if (coupon.TryIncrementUsage())
        {
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static decimal ParseDiscountAmount(string label, decimal subtotal)
    {
        if (string.IsNullOrWhiteSpace(label)) return 0;
        var match = AmountRe.Match(label);
        if (!match.Success) return 0;

        var raw = match.Groups[1].Value.Replace(",", "");
        if (!decimal.TryParse(raw, NumberStyles.Number, CultureInfo.InvariantCulture, out var value))
        {
            return 0;
        }

        if (label.Contains('%') || label.Contains("درصد"))
        {
            return Math.Round(subtotal * (value / 100m), 0, MidpointRounding.AwayFromZero);
        }

        // Treat large numbers as toman/IRT amounts.
        return value;
    }
}