using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Identity.Application.Abstractions;
using MixPlus.Modules.Identity.Domain;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Application.Auth;

public interface IOtpAuthService
{
    Task<Result<StartOtpResponse>> StartAsync(StartOtpRequest request, CancellationToken cancellationToken = default);
    Task<Result<StartOtpResponse>> ResendAsync(ResendOtpRequest request, CancellationToken cancellationToken = default);
    Task<Result<VerifyOtpResponse>> VerifyAsync(VerifyOtpRequest request, CancellationToken cancellationToken = default);
}

public sealed class OtpAuthService(
    IdentityDbContext db,
    ISmsSender sms,
    IEmailSender email,
    IConfiguration configuration,
    IHostEnvironment environment,
    ILogger<OtpAuthService> logger) : IOtpAuthService
{
    public async Task<Result<StartOtpResponse>> StartAsync(
        StartOtpRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!UsernameNormalizer.TryNormalize(request.Username, out var destination, out var kind, out var error))
        {
            return Result.Failure<StartOtpResponse>(error!);
        }

        var utcNow = DateTime.UtcNow;
        var plainCode = ResolvePlainCode();
        var (challenge, _) = OtpChallenge.Create(destination, kind, plainCode, utcNow);

        db.OtpChallenges.Add(challenge);
        await db.SaveChangesAsync(cancellationToken);

        await DeliverAsync(kind, destination, plainCode, cancellationToken);

        return Result.Success(ToStartResponse(challenge, plainCode, utcNow));
    }

    public async Task<Result<StartOtpResponse>> ResendAsync(
        ResendOtpRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(request.ChallengeId, out var challengeId))
        {
            return Result.Failure<StartOtpResponse>("شناسه چالش نامعتبر است.");
        }

        var challenge = await db.OtpChallenges.FirstOrDefaultAsync(x => x.Id == challengeId, cancellationToken);
        if (challenge is null)
        {
            return Result.Failure<StartOtpResponse>("جلسه ورود یافت نشد.");
        }

        var utcNow = DateTime.UtcNow;
        if (!challenge.CanResend(utcNow))
        {
            var wait = (int)Math.Ceiling(
                (OtpChallenge.ResendCooldown - (utcNow - (challenge.LastSentAtUtc ?? utcNow))).TotalSeconds);
            return Result.Failure<StartOtpResponse>($"لطفاً {Math.Max(wait, 1)} ثانیه دیگر دوباره تلاش کنید.");
        }

        var plainCode = ResolvePlainCode();
        challenge.RotateCode(plainCode, utcNow);
        await db.SaveChangesAsync(cancellationToken);
        await DeliverAsync(challenge.Kind, challenge.Destination, plainCode, cancellationToken);

        return Result.Success(ToStartResponse(challenge, plainCode, utcNow));
    }

    public async Task<Result<VerifyOtpResponse>> VerifyAsync(
        VerifyOtpRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(request.ChallengeId, out var challengeId))
        {
            return Result.Failure<VerifyOtpResponse>("شناسه چالش نامعتبر است.");
        }

        var code = (request.Code ?? string.Empty).Trim();
        if (code.Length != OtpChallenge.CodeLength || !code.All(char.IsDigit))
        {
            return Result.Failure<VerifyOtpResponse>("کد باید ۶ رقم باشد.");
        }

        var challenge = await db.OtpChallenges.FirstOrDefaultAsync(x => x.Id == challengeId, cancellationToken);
        if (challenge is null)
        {
            return Result.Failure<VerifyOtpResponse>("جلسه ورود یافت نشد.");
        }

        var utcNow = DateTime.UtcNow;
        if (!challenge.TryVerify(code, utcNow, out var verifyError))
        {
            await db.SaveChangesAsync(cancellationToken);
            return Result.Failure<VerifyOtpResponse>(verifyError!);
        }

        var user = await db.Users.FirstOrDefaultAsync(
            x => x.ExternalKey == challenge.Destination,
            cancellationToken);

        if (user is null)
        {
            user = challenge.Kind == OtpDestinationKind.Phone
                ? User.CreatePhone(challenge.Destination)
                : User.CreateEmail(challenge.Destination);
            db.Users.Add(user);
        }

        user.MarkLoggedIn();
        var session = UserSession.Create(user.Id, utcNow);
        db.Sessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User {UserId} logged in via OTP ({Kind})", user.Id, challenge.Kind);

        return Result.Success(new VerifyOtpResponse(
            session.Token,
            (int)(session.ExpiresAtUtc - utcNow).TotalSeconds,
            new AuthUserDto(
                user.Id.ToString("D"),
                user.DisplayName,
                user.Phone,
                user.Email)));
    }

    private string ResolvePlainCode()
    {
        var fixedCode = configuration["Sms:MockFixedCode"];
        if (!string.IsNullOrWhiteSpace(fixedCode)
            && string.Equals(configuration["Sms:Provider"], "Mock", StringComparison.OrdinalIgnoreCase))
        {
            return fixedCode.Trim();
        }

        return OtpChallenge.GenerateNumericCode();
    }

    private async Task DeliverAsync(
        OtpDestinationKind kind,
        string destination,
        string plainCode,
        CancellationToken cancellationToken)
    {
        var message = $"کد ورود میکس پلاس: {plainCode}";

        if (kind == OtpDestinationKind.Phone)
        {
            await sms.SendAsync(destination, message, cancellationToken);
            return;
        }

        await email.SendAsync(
            destination,
            "کد ورود میکس پلاس",
            message,
            cancellationToken);
    }

    private StartOtpResponse ToStartResponse(OtpChallenge challenge, string plainCode, DateTime utcNow)
    {
        var includeDevCode =
            environment.IsDevelopment()
            && string.Equals(configuration["Sms:Provider"], "Mock", StringComparison.OrdinalIgnoreCase);

        var resendIn = 0;
        if (challenge.LastSentAtUtc is { } sent)
        {
            var elapsed = utcNow - sent;
            if (elapsed < OtpChallenge.ResendCooldown)
            {
                resendIn = (int)Math.Ceiling((OtpChallenge.ResendCooldown - elapsed).TotalSeconds);
            }
        }

        return new StartOtpResponse(
            challenge.Id.ToString("D"),
            UsernameNormalizer.Mask(challenge.Destination, challenge.Kind),
            (int)Math.Max(0, (challenge.ExpiresAtUtc - utcNow).TotalSeconds),
            resendIn,
            includeDevCode ? plainCode : null);
    }
}
