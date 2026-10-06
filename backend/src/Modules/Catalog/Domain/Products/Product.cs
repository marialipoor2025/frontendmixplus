using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Products;

/// <summary>
/// Catalog product aggregate — fields aligned with frontend <c>Product</c> type.
/// </summary>
public sealed class Product : AggregateRoot
{
    private readonly List<ProductMediaItem> _mediaItems = [];

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
    public Guid? CategoryId { get; private set; }
    public string? CategoryExternalKey { get; private set; }
    public string? CategoryName { get; private set; }
    public Money Price { get; private set; } = Money.Create(0);
    public Money? OriginalPrice { get; private set; }
    public int? DiscountPercent { get; private set; }
    public decimal? Rating { get; private set; }
    public int? ReviewCount { get; private set; }
    public string? BadgesJson { get; private set; }
    public ProductCondition Condition { get; private set; } = ProductCondition.New;
    public bool InStock { get; private set; }
    public bool IsPublished { get; private set; }

    /// <summary>
    /// JSON blob for PDP sections managed by the seller wizard
    /// (intro, expert review, features, fulfillment copy, lightweight variants draft).
    /// </summary>
    public string? PdpContentJson { get; private set; }

    public IReadOnlyCollection<ProductMediaItem> MediaItems => _mediaItems.AsReadOnly();

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

    public void ReplacePdpContent(string? json) =>
        PdpContentJson = string.IsNullOrWhiteSpace(json) ? null : json;

    /// <summary>Seller portal: update title/brand/category/stock without reassigning seller.</summary>
    public void UpdateSellerBasics(
        string title,
        string slug,
        string brandExternalKey,
        string brandName,
        ProductCondition condition,
        bool inStock)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        ArgumentException.ThrowIfNullOrWhiteSpace(brandExternalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(brandName);

        Title = title.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        BrandId = StableGuid.From(brandExternalKey.Trim());
        BrandExternalKey = brandExternalKey.Trim();
        BrandName = brandName.Trim();
        Condition = condition;
        InStock = inStock;
    }

    public void ApplyPricing(Money price, Money? originalPrice, int? discountPercent, bool inStock)
    {
        Price = price;
        OriginalPrice = originalPrice;
        DiscountPercent = discountPercent;
        InStock = inStock;
    }

    /// <summary>Reassign product ownership to another seller master (denormalized keys).</summary>
    public void AssignSeller(string sellerExternalKey, string sellerName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sellerExternalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(sellerName);
        SellerId = StableGuid.From(sellerExternalKey.Trim());
        SellerExternalKey = sellerExternalKey.Trim();
        SellerName = sellerName.Trim();
    }

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

    public void SetCategory(Guid? categoryId, string? categoryExternalKey, string? categoryName)
    {
        if (categoryId is null || string.IsNullOrWhiteSpace(categoryExternalKey))
        {
            CategoryId = null;
            CategoryExternalKey = null;
            CategoryName = null;
            return;
        }

        CategoryId = categoryId;
        CategoryExternalKey = categoryExternalKey.Trim();
        CategoryName = string.IsNullOrWhiteSpace(categoryName) ? null : categoryName.Trim();
    }

    /// <summary>
    /// Replace gallery order. First primary wins; if none marked, first item is primary.
    /// Optionally syncs <see cref="ImageUrl"/> when <paramref name="primaryImageUrl"/> is provided.
    /// </summary>
    public void ReplaceMedia(
        IEnumerable<(Guid MediaAssetId, bool IsPrimary)> items,
        string? primaryImageUrl = null)
    {
        var list = items.ToList();
        _mediaItems.Clear();

        if (list.Count == 0)
        {
            if (!string.IsNullOrWhiteSpace(primaryImageUrl))
            {
                ImageUrl = primaryImageUrl;
            }

            return;
        }

        var primaryIndex = list.FindIndex(x => x.IsPrimary);
        if (primaryIndex < 0) primaryIndex = 0;

        for (var i = 0; i < list.Count; i++)
        {
            _mediaItems.Add(ProductMediaItem.Create(
                list[i].MediaAssetId,
                i,
                i == primaryIndex));
        }

        if (!string.IsNullOrWhiteSpace(primaryImageUrl))
        {
            ImageUrl = primaryImageUrl;
        }
    }
}

public enum ProductCondition
{
    New = 0,
    Used = 1,
}
