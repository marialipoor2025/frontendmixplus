using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Domain.Products;
using Xunit;

namespace MixPlus.Modules.Catalog.UnitTests;

public class ProductTests
{
    [Fact]
    public void Create_sets_stable_id_slug_and_price()
    {
        var product = Product.Create(
            "p-test-1",
            "یخچال سامسونگ",
            "samsung-fridge",
            "/images/p.jpg",
            "b-samsung",
            "Samsung",
            "s-1",
            "فروشگاه نمونه",
            Money.Create(25000000));

        Assert.Equal(StableGuid.From("p-test-1"), product.Id);
        Assert.Equal("p-test-1", product.ExternalKey);
        Assert.Equal("b-samsung", product.BrandExternalKey);
        Assert.Equal("samsung-fridge", product.Slug);
        Assert.Equal(25_000_000m, product.Price.Amount);
        Assert.Equal("IRT", product.Price.Currency);
        Assert.True(product.IsPublished);
    }
}
