using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Modules.Sellers.Infrastructure;

/// <summary>
/// Sellers → BuildingBlocks read port for seller accounts owned by Identity users.
/// </summary>
public sealed class SellerAccountReadAdapter(SellersDbContext db) : ISellerAccountReadPort
{
    public async Task<SellerAccountModel?> GetByOwnerUserIdAsync(
        Guid ownerUserId,
        CancellationToken cancellationToken = default)
    {
        var seller = await db.Sellers.AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.OwnerUserId == ownerUserId && x.IsActive,
                cancellationToken);

        if (seller?.OwnerUserId is null)
        {
            return null;
        }

        return new SellerAccountModel(
            seller.Id,
            seller.ExternalKey,
            seller.Name,
            seller.Status,
            seller.IsActive,
            seller.OwnerUserId.Value);
    }
}
