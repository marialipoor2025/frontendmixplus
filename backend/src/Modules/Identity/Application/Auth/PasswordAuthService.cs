using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Identity.Domain;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Application.Auth;

public interface IPasswordAuthService
{
    Task<Result<VerifyOtpResponse>> LoginAsync(
        PasswordLoginRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<StartOtpResponse>> StartForgotAsync(
        StartOtpRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<VerifyOtpResponse>> ConfirmForgotAsync(
        ConfirmForgotPasswordRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> SetPasswordAsync(
        string? accessToken,
        SetPasswordRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class PasswordAuthService(
    IdentityDbContext db,
    IOtpAuthService otp,
    ILogger<PasswordAuthService> logger) : IPasswordAuthService
{
    private static readonly PasswordHasher<User> Hasher = new();

    public async Task<Result<VerifyOtpResponse>> LoginAsync(
        PasswordLoginRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!UsernameNormalizer.TryNormalize(request.Username, out var destination, out _, out var error))
        {
            return Result.Failure<VerifyOtpResponse>(error!);
        }

        var password = request.Password ?? string.Empty;
        if (password.Length < 6)
        {
            return Result.Failure<VerifyOtpResponse>("رمز عبور باید حداقل ۶ کاراکتر باشد.");
        }

        var user = await db.Users.FirstOrDefaultAsync(x => x.ExternalKey == destination, cancellationToken);
        if (user is null || user.IsBlocked || !user.HasPassword)
        {
            return Result.Failure<VerifyOtpResponse>("نام کاربری یا رمز عبور نادرست است.");
        }

        var verify = Hasher.VerifyHashedPassword(user, user.PasswordHash!, password);
        if (verify == PasswordVerificationResult.Failed)
        {
            return Result.Failure<VerifyOtpResponse>("نام کاربری یا رمز عبور نادرست است.");
        }

        if (verify == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.SetPasswordHash(Hasher.HashPassword(user, password));
        }

        user.MarkLoggedIn();
        var utcNow = DateTime.UtcNow;
        var session = UserSession.Create(user.Id, utcNow);
        db.Sessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User {UserId} logged in via password", user.Id);

        return Result.Success(new VerifyOtpResponse(
            session.Token,
            (int)(session.ExpiresAtUtc - utcNow).TotalSeconds,
            new AuthUserDto(
                user.Id.ToString("D"),
                user.DisplayName,
                user.Phone,
                user.Email)));
    }

    public Task<Result<StartOtpResponse>> StartForgotAsync(
        StartOtpRequest request,
        CancellationToken cancellationToken = default) =>
        otp.StartAsync(request, cancellationToken);

    public async Task<Result<VerifyOtpResponse>> ConfirmForgotAsync(
        ConfirmForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var password = request.NewPassword ?? string.Empty;
        if (password.Length < 6)
        {
            return Result.Failure<VerifyOtpResponse>("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
        }

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
            return Result.Failure<VerifyOtpResponse>("جلسه بازیابی یافت نشد.");
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

        if (user.IsBlocked)
        {
            return Result.Failure<VerifyOtpResponse>("حساب کاربری مسدود است.");
        }

        user.SetPasswordHash(Hasher.HashPassword(user, password));
        user.MarkLoggedIn();
        var session = UserSession.Create(user.Id, utcNow);
        db.Sessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User {UserId} reset password via OTP", user.Id);

        return Result.Success(new VerifyOtpResponse(
            session.Token,
            (int)(session.ExpiresAtUtc - utcNow).TotalSeconds,
            new AuthUserDto(
                user.Id.ToString("D"),
                user.DisplayName,
                user.Phone,
                user.Email)));
    }

    public async Task<Result> SetPasswordAsync(
        string? accessToken,
        SetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return Result.Failure("Unauthorized");
        }

        var password = request.NewPassword ?? string.Empty;
        if (password.Length < 6)
        {
            return Result.Failure("رمز عبور باید حداقل ۶ کاراکتر باشد.");
        }

        var utcNow = DateTime.UtcNow;
        var session = await db.Sessions
            .FirstOrDefaultAsync(x => x.Token == accessToken, cancellationToken);
        if (session is null || !session.IsActive(utcNow))
        {
            return Result.Failure("Unauthorized");
        }

        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == session.UserId, cancellationToken);
        if (user is null || user.IsBlocked)
        {
            return Result.Failure("کاربر یافت نشد.");
        }

        user.SetPasswordHash(Hasher.HashPassword(user, password));
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
