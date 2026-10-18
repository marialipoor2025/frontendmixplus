using Microsoft.AspNetCore.Http;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Api;

internal static class CartAuth
{
    public const string GuestHeaderName = "X-Guest-Token";

    public static async Task<ShopperUserModel?> RequireUser(
        HttpRequest request,
        IShopperSessionPort sessions,
        CancellationToken ct)
    {
        return await sessions.GetAsync(ReadBearer(request), ct);
    }

    /// <summary>
    /// Authenticated shopper, or anonymous cart owner from <see cref="GuestHeaderName"/>.
    /// </summary>
    public static async Task<CartOwner?> ResolveCartOwner(
        HttpRequest request,
        IShopperSessionPort sessions,
        CancellationToken ct)
    {
        var user = await sessions.GetAsync(ReadBearer(request), ct);
        if (user is not null && Guid.TryParse(user.Id, out var userId))
        {
            return new CartOwner(userId, IsGuest: false, user);
        }

        var guest = ReadGuestToken(request);
        if (string.IsNullOrWhiteSpace(guest))
        {
            return null;
        }

        // Stable synthetic user id — no Identity row required.
        var guestId = StableGuid.From("guest-cart:" + guest.Trim());
        return new CartOwner(guestId, IsGuest: true, User: null);
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

    public static string? ReadGuestToken(HttpRequest request)
    {
        if (!request.Headers.TryGetValue(GuestHeaderName, out var values))
        {
            return null;
        }

        var raw = values.ToString().Trim();
        if (raw.Length < 8 || raw.Length > 128)
        {
            return null;
        }

        // Only allow opaque ids (hex / uuid-like).
        foreach (var ch in raw)
        {
            if (char.IsAsciiLetterOrDigit(ch) || ch is '-' or '_')
            {
                continue;
            }

            return null;
        }

        return raw;
    }

    internal sealed record CartOwner(Guid CartUserId, bool IsGuest, ShopperUserModel? User);
}
