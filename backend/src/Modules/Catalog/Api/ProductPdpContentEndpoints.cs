using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

/// <summary>
/// Public PDP content from seller-managed <see cref="Product.PdpContentJson"/>.
/// </summary>
internal static class ProductPdpContentEndpoints
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public static void MapProductPdpContentEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var catalog = endpoints.MapGroup("/api/catalog").WithTags("Catalog");
        catalog.MapGet("/products/{productKey}/pdp-content", GetPdpContent)
            .WithName("GetProductPdpContent");
    }

    private static async Task<IResult> GetPdpContent(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var slug = productKey.Trim().ToLowerInvariant();
        var product = await db.Products.AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.IsPublished && (x.Slug == slug || x.ExternalKey == productKey),
                ct);

        if (product is null)
        {
            return Results.NotFound(new { error = "محصول یافت نشد" });
        }

        var content = ReadContent(product) ?? new PdpContentDoc();

        return Results.Ok(new
        {
            introPreview = content.IntroPreview ?? "",
            introFull = content.IntroFull ?? "",
            expertReviewTitle = content.ExpertReviewTitle ?? "نقد و بررسی",
            expertReviewPreview = content.ExpertReviewPreview ?? "",
            expertReviewFull = content.ExpertReviewFull ?? "",
            features = content.Features ?? [],
            showWarranty = content.ShowWarranty ?? true,
            warranty = content.Warranty ?? "",
            showDelivery = content.ShowDelivery ?? true,
            deliveryTitle = content.DeliveryTitle ?? "",
            deliveryMethodLabel = content.DeliveryMethodLabel ?? "",
            deliveryCostLabel = content.DeliveryCostLabel ?? "",
            showPricePolicy = content.ShowPricePolicy ?? true,
            pricePolicyLabel = content.PricePolicyLabel ?? "فرآیند قیمت‌گذاری و نظارت بر قیمت",
            showInsurance = content.ShowInsurance ?? false,
            insuranceTitle = content.InsuranceTitle ?? "",
            insurancePrice = content.InsurancePrice ?? 0,
            insuranceOriginalPrice = content.InsuranceOriginalPrice,
            insuranceDiscountPercent = content.InsuranceDiscountPercent,
            sellerId = product.SellerExternalKey,
            sellerName = product.SellerName,
        });
    }

    internal static PdpContentDoc? ReadContent(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.PdpContentJson)) return null;
        try
        {
            return JsonSerializer.Deserialize<PdpContentDoc>(product.PdpContentJson, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    internal sealed class PdpContentDoc
    {
        public string? IntroPreview { get; set; }
        public string? IntroFull { get; set; }
        public string? ExpertReviewTitle { get; set; }
        public string? ExpertReviewPreview { get; set; }
        public string? ExpertReviewFull { get; set; }
        public List<PdpFeatureDto>? Features { get; set; }
        public bool? ShowWarranty { get; set; }
        public string? Warranty { get; set; }
        public bool? ShowDelivery { get; set; }
        public string? DeliveryTitle { get; set; }
        public string? DeliveryMethodLabel { get; set; }
        public string? DeliveryCostLabel { get; set; }
        public bool? ShowPricePolicy { get; set; }
        public string? PricePolicyLabel { get; set; }
        public bool? ShowInsurance { get; set; }
        public string? InsuranceTitle { get; set; }
        public decimal? InsurancePrice { get; set; }
        public decimal? InsuranceOriginalPrice { get; set; }
        public int? InsuranceDiscountPercent { get; set; }
    }

    internal sealed record PdpFeatureDto(string Id, string Label, string Value);
}
