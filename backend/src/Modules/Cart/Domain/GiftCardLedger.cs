using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class GiftCardLedger : AggregateRoot
{
    private GiftCardLedger()
    {
    }

    public string Code { get; private set; } = string.Empty;
    public decimal Balance { get; private set; }
    public Guid? RedeemedByUserId { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    /// <summary>active | used | expired</summary>
    public string Status { get; private set; } = "active";

    public static GiftCardLedger Issue(string code, decimal balance, DateTime expiresAtUtc)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        return new GiftCardLedger
        {
            Id = StableGuid.From($"gift-{code.Trim().ToUpperInvariant()}"),
            Code = code.Trim().ToUpperInvariant(),
            Balance = Math.Max(0, balance),
            ExpiresAtUtc = expiresAtUtc,
            Status = "active",
        };
    }

    public bool IsUsable(DateTime utcNow) =>
        Status == "active" && Balance > 0 && ExpiresAtUtc > utcNow;

    public void AssignTo(Guid userId) => RedeemedByUserId ??= userId;

    public decimal Redeem(decimal amount)
    {
        if (amount <= 0 || Balance <= 0) return 0;
        var take = Math.Min(Balance, amount);
        Balance -= take;
        if (Balance <= 0)
        {
            Balance = 0;
            Status = "used";
        }

        return take;
    }

    public void ExpireIfNeeded(DateTime utcNow)
    {
        if (ExpiresAtUtc <= utcNow && Status == "active")
        {
            Status = "expired";
        }
    }
}
