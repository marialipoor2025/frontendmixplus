using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Promotions.Domain;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Modules.Promotions.Infrastructure;

public sealed class AmazingOfferNominationAdapter(PromotionsDbContext db) : IAmazingOfferNominationPort
{
    public async Task<AmazingOfferNominationDto?> GetAsync(
        string productExternalKey,
        Guid sellerId,
        CancellationToken cancellationToken = default)
    {
        var row = await db.OfferNominations.AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.ProductExternalKey == productExternalKey && x.SellerId == sellerId,
                cancellationToken);

        if (row is null) return null;

        var inCampaign = await IsInCampaignAsync(row.ProductExternalKey, cancellationToken);
        return ToDto(row, inCampaign);
    }

    public async Task<AmazingOfferNominationDto> NominateAsync(
        AmazingOfferNominateCommand command,
        CancellationToken cancellationToken = default)
    {
        var existing = await db.OfferNominations
            .FirstOrDefaultAsync(
                x => x.ProductExternalKey == command.ProductExternalKey && x.SellerId == command.SellerId,
                cancellationToken);

        if (existing is null)
        {
            existing = OfferNomination.Create(
                command.ProductExternalKey,
                command.SellerId,
                command.SellerExternalKey,
                command.DiscountPercent,
                command.SalePrice,
                command.ListPrice,
                command.ProductPublished,
                command.ProductInStock,
                command.ProductRating,
                command.ProductReviewCount,
                command.StartsAtUtc,
                command.EndsAtUtc);
            db.OfferNominations.Add(existing);
        }
        else
        {
            existing.RefreshSnapshot(
                command.DiscountPercent,
                command.SalePrice,
                command.ListPrice,
                command.ProductPublished,
                command.ProductInStock,
                command.ProductRating,
                command.ProductReviewCount,
                command.StartsAtUtc,
                command.EndsAtUtc);
        }

        await db.SaveChangesAsync(cancellationToken);
        await RebuildCampaignAsync(cancellationToken);

        var inCampaign = await IsInCampaignAsync(existing.ProductExternalKey, cancellationToken);
        return ToDto(existing, inCampaign);
    }

    public async Task WithdrawAsync(
        string productExternalKey,
        Guid sellerId,
        CancellationToken cancellationToken = default)
    {
        var existing = await db.OfferNominations
            .FirstOrDefaultAsync(
                x => x.ProductExternalKey == productExternalKey && x.SellerId == sellerId,
                cancellationToken);

        if (existing is null) return;

        existing.Withdraw();
        await db.SaveChangesAsync(cancellationToken);
        await RebuildCampaignAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<string>> RebuildCampaignAsync(
        CancellationToken cancellationToken = default)
    {
        var utcNow = DateTime.UtcNow;
        var nominations = await db.OfferNominations
            .Where(x => x.Status == OfferNominationStatus.Qualified)
            .ToListAsync(cancellationToken);

        // Re-check hard rules (stock/window may have expired).
        foreach (var n in nominations)
        {
            if (!n.MeetsHardRules(utcNow))
            {
                n.RefreshSnapshot(
                    n.DiscountPercent,
                    n.SalePrice,
                    n.ListPrice,
                    n.ProductPublished,
                    n.ProductInStock,
                    n.ProductRating,
                    n.ProductReviewCount,
                    n.StartsAtUtc,
                    n.EndsAtUtc);
            }
        }

        var eligible = nominations
            .Where(x => x.Status == OfferNominationStatus.Qualified && x.MeetsHardRules(utcNow))
            .OrderByDescending(x => x.QualificationScore())
            .ThenByDescending(x => x.NominatedAtUtc)
            .ToList();

        // Cap per seller, then campaign slots.
        var selected = new List<string>();
        var perSeller = new Dictionary<Guid, int>();
        foreach (var n in eligible)
        {
            perSeller.TryGetValue(n.SellerId, out var count);
            if (count >= OfferNomination.MaxPerSeller) continue;
            selected.Add(n.ProductExternalKey);
            perSeller[n.SellerId] = count + 1;
            if (selected.Count >= OfferNomination.MaxCampaignSlots) break;
        }

        var campaign = await db.OfferCampaigns
            .FirstOrDefaultAsync(x => x.ExternalKey == OfferNomination.AmazingCampaignKey, cancellationToken);

        if (campaign is null)
        {
            campaign = OfferCampaign.Create(
                OfferNomination.AmazingCampaignKey,
                "پیشنهادهای شگفت‌انگیز");
            db.OfferCampaigns.Add(campaign);
        }

        campaign.SetProductKeys(selected);
        if (!campaign.IsActive)
        {
            campaign.Update(campaign.Title, campaign.StartsAtUtc, campaign.EndsAtUtc, isActive: true);
        }

        await db.SaveChangesAsync(cancellationToken);
        return selected;
    }

    private async Task<bool> IsInCampaignAsync(string productKey, CancellationToken ct)
    {
        var campaign = await db.OfferCampaigns.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == OfferNomination.AmazingCampaignKey, ct);
        return campaign?.GetProductKeys()
            .Contains(productKey, StringComparer.OrdinalIgnoreCase) == true;
    }

    private static AmazingOfferNominationDto ToDto(OfferNomination n, bool inCampaign) =>
        new(
            n.ProductExternalKey,
            n.Status.ToString().ToLowerInvariant(),
            n.RejectionReason,
            n.DiscountPercent,
            inCampaign,
            n.NominatedAtUtc,
            n.StartsAtUtc,
            n.EndsAtUtc);
}
