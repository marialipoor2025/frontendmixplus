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
    public bool IsBlocked { get; private set; }

    /// <summary>ASP.NET Core Identity PBKDF2 hash; null when user only uses OTP.</summary>
    public string? PasswordHash { get; private set; }

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
            IsBlocked = false,
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
            IsBlocked = false,
        };
    }

    public void MarkLoggedIn()
    {
        LastLoginAtUtc = DateTime.UtcNow;
    }

    public void SetBlocked(bool blocked) => IsBlocked = blocked;

    public bool HasPassword => !string.IsNullOrEmpty(PasswordHash);

    public void SetPasswordHash(string passwordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        PasswordHash = passwordHash;
    }

    public void ClearPassword() => PasswordHash = null;

    /// <summary>Update display name (UTF-8 Persian OK). Empty/whitespace rejected.</summary>
    public void UpdateDisplayName(string displayName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        var trimmed = displayName.Trim();
        if (trimmed.Length > 200)
        {
            throw new ArgumentException("Display name is too long.", nameof(displayName));
        }

        DisplayName = trimmed;
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
