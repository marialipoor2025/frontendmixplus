using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Identity.Domain;

public sealed class User : AggregateRoot
{
    private User()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? LastLoginAtUtc { get; private set; }

    public static User CreatePhone(string normalizedPhone)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(normalizedPhone);

        return new User
        {
            Id = StableGuid.From($"user:phone:{normalizedPhone}"),
            ExternalKey = normalizedPhone,
            Phone = normalizedPhone,
            DisplayName = MaskPhone(normalizedPhone),
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    public static User CreateEmail(string normalizedEmail)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(normalizedEmail);

        return new User
        {
            Id = StableGuid.From($"user:email:{normalizedEmail}"),
            ExternalKey = normalizedEmail,
            Email = normalizedEmail,
            DisplayName = normalizedEmail,
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    public void MarkLoggedIn()
    {
        LastLoginAtUtc = DateTime.UtcNow;
    }

    private static string MaskPhone(string phone)
    {
        if (phone.Length < 7)
        {
            return phone;
        }

        return string.Concat(phone.AsSpan(0, 4), "***", phone.AsSpan(phone.Length - 3));
    }
}
