using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class ShopOrder : AggregateRoot
{
    private ShopOrder()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public decimal TotalAmount { get; private set; }
    /// <summary>new | processing | shipped | delivered | cancelled</summary>
    public string Status { get; private set; } = "new";
    public DateTime CreatedAtUtc { get; private set; }

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
            Status = NormalizeStatus(status),
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    public void SetStatus(string status) => Status = NormalizeStatus(status);

    private static string NormalizeStatus(string status) =>
        status.Trim().ToLowerInvariant() switch
        {
            "processing" => "processing",
            "shipped" => "shipped",
            "delivered" => "delivered",
            "cancelled" => "cancelled",
            _ => "new",
        };
}
