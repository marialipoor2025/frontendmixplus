using Microsoft.AspNetCore.Http;
using MixPlus.BuildingBlocks.Application.Contracts;

namespace MixPlus.Modules.Cart.Api;

internal static class CartAuth
{
    public static async Task<ShopperUserModel?> RequireUser(
        HttpRequest request,
        IShopperSessionPort sessions,
        CancellationToken ct)
    {
        return await sessions.GetAsync(ReadBearer(request), ct);
    }

    public static string? ReadBearer(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header)) return null;
        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }
}
