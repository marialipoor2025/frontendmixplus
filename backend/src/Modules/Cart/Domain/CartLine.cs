using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class CartLine : Entity
{
    private CartLine()
    {
    }

    public Guid CartId { get; private set; }
    public string ProductSlug { get; private set; } = string.Empty;
    public string OfferExternalKey { get; private set; } = string.Empty;
    public string SkuExternalKey { get; private set; } = string.Empty;
    public string SellerExternalKey { get; private set; } = string.Empty;
    public string SellerName { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public string? VariantLabel { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal? OriginalPrice { get; private set; }
    public int? DiscountPercent { get; private set; }
    public string Currency { get; private set; } = "IRT";
    public int Quantity { get; private set; }
    public int StockAvailable { get; private set; }
    public bool InStock { get; private set; } = true;

    public static CartLine Create(
        Guid cartId,
        string productSlug,
        string offerExternalKey,
        string skuExternalKey,
        string sellerExternalKey,
        string sellerName,
        string title,
        string imageUrl,
        string? variantLabel,
        decimal unitPrice,
        decimal? originalPrice,
        int? discountPercent,
        string currency,
        int quantity,
        int stockAvailable)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(productSlug);
        ArgumentException.ThrowIfNullOrWhiteSpace(offerExternalKey);

        var qty = Math.Max(1, quantity);
        var stock = Math.Max(0, stockAvailable);
        return new CartLine
        {
            Id = Guid.NewGuid(),
            CartId = cartId,
            ProductSlug = productSlug.Trim().ToLowerInvariant(),
            OfferExternalKey = offerExternalKey.Trim(),
            SkuExternalKey = string.IsNullOrWhiteSpace(skuExternalKey)
                ? "default"
                : skuExternalKey.Trim(),
            SellerExternalKey = sellerExternalKey?.Trim() ?? offerExternalKey.Trim(),
            SellerName = string.IsNullOrWhiteSpace(sellerName) ? "فروشنده" : sellerName.Trim(),
            Title = string.IsNullOrWhiteSpace(title) ? productSlug : title.Trim(),
            ImageUrl = imageUrl?.Trim() ?? string.Empty,
            VariantLabel = string.IsNullOrWhiteSpace(variantLabel) ? null : variantLabel.Trim(),
            UnitPrice = Math.Max(0, unitPrice),
            OriginalPrice = originalPrice is > 0 ? originalPrice : null,
            DiscountPercent = discountPercent is > 0 ? discountPercent : null,
            Currency = string.IsNullOrWhiteSpace(currency) ? "IRT" : currency.Trim().ToUpperInvariant(),
            Quantity = stock > 0 ? Math.Min(qty, stock) : qty,
            StockAvailable = stock,
            InStock = stock > 0,
        };
    }

    public void SetQuantity(int quantity)
    {
        var qty = Math.Max(1, quantity);
        if (StockAvailable > 0)
        {
            qty = Math.Min(qty, StockAvailable);
        }

        Quantity = qty;
    }

    public void ApplyLivePricing(
        decimal unitPrice,
        decimal? originalPrice,
        int? discountPercent,
        int stockAvailable)
    {
        UnitPrice = Math.Max(0, unitPrice);
        OriginalPrice = originalPrice is > 0 ? originalPrice : null;
        DiscountPercent = discountPercent is > 0 ? discountPercent : null;
        StockAvailable = Math.Max(0, stockAvailable);
        InStock = StockAvailable > 0;
        if (InStock && Quantity > StockAvailable)
        {
            Quantity = StockAvailable;
        }
    }
}
