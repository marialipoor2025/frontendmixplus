using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class WalletAccount : AggregateRoot
{
    private WalletAccount()
    {
    }

    public Guid UserId { get; private set; }
    public decimal Balance { get; private set; }
    public string Currency { get; private set; } = "IRT";

    public static WalletAccount Create(Guid userId, decimal openingBalance = 0)
    {
        return new WalletAccount
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Balance = Math.Max(0, openingBalance),
            Currency = "IRT",
        };
    }

    public void Credit(decimal amount) => Balance = Math.Max(0, Balance + Math.Max(0, amount));

    public bool TryDebit(decimal amount)
    {
        if (amount <= 0) return true;
        if (Balance < amount) return false;
        Balance -= amount;
        return true;
    }
}
