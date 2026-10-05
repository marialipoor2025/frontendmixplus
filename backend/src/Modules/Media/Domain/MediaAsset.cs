using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Media.Domain;

public sealed class MediaAsset : AggregateRoot
{
    private readonly List<MediaVariant> _variants = [];

    private MediaAsset()
    {
    }

    public string OriginalFileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public string RelativeFolder { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }
    public IReadOnlyCollection<MediaVariant> Variants => _variants.AsReadOnly();

    public static MediaAsset Create(
        Guid id,
        string originalFileName,
        string contentType,
        string relativeFolder,
        IEnumerable<MediaVariant> variants)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(originalFileName);
        ArgumentException.ThrowIfNullOrWhiteSpace(relativeFolder);

        var asset = new MediaAsset
        {
            Id = id,
            OriginalFileName = originalFileName.Trim(),
            ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType.Trim(),
            RelativeFolder = relativeFolder.Trim().Replace('\\', '/'),
            CreatedAtUtc = DateTime.UtcNow,
        };

        foreach (var variant in variants)
        {
            asset._variants.Add(variant);
        }

        return asset;
    }

    public MediaVariant? FindVariant(string key) =>
        _variants.FirstOrDefault(v =>
            string.Equals(v.Key, key, StringComparison.OrdinalIgnoreCase));
}

public sealed class MediaVariant
{
    private MediaVariant()
    {
    }

    public string Key { get; private set; } = string.Empty;
    public string FileName { get; private set; } = string.Empty;
    public int Width { get; private set; }
    public int Height { get; private set; }
    public long ByteSize { get; private set; }

    public static MediaVariant Create(string key, string fileName, int width, int height, long byteSize)
    {
        return new MediaVariant
        {
            Key = key.Trim().ToLowerInvariant(),
            FileName = fileName.Trim(),
            Width = width,
            Height = height,
            ByteSize = byteSize,
        };
    }
}
