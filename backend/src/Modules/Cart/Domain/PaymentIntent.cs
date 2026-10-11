using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class PaymentIntent : AggregateRoot
{
    private PaymentIntent()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public Guid? OrderId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "IRT";
    /// <summary>pending | paid | failed | cancelled</summary>
    public string Status { get; private set; } = "pending";
    public string Gateway { get; private set; } = "mixpay-mock";
    public string? FailureReason { get; private set; }
    public string CheckoutPayloadJson { get; private set; } = "{}";
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }

    public static PaymentIntent Create(
        Guid userId,
        decimal amount,
        string checkoutPayloadJson)
    {
        var key = $"pay-{Guid.NewGuid():N}"[..20];
        return new PaymentIntent
        {
            Id = Guid.NewGuid(),
            ExternalKey = key,
            UserId = userId,
            Amount = Math.Max(0, amount),
            Currency = "IRT",
            Status = "pending",
            Gateway = "mixpay-mock",
            CheckoutPayloadJson = checkoutPayloadJson,
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    public void MarkPaid(Guid orderId)
    {
        Status = "paid";
        OrderId = orderId;
        CompletedAtUtc = DateTime.UtcNow;
        FailureReason = null;
    }

    public void MarkFailed(string reason)
    {
        Status = "failed";
        FailureReason = reason;
        CompletedAtUtc = DateTime.UtcNow;
    }

    public void ResetForRetry()
    {
        Status = "pending";
        FailureReason = null;
        CompletedAtUtc = null;
        OrderId = null;
    }
}
