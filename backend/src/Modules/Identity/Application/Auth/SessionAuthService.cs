using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Application.Auth;

public interface ISessionAuthService
{
    Task<Result<AuthUserDto>> GetMeAsync(string? accessToken, CancellationToken cancellationToken = default);
    Task<Result> LogoutAsync(string? accessToken, CancellationToken cancellationToken = default);
}

public sealed class SessionAuthService(IdentityDbContext db) : ISessionAuthService
{
    public async Task<Result<AuthUserDto>> GetMeAsync(
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return Result.Failure<AuthUserDto>("Missing access token.");
        }

        var utcNow = DateTime.UtcNow;
        var session = await db.Sessions.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Token == accessToken, cancellationToken);

        if (session is null || !session.IsActive(utcNow))
        {
            return Result.Failure<AuthUserDto>("Session expired or invalid.");
        }

        var user = await db.Users.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == session.UserId, cancellationToken);

        if (user is null)
        {
            return Result.Failure<AuthUserDto>("User not found.");
        }

        return Result.Success(new AuthUserDto(
            user.Id.ToString("D"),
            user.DisplayName,
            user.Phone,
            user.Email));
    }

    public async Task<Result> LogoutAsync(
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return Result.Success();
        }

        var session = await db.Sessions
            .FirstOrDefaultAsync(x => x.Token == accessToken, cancellationToken);

        if (session is null)
        {
            return Result.Success();
        }

        session.Revoke(DateTime.UtcNow);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
