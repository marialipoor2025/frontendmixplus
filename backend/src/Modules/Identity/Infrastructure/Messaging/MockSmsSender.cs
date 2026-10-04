using Microsoft.Extensions.Logging;
using MixPlus.Modules.Identity.Application.Abstractions;

namespace MixPlus.Modules.Identity.Infrastructure.Messaging;

/// <summary>
/// Dev/mock SMS — logs the message instead of calling a gateway.
/// Replace with a real <see cref="ISmsSender"/> when <c>Sms:Provider</c> is not Mock.
/// </summary>
public sealed class MockSmsSender(ILogger<MockSmsSender> logger) : ISmsSender
{
    public Task SendAsync(string phone, string message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[MockSMS] to={Phone} message={Message}",
            phone,
            message);
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
