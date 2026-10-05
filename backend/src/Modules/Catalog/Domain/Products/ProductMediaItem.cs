namespace MixPlus.Modules.Catalog.Domain.Products;

/// <summary>
/// Owned product gallery item. <see cref="MediaAssetId"/> is an opaque cross-module reference
/// to Media — Catalog never imports Media types.
/// </summary>
public sealed class ProductMediaItem
{
    private ProductMediaItem()
    {
    }

    public Guid Id { get; private set; }
    public Guid MediaAssetId { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsPrimary { get; private set; }

    public static ProductMediaItem Create(Guid mediaAssetId, int sortOrder, bool isPrimary)
    {
        if (mediaAssetId == Guid.Empty)
        {
            throw new ArgumentException("Media asset id is required.", nameof(mediaAssetId));
        }

        return new ProductMediaItem
        {
            Id = Guid.NewGuid(),
            MediaAssetId = mediaAssetId,
            SortOrder = sortOrder,
            IsPrimary = isPrimary,
        };
    }
}
