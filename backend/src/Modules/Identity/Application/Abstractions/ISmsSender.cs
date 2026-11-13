namespace MixPlus.Modules.Identity.Application.Abstractions;

/// <summary>
/// Outbound SMS port. <c>Sms:Provider</c>: Melipayamak (default, falls back to sms.ir), SmsIr, or Mock.
/// </summary>
public interface ISmsSender
{
    /// <summary>
    /// Provider-native OTP delivery (verify template or OTP SMS API).
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
