using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Digi;

/// <summary>Mirror of Digikala product/list catalog row (/api/v2/product-creation/search/v2).</summary>
public sealed class DigiMarketplaceProduct : AggregateRoot
{
    private DigiMarketplaceProduct()
    {
    }

    public long DigikalaProductId { get; private set; }
    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Status { get; private set; }
    public long? MinPriceRial { get; private set; }
    public string? Commission { get; private set; }
    public long? MarketPriceRial { get; private set; }
    public string? PriceType { get; private set; }
    public int NumberOfSellers { get; private set; }
    public bool IsSelling { get; private set; }
    public string? Brand { get; private set; }
    public string? Category { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? Site { get; private set; }
    public string PayloadJson { get; private set; } = "{}";
    public DateTimeOffset ScrapedAt { get; private set; }

    public static DigiMarketplaceProduct Create(
        long digikalaProductId,
        string title,
        string payloadJson,
        DateTimeOffset scrapedAt,
        string? status = null,
        long? minPriceRial = null,
        string? commission = null,
        long? marketPriceRial = null,
        string? priceType = null,
        int numberOfSellers = 0,
        bool isSelling = false,
        string? brand = null,
        string? category = null,
        string? imageUrl = null,
        string? site = null)
    {
        var key = $"dkp-list-{digikalaProductId}";
        return new DigiMarketplaceProduct
        {
            Id = StableGuid.From(key),
            DigikalaProductId = digikalaProductId,
            ExternalKey = key,
            Title = title.Trim(),
            Status = status,
            MinPriceRial = minPriceRial,
            Commission = commission,
            MarketPriceRial = marketPriceRial,
            PriceType = priceType,
            NumberOfSellers = numberOfSellers,
            IsSelling = isSelling,
            Brand = brand,
            Category = category,
            ImageUrl = imageUrl,
            Site = site,
            PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson,
            ScrapedAt = scrapedAt,
        };
    }

    public void ReplaceFromScrape(
        string title,
        string payloadJson,
        DateTimeOffset scrapedAt,
        string? status,
        long? minPriceRial,
        string? commission,
        long? marketPriceRial,
        string? priceType,
        int numberOfSellers,
        bool isSelling,
        string? brand,
        string? category,
        string? imageUrl,
        string? site)
    {
        Title = title.Trim();
        Status = status;
        MinPriceRial = minPriceRial;
        Commission = commission;
        MarketPriceRial = marketPriceRial;
        PriceType = priceType;
        NumberOfSellers = numberOfSellers;
        IsSelling = isSelling;
        Brand = brand;
        Category = category;
        ImageUrl = imageUrl;
        Site = site;
        PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson;
        ScrapedAt = scrapedAt;
    }
}
