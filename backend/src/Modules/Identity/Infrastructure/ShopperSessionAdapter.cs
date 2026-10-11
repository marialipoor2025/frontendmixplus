using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Identity.Application.Auth;

namespace MixPlus.Modules.Identity.Infrastructure;

public sealed class ShopperSessionAdapter(ISessionAuthService sessions) : IShopperSessionPort
{
    public async Task<ShopperUserModel?> GetAsync(
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        var result = await sessions.GetMeAsync(accessToken, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return null;
        }

        var user = result.Value;
        return new ShopperUserModel(user.Id, user.DisplayName, user.Phone, user.Email);
    }
}
