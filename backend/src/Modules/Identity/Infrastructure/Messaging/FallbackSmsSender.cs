using Microsoft.Extensions.Logging;
using MixPlus.Modules.Identity.Application.Abstractions;

namespace MixPlus.Modules.Identity.Infrastructure.Messaging;

/// <summary>
/// Tries Melipayamak first, then sms.ir. If both fail, directs the shopper to password login.
/// </summary>
public sealed class FallbackSmsSender(
    MelipayamakSmsSender primary,
    SmsIrSmsSender? secondary,
    ILogger<FallbackSmsSender> logger) : ISmsSender
{
    public const string BothProvidersFailedMessage =
        "ارسال پیامک یک‌بارمصرف فعلاً در دسترس نیست. لطفاً با رمز عبور وارد شوید.";

    public async Task SendOtpAsync(
        string phone,
        string code,
        CancellationToken cancellationToken = default)
    {
        Exception? primaryError = null;
        try
        {
            await primary.SendOtpAsync(phone, code, cancellationToken);
            return;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            primaryError = ex;
            logger.LogWarning(
                ex,
                "Melipayamak OTP failed for {Phone}; trying sms.ir fallback",
                phone);
        }

        if (secondary is null)
        {
            logger.LogError(primaryError, "No sms.ir fallback configured after Melipayamak failure");
            throw new InvalidOperationException(BothProvidersFailedMessage);
        }

        try
        {
            await secondary.SendOtpAsync(phone, code, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(
                ex,
                "sms.ir OTP fallback also failed for {Phone} (Melipayamak: {PrimaryError})",
                phone,
                primaryError?.Message);
            throw new InvalidOperationException(BothProvidersFailedMessage);
        }
    }
}
