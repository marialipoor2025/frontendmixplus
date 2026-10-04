namespace MixPlus.Modules.Identity.Application.Abstractions;

/// <summary>
/// Outbound SMS port. Swap Mock → real provider via <c>Sms:Provider</c> config.
/// </summary>
public interface ISmsSender
{
    Task SendAsync(string phone, string message, CancellationToken cancellationToken = default);
}

/// <summary>
/// Outbound email OTP port (mockable the same way as SMS).
/// </summary>
public interface IEmailSender
{
    Task SendAsync(string email, string subject, string body, CancellationToken cancellationToken = default);
}
