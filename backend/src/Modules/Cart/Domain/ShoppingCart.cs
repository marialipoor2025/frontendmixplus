using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class ShoppingCart : AggregateRoot
{
    private readonly List<CartLine> _lines = [];

    private ShoppingCart()
    {
    }

    public Guid UserId { get; private set; }
    public string? CouponCode { get; private set; }
    public string? GiftCardCode { get; private set; }
    public decimal WalletAmountApplied { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }
    public IReadOnlyCollection<CartLine> Lines => _lines.AsReadOnly();

    public static ShoppingCart Create(Guid userId)
    {
        return new ShoppingCart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            UpdatedAtUtc = DateTime.UtcNow,
        };
    }

    public CartLine AddOrIncrement(CartLine draft)
    {
        var existing = _lines.FirstOrDefault(x =>
            x.ProductSlug == draft.ProductSlug
            && x.OfferExternalKey == draft.OfferExternalKey
            && x.SkuExternalKey == draft.SkuExternalKey);

        if (existing is not null)
        {
            existing.SetQuantity(existing.Quantity + draft.Quantity);
            Touch();
            return existing;
        }

        _lines.Add(draft);
        Touch();
        return draft;
    }

    public CartLine? FindLine(Guid lineId) => _lines.FirstOrDefault(x => x.Id == lineId);

    public bool RemoveLine(Guid lineId)
    {
        var line = FindLine(lineId);
        if (line is null) return false;
        _lines.Remove(line);
        Touch();
        return true;
    }

    public void SetCoupon(string? code)
    {
        CouponCode = string.IsNullOrWhiteSpace(code) ? null : code.Trim().ToUpperInvariant();
        Touch();
    }

    public void SetGiftCard(string? code)
    {
        GiftCardCode = string.IsNullOrWhiteSpace(code) ? null : code.Trim().ToUpperInvariant();
        Touch();
    }

    public void SetWalletAmount(decimal amount)
    {
        WalletAmountApplied = Math.Max(0, amount);
        Touch();
    }

    public void Touch() => UpdatedAtUtc = DateTime.UtcNow;

    internal void AttachLine(CartLine line) => _lines.Add(line);
}
