using MixPlus.Modules.Catalog.Domain.Products;

namespace MixPlus.Modules.Catalog.Infrastructure;

/// <summary>
/// Shared card image resolution for home rails and catalog PLP lists.
/// </summary>
public static class CatalogCardImages
{
    public const string DefaultPlaceholder = "/placeholders/product-appliance.png";

    public static string ResolveCardImageUrl(Product product)
    {
        var fromField = Normalize(product.ImageUrl);
        // Static public paths are trusted; /api/media/* ImageUrl may be stale after deletes.
        if (!string.IsNullOrWhiteSpace(fromField) && !IsMediaApiUrl(fromField))
        {
            return fromField;
        }

        var primary = product.MediaItems
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.SortOrder)
            .FirstOrDefault();
        if (primary is not null)
        {
            return $"/api/media/{primary.MediaAssetId:D}/card";
        }

        return DefaultPlaceholder;
    }

    private static string Normalize(string? imageUrl) =>
        string.IsNullOrWhiteSpace(imageUrl) ? string.Empty : imageUrl.Trim();

    private static bool IsMediaApiUrl(string imageUrl) =>
        imageUrl.StartsWith("/api/media/", StringComparison.OrdinalIgnoreCase);
}
