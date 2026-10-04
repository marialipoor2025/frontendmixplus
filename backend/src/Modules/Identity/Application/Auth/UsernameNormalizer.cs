using System.Text.RegularExpressions;
using MixPlus.Modules.Identity.Domain;

namespace MixPlus.Modules.Identity.Application.Auth;

public static partial class UsernameNormalizer
{
    public static bool TryNormalize(
        string? raw,
        out string destination,
        out OtpDestinationKind kind,
        out string? error)
    {
        destination = string.Empty;
        kind = OtpDestinationKind.Phone;
        error = null;

        if (string.IsNullOrWhiteSpace(raw))
        {
            error = "لطفاً این قسمت را خالی نگذارید";
            return false;
        }

        var value = raw.Trim();

        if (value.Contains('@', StringComparison.Ordinal))
        {
            if (!EmailRegex().IsMatch(value))
            {
                error = "ایمیل وارد شده صحیح نیست";
                return false;
            }

            destination = value.ToLowerInvariant();
            kind = OtpDestinationKind.Email;
            return true;
        }

        var digits = PhoneDigitsRegex().Replace(value, string.Empty);
        if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
        {
            digits = "0" + digits[2..];
        }

        if (!IranMobileRegex().IsMatch(digits))
        {
            error = "شماره موبایل یا ایمیل وارد شده صحیح نیست";
            return false;
        }

        destination = digits;
        kind = OtpDestinationKind.Phone;
        return true;
    }

    public static string Mask(string destination, OtpDestinationKind kind)
    {
        if (kind == OtpDestinationKind.Email)
        {
            var at = destination.IndexOf('@');
            if (at <= 1)
            {
                return destination;
            }

            return string.Concat(destination.AsSpan(0, 1), "***", destination.AsSpan(at));
        }

        if (destination.Length < 7)
        {
            return destination;
        }

        return string.Concat(destination.AsSpan(0, 4), "***", destination.AsSpan(destination.Length - 3));
    }

    [GeneratedRegex(@"\D")]
    private static partial Regex PhoneDigitsRegex();

    [GeneratedRegex(@"^09\d{9}$")]
    private static partial Regex IranMobileRegex();

    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();
}
