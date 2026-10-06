using Microsoft.Extensions.Logging;
using MixPlus.Modules.Identity.Application.Abstractions;

namespace MixPlus.Modules.Identity.Infrastructure.Messaging;

/// <summary>
/// Dev/mock SMS — logs the OTP instead of calling a gateway.
/// </summary>
public sealed class MockSmsSender(ILogger<MockSmsSender> logger) : ISmsSender
{
    public Task SendOtpAsync(string phone, string code, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[MockSMS] OTP to={Phone} code={Code}", phone, code);
        return Task.CompletedTask;
    }
}

public sealed class MockEmailSender(ILogger<MockEmailSender> logger) : IEmailSender
{
    public Task SendAsync(
        string email,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[MockEmail] to={Email} subject={Subject} body={Body}",
            email,
            subject,
            body);
        return Task.CompletedTask;
    }
}
