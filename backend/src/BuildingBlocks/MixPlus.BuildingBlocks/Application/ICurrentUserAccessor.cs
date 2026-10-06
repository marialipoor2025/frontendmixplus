namespace MixPlus.BuildingBlocks.Application;

/// <summary>
/// Resolves the authenticated Identity user id from an opaque session token.
/// Implemented by Identity; consumed by seller portal and other modules.
/// </summary>
public interface ICurrentUserAccessor
{
    Task<Guid?> GetUserIdAsync(string? accessToken, CancellationToken cancellationToken = default);
}
