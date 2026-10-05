using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Variants;

public sealed class ProductSku : AggregateRoot
{
    private ProductSku()
    {
    }

    public Guid ProductId { get; private set; }
    public string ProductExternalKey { get; private set; } = string.Empty;
    public string SkuCode { get; private set; } = string.Empty;
    /// <summary>JSON array of option value Guid strings.</summary>
    public string OptionValueIdsJson { get; private set; } = "[]";
    public Money Price { get; private set; } = Money.Create(0);
    public Money? OriginalPrice { get; private set; }
    public int? DiscountPercent { get; private set; }
    public int Stock { get; private set; }
    public bool InStock { get; private set; }

    public static ProductSku Create(
        Guid productId,
        string productExternalKey,
        string skuCode,
        IReadOnlyList<Guid> optionValueIds,
        Money price,
        int stock,
        Money? originalPrice = null,
        int? discountPercent = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(skuCode);

        return new ProductSku
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ProductExternalKey = productExternalKey.Trim(),
            SkuCode = skuCode.Trim().ToUpperInvariant(),
            OptionValueIdsJson = System.Text.Json.JsonSerializer.Serialize(
                optionValueIds.Select(x => x.ToString("D"))),
            Price = price,
            OriginalPrice = originalPrice,
            DiscountPercent = discountPercent,
            Stock = Math.Max(0, stock),
            InStock = stock > 0,
        };
    }

    public void Update(
        string skuCode,
        IReadOnlyList<Guid> optionValueIds,
        Money price,
        int stock,
        Money? originalPrice,
        int? discountPercent)
    {
        SkuCode = skuCode.Trim().ToUpperInvariant();
        OptionValueIdsJson = System.Text.Json.JsonSerializer.Serialize(
            optionValueIds.Select(x => x.ToString("D")));
        Price = price;
        OriginalPrice = originalPrice;
        DiscountPercent = discountPercent;
        Stock = Math.Max(0, stock);
        InStock = stock > 0;
    }

    public void AdjustStock(int onHand)
    {
        Stock = Math.Max(0, onHand);
        InStock = Stock > 0;
    }

    public IReadOnlyList<Guid> GetOptionValueIds()
    {
        try
        {
            var raw = System.Text.Json.JsonSerializer.Deserialize<List<string>>(OptionValueIdsJson)
                      ?? [];
            return raw
                .Select(x => Guid.TryParse(x, out var g) ? g : Guid.Empty)
                .Where(x => x != Guid.Empty)
                .ToList();
        }
        catch
        {
            return [];
        }
    }
}
