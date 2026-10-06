namespace MixPlus.Modules.Identity.Application.Abstractions;

/// <summary>
/// Outbound SMS port. Swap Mock → Melipayamak via <c>Sms:Provider</c>.
/// </summary>
public interface ISmsSender
{
    /// <summary>
    /// Provider-native OTP delivery (Melipayamak SendOtp template).
    /// </summary>
    Task SendOtpAsync(string phone, string code, CancellationToken cancellationToken = default);
}

/// <summary>
/// Outbound email OTP port (mockable the same way as SMS).
/// </summary>
public interface IEmailSender
{
    Task SendAsync(string email, string subject, string body, CancellationToken cancellationToken = default);
}
