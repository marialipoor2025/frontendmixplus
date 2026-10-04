using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Modules.Promotions.Infrastructure;

public sealed class OfferCampaignReadPort(PromotionsDbContext db) : IOfferCampaignReadPort
{
    public async Task<IReadOnlyList<string>> GetActiveProductKeysAsync(
        string campaignExternalKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(campaignExternalKey))
        {
            return [];
        }

        var campaign = await db.OfferCampaigns.AsNoTracking()
            .Where(x => x.IsActive && x.ExternalKey == campaignExternalKey)
            .FirstOrDefaultAsync(cancellationToken);

        return campaign?.GetProductKeys() ?? [];
    }
}
