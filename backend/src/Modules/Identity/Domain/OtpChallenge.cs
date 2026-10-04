using System.Security.Cryptography;
using System.Text;
using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Identity.Domain;

public enum OtpDestinationKind
{
    Phone = 0,
    Email = 1,
}

public sealed class OtpChallenge : AggregateRoot
{
    public const int CodeLength = 6;
    public const int MaxAttempts = 5;
    public static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(2);
    public static readonly TimeSpan ResendCooldown = TimeSpan.FromSeconds(60);

    private OtpChallenge()
    {
    }

    public string Destination { get; private set; } = string.Empty;
    public OtpDestinationKind Kind { get; private set; }
    public string CodeHash { get; private set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? ConsumedAtUtc { get; private set; }
    public int AttemptCount { get; private set; }
    public DateTime? LastSentAtUtc { get; private set; }

    public bool IsExpired(DateTime utcNow) => utcNow >= ExpiresAtUtc;
    public bool IsConsumed => ConsumedAtUtc is not null;
    public bool CanResend(DateTime utcNow) =>
        LastSentAtUtc is null || utcNow - LastSentAtUtc >= ResendCooldown;

    public static (OtpChallenge Challenge, string PlainCode) Create(
        string destination,
        OtpDestinationKind kind,
        string plainCode,
        DateTime utcNow,
        TimeSpan? ttl = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(destination);
        ArgumentException.ThrowIfNullOrWhiteSpace(plainCode);

        var challenge = new OtpChallenge
        {
            Id = Guid.NewGuid(),
            Destination = destination.Trim(),
            Kind = kind,
            CodeHash = HashCode(plainCode),
            CreatedAtUtc = utcNow,
            ExpiresAtUtc = utcNow.Add(ttl ?? DefaultTtl),
            LastSentAtUtc = utcNow,
            AttemptCount = 0,
        };

        return (challenge, plainCode);
    }

    public void RotateCode(string plainCode, DateTime utcNow, TimeSpan? ttl = null)
    {
        CodeHash = HashCode(plainCode);
        ExpiresAtUtc = utcNow.Add(ttl ?? DefaultTtl);
        LastSentAtUtc = utcNow;
        AttemptCount = 0;
        ConsumedAtUtc = null;
    }

    public bool TryVerify(string plainCode, DateTime utcNow, out string? error)
    {
        error = null;

        if (IsConsumed)
        {
            error = "این کد قبلاً استفاده شده است.";
            return false;
        }

        if (IsExpired(utcNow))
        {
            error = "کد منقضی شده است. دوباره درخواست دهید.";
            return false;
        }

        if (AttemptCount >= MaxAttempts)
        {
            error = "تعداد تلاش بیش از حد مجاز است.";
            return false;
        }

        AttemptCount++;

        if (!FixedTimeEquals(CodeHash, HashCode(plainCode)))
        {
            error = "کد وارد شده صحیح نیست.";
            return false;
        }

        ConsumedAtUtc = utcNow;
        return true;
    }

    public static string GenerateNumericCode(int length = CodeLength)
    {
        Span<byte> bytes = stackalloc byte[length];
        RandomNumberGenerator.Fill(bytes);
        var chars = new char[length];
        for (var i = 0; i < length; i++)
        {
            chars[i] = (char)('0' + (bytes[i] % 10));
        }

        return new string(chars);
    }

    public static string HashCode(string plainCode)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes("mixplus-otp:" + plainCode.Trim()));
        return Convert.ToHexString(hash);
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        var a = Encoding.UTF8.GetBytes(left);
        var b = Encoding.UTF8.GetBytes(right);
        return CryptographicOperations.FixedTimeEquals(a, b);
    }
}
