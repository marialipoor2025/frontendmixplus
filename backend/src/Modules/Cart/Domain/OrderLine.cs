using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class OrderLine : Entity
{
    private OrderLine()
    {
    }

    public Guid OrderId { get; private set; }
    public string ProductSlug { get; private set; } = string.Empty;
    public string OfferExternalKey { get; private set; } = string.Empty;
    public string SkuExternalKey { get; private set; } = string.Empty;
    public string SellerName { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public string? VariantLabel { get; private set; }
    public decimal UnitPrice { get; private set; }
    public string Currency { get; private set; } = "IRT";
    public int Quantity { get; private set; }

    public static OrderLine FromCartLine(Guid orderId, CartLine line) =>
        new()
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            ProductSlug = line.ProductSlug,
            OfferExternalKey = line.OfferExternalKey,
            SkuExternalKey = line.SkuExternalKey,
            SellerName = line.SellerName,
            Title = line.Title,
            ImageUrl = line.ImageUrl,
            VariantLabel = line.VariantLabel,
            UnitPrice = line.UnitPrice,
            Currency = line.Currency,
            Quantity = line.Quantity,
        };
}
