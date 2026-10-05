using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Identity.Application.Auth;

namespace MixPlus.Modules.Identity.Infrastructure;

public sealed class SessionAccessTokenValidator(ISessionAuthService sessions) : IAccessTokenValidator
{
    public async Task<bool> IsValidAsync(
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        var result = await sessions.GetMeAsync(accessToken, cancellationToken);
        return result.IsSuccess;
    }
}
