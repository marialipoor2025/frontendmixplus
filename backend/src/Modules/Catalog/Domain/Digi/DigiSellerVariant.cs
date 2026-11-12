using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Digi;

/// <summary>Mirror of Digikala variant-management row (/api/v2/variants).</summary>
public sealed class DigiSellerVariant : AggregateRoot
{
    private DigiSellerVariant()
    {
    }

    public long DigikalaVariantId { get; private set; }
    public string ExternalKey { get; private set; } = string.Empty;
    public long DigikalaProductId { get; private set; }
    public long? ProductVariantId { get; private set; }
    public string? SupplierCode { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? ProductTitle { get; private set; }
    public string? CategoryTitle { get; private set; }
    public long? CategoryId { get; private set; }
    public bool Active { get; private set; }
    public long? PriceSaleRial { get; private set; }
    public long? MarketPriceRial { get; private set; }
    public string? PriceType { get; private set; }
    public int? SellerStock { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? ProductUrl { get; private set; }
    public string PayloadJson { get; private set; } = "{}";
    public DateTimeOffset ScrapedAt { get; private set; }

    public static DigiSellerVariant Create(
        long digikalaVariantId,
        long digikalaProductId,
        string title,
        string payloadJson,
        DateTimeOffset scrapedAt,
        long? productVariantId = null,
        string? supplierCode = null,
        string? productTitle = null,
        string? categoryTitle = null,
        long? categoryId = null,
        bool active = false,
        long? priceSaleRial = null,
        long? marketPriceRial = null,
        string? priceType = null,
        int? sellerStock = null,
        string? imageUrl = null,
        string? productUrl = null)
    {
        var key = $"dkpc-{digikalaVariantId}";
        return new DigiSellerVariant
        {
            Id = StableGuid.From(key),
            DigikalaVariantId = digikalaVariantId,
            ExternalKey = key,
            DigikalaProductId = digikalaProductId,
            ProductVariantId = productVariantId,
            SupplierCode = supplierCode,
            Title = title.Trim(),
            ProductTitle = productTitle,
            CategoryTitle = categoryTitle,
            CategoryId = categoryId,
            Active = active,
            PriceSaleRial = priceSaleRial,
            MarketPriceRial = marketPriceRial,
            PriceType = priceType,
            SellerStock = sellerStock,
            ImageUrl = imageUrl,
            ProductUrl = productUrl,
            PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson,
            ScrapedAt = scrapedAt,
        };
    }

    public void ReplaceFromScrape(
        long digikalaProductId,
        string title,
        string payloadJson,
        DateTimeOffset scrapedAt,
        long? productVariantId,
        string? supplierCode,
        string? productTitle,
        string? categoryTitle,
        long? categoryId,
        bool active,
        long? priceSaleRial,
        long? marketPriceRial,
        string? priceType,
        int? sellerStock,
        string? imageUrl,
        string? productUrl)
    {
        DigikalaProductId = digikalaProductId;
        Title = title.Trim();
        ProductVariantId = productVariantId;
        SupplierCode = supplierCode;
        ProductTitle = productTitle;
        CategoryTitle = categoryTitle;
        CategoryId = categoryId;
        Active = active;
        PriceSaleRial = priceSaleRial;
        MarketPriceRial = marketPriceRial;
        PriceType = priceType;
        SellerStock = sellerStock;
        ImageUrl = imageUrl;
        ProductUrl = productUrl;
        PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson;
        ScrapedAt = scrapedAt;
    }
}
