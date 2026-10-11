using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class ShopOrder : AggregateRoot
{
    private readonly List<OrderLine> _lines = [];

    private ShopOrder()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public Guid? UserId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public decimal SubtotalAmount { get; private set; }
    public decimal ShippingAmount { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal GiftCardAmount { get; private set; }
    public decimal WalletAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "IRT";
    /// <summary>new | awaiting_payment | paid | processing | shipped | delivered | cancelled</summary>
    public string Status { get; private set; } = "new";
    public string? CouponCode { get; private set; }
    public string ShippingMethod { get; private set; } = string.Empty;
    public string ShippingLabel { get; private set; } = string.Empty;
    public string? PickupBranchId { get; private set; }
    public string? PickupBranchLabel { get; private set; }
    public string AddressSnapshotJson { get; private set; } = "{}";
    public string PaymentMethod { get; private set; } = "gateway";
    public Guid? PaymentIntentId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    public static ShopOrder Create(
        string externalKey,
        string customerName,
        decimal totalAmount,
        string status = "new")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);

        return new ShopOrder
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            CustomerName = customerName.Trim(),
            TotalAmount = Math.Max(0, totalAmount),
            SubtotalAmount = Math.Max(0, totalAmount),
            Status = NormalizeStatus(status),
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    public static ShopOrder CreateCheckout(
        Guid userId,
        string customerName,
        IEnumerable<OrderLine> lines,
        decimal subtotal,
        decimal shipping,
        decimal discount,
        decimal giftCard,
        decimal wallet,
        decimal total,
        string? couponCode,
        string shippingMethod,
        string shippingLabel,
        string? pickupBranchId,
        string? pickupBranchLabel,
        string addressSnapshotJson,
        string paymentMethod,
        Guid paymentIntentId)
    {
        var key = $"MP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}";
        var order = new ShopOrder
        {
            Id = Guid.NewGuid(),
            ExternalKey = key,
            UserId = userId,
            CustomerName = customerName.Trim(),
            SubtotalAmount = Math.Max(0, subtotal),
            ShippingAmount = Math.Max(0, shipping),
            DiscountAmount = Math.Max(0, discount),
            GiftCardAmount = Math.Max(0, giftCard),
            WalletAmount = Math.Max(0, wallet),
            TotalAmount = Math.Max(0, total),
            Currency = "IRT",
            Status = "paid",
            CouponCode = couponCode,
            ShippingMethod = shippingMethod,
            ShippingLabel = shippingLabel,
            PickupBranchId = pickupBranchId,
            PickupBranchLabel = pickupBranchLabel,
            AddressSnapshotJson = addressSnapshotJson,
            PaymentMethod = paymentMethod,
            PaymentIntentId = paymentIntentId,
            CreatedAtUtc = DateTime.UtcNow,
        };

        foreach (var line in lines)
        {
            order._lines.Add(line);
        }

        return order;
    }

    public void SetStatus(string status) => Status = NormalizeStatus(status);

    private static string NormalizeStatus(string status) =>
        status.Trim().ToLowerInvariant() switch
        {
            "awaiting_payment" => "awaiting_payment",
            "paid" => "paid",
            "processing" => "processing",
            "shipped" => "shipped",
            "delivered" => "delivered",
            "cancelled" => "cancelled",
            _ => "new",
        };

    internal void AttachLine(OrderLine line) => _lines.Add(line);
}
