using System.Security.Cryptography;
using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Identity.Domain;

public sealed class UserSession : AggregateRoot
{
    public static readonly TimeSpan DefaultTtl = TimeSpan.FromDays(14);

    private UserSession()
    {
    }

    public Guid UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime? RevokedAtUtc { get; private set; }

    public bool IsActive(DateTime utcNow) =>
        RevokedAtUtc is null && utcNow < ExpiresAtUtc;

    public static UserSession Create(Guid userId, DateTime utcNow, TimeSpan? ttl = null)
    {
        return new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)),
            CreatedAtUtc = utcNow,
            ExpiresAtUtc = utcNow.Add(ttl ?? DefaultTtl),
        };
    }

    public void Revoke(DateTime utcNow)
    {
        RevokedAtUtc = utcNow;
    }
}
