using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Infrastructure;

/// <summary>
/// Resolves Identity user id from opaque session token (cross-module port).
/// </summary>
public sealed class CurrentUserAccessor(IdentityDbContext db) : ICurrentUserAccessor
{
    public async Task<Guid?> GetUserIdAsync(
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return null;
        }

        var utcNow = DateTime.UtcNow;
        var session = await db.Sessions.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Token == accessToken, cancellationToken);

        if (session is null || !session.IsActive(utcNow))
        {
            return null;
        }

        return session.UserId;
    }
}
