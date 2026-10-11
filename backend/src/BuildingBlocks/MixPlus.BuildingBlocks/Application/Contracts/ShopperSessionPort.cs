namespace MixPlus.BuildingBlocks.Application.Contracts;

public sealed record ShopperUserModel(string Id, string DisplayName, string? Phone, string? Email);

/// <summary>Resolved shopper from Bearer session (Identity implements).</summary>
public interface IShopperSessionPort
{
    Task<ShopperUserModel?> GetAsync(string? accessToken, CancellationToken cancellationToken = default);
}
