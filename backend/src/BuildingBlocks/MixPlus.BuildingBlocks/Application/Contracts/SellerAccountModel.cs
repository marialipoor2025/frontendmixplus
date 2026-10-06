namespace MixPlus.BuildingBlocks.Application.Contracts;

/// <summary>
/// Cross-module seller account bound to an Identity user (Guid-only ownership).
/// </summary>
public sealed record SellerAccountModel(
    Guid Id,
    string ExternalKey,
    string Name,
    string Status,
    bool IsActive,
    Guid OwnerUserId);

/// <summary>
/// Read port implemented by Sellers; consumed by Catalog seller portal.
/// </summary>
public interface ISellerAccountReadPort
{
    Task<SellerAccountModel?> GetByOwnerUserIdAsync(
        Guid ownerUserId,
        CancellationToken cancellationToken = default);
}
