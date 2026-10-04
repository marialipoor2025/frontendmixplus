using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Products;

/// <summary>
/// Catalog product aggregate — fields aligned with frontend <c>Product</c> type.
/// </summary>
public sealed class Product : AggregateRoot
{
    private Product()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public Guid BrandId { get; private set; }
    public string BrandExternalKey { get; private set; } = string.Empty;
    public string BrandName { get; private set; } = string.Empty;
    public string? BrandLogoUrl { get; private set; }
    public Guid SellerId { get; private set; }
    public string SellerExternalKey { get; private set; } = string.Empty;
    public string SellerName { get; private set; } = string.Empty;
    public Money Price { get; private set; } = Money.Create(0);
    public Money? OriginalPrice { get; private set; }
    public int? DiscountPercent { get; private set; }
    public decimal? Rating { get; private set; }
    public int? ReviewCount { get; private set; }
    public string? BadgesJson { get; private set; }
    public ProductCondition Condition { get; private set; } = ProductCondition.New;
    public bool InStock { get; private set; }
    public bool IsPublished { get; private set; }

    public static Product Create(
        string externalKey,
        string title,
        string slug,
        string imageUrl,
        string brandExternalKey,
        string brandName,
        string sellerExternalKey,
        string sellerName,
        Money price,
        bool inStock = true,
        bool isPublished = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        ArgumentException.ThrowIfNullOrWhiteSpace(brandExternalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(sellerExternalKey);

        return new Product
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Title = title.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            ImageUrl = imageUrl,
            BrandId = StableGuid.From(brandExternalKey),
            BrandExternalKey = brandExternalKey.Trim(),
            BrandName = brandName,
            SellerId = StableGuid.From(sellerExternalKey),
            SellerExternalKey = sellerExternalKey.Trim(),
            SellerName = sellerName,
            Price = price,
            InStock = inStock,
            IsPublished = isPublished,
            Condition = ProductCondition.New,
        };
    }

    public void SetPublished(bool isPublished) => IsPublished = isPublished;

    public void ApplyDetails(
        string? brandLogoUrl,
        Money? originalPrice,
        int? discountPercent,
        decimal? rating,
        int? reviewCount,
        IReadOnlyList<string>? badges,
        ProductCondition condition,
        bool inStock)
    {
        BrandLogoUrl = brandLogoUrl;
        OriginalPrice = originalPrice;
        DiscountPercent = discountPercent;
        Rating = rating;
        ReviewCount = reviewCount;
        BadgesJson = badges is { Count: > 0 }
            ? System.Text.Json.JsonSerializer.Serialize(badges)
            : null;
        Condition = condition;
        InStock = inStock;
    }

    public void UpdateCore(
        string title,
        string slug,
        string imageUrl,
        string brandExternalKey,
        string brandName,
        string sellerExternalKey,
        string sellerName,
        Money price)
    {
        Title = title.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        ImageUrl = imageUrl;
        BrandId = StableGuid.From(brandExternalKey);
        BrandExternalKey = brandExternalKey.Trim();
        BrandName = brandName;
        SellerId = StableGuid.From(sellerExternalKey);
        SellerExternalKey = sellerExternalKey.Trim();
        SellerName = sellerName;
        Price = price;
    }
}

public enum ProductCondition
{
    New = 0,
    Used = 1,
}
