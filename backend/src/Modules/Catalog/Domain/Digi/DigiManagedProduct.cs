using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Digi;

/// <summary>Mirror of Digikala seller product-management row (/api/v2/products/seller).</summary>
public sealed class DigiManagedProduct : AggregateRoot
{
    private DigiManagedProduct()
    {
    }

    public long DigikalaProductId { get; private set; }
    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? TitleEn { get; private set; }
    public string? BrandTitle { get; private set; }
    public long? BrandId { get; private set; }
    public string? CategoryTitle { get; private set; }
    public string? Status { get; private set; }
    public string? ModerationStatus { get; private set; }
    public int VariantsCount { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? ProductUrl { get; private set; }
    public string? Site { get; private set; }
    public bool Active { get; private set; }
    public bool IsOwner { get; private set; }
    public string PayloadJson { get; private set; } = "{}";
    public DateTimeOffset ScrapedAt { get; private set; }

    public static DigiManagedProduct Create(
        long digikalaProductId,
        string title,
        string payloadJson,
        DateTimeOffset scrapedAt,
        string? titleEn = null,
        string? brandTitle = null,
        long? brandId = null,
        string? categoryTitle = null,
        string? status = null,
        string? moderationStatus = null,
        int variantsCount = 0,
        string? imageUrl = null,
        string? productUrl = null,
        string? site = null,
        bool active = true,
        bool isOwner = false)
    {
        var key = $"dkp-{digikalaProductId}";
        return new DigiManagedProduct
        {
            Id = StableGuid.From(key),
            DigikalaProductId = digikalaProductId,
            ExternalKey = key,
            Title = title.Trim(),
            TitleEn = titleEn,
            BrandTitle = brandTitle,
            BrandId = brandId,
            CategoryTitle = categoryTitle,
            Status = status,
            ModerationStatus = moderationStatus,
            VariantsCount = variantsCount,
            ImageUrl = imageUrl,
            ProductUrl = productUrl,
            Site = site,
            Active = active,
            IsOwner = isOwner,
            PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson,
            ScrapedAt = scrapedAt,
        };
    }

    public void ReplaceFromScrape(
        string title,
        string payloadJson,
        DateTimeOffset scrapedAt,
        string? titleEn,
        string? brandTitle,
        long? brandId,
        string? categoryTitle,
        string? status,
        string? moderationStatus,
        int variantsCount,
        string? imageUrl,
        string? productUrl,
        string? site,
        bool active,
        bool isOwner)
    {
        Title = title.Trim();
        TitleEn = titleEn;
        BrandTitle = brandTitle;
        BrandId = brandId;
        CategoryTitle = categoryTitle;
        Status = status;
        ModerationStatus = moderationStatus;
        VariantsCount = variantsCount;
        ImageUrl = imageUrl;
        ProductUrl = productUrl;
        Site = site;
        Active = active;
        IsOwner = isOwner;
        PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson;
        ScrapedAt = scrapedAt;
    }
}
