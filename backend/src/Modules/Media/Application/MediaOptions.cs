namespace MixPlus.Modules.Media.Application;

/// <summary>
/// Local-disk media pipeline. Prefer pre-generated variants over on-the-fly resize
/// (marketplace default: upload once → write original + viewport sizes → serve static files).
/// Count limits for seller galleries are intentionally not enforced yet.
/// </summary>
public sealed class MediaOptions
{
    public const string SectionName = "Media";

    /// <summary>
    /// Absolute or content-root-relative folder for binaries on the deploy host.
    /// </summary>
    public string RootPath { get; set; } = "storage/media";

    /// <summary>
    /// Optional folder that receives a copy of each uploaded original
    /// (e.g. Digikala screenshot products directory for local review).
    /// </summary>
    public string? MirrorOriginalsPath { get; set; }

    /// <summary>Max upload size in bytes (default 8 MB). No per-product image count limit yet.</summary>
    public long MaxUploadBytes { get; set; } = 8 * 1024 * 1024;
}

public static class MediaVariantKeys
{
    public const string Original = "original";
    public const string Thumb = "thumb";
    public const string Card = "card";
    public const string Gallery = "gallery";
}

public sealed record MediaVariantSpec(string Key, int MaxWidth, int MaxHeight);

public static class MediaVariantPresets
{
    /// <summary>Viewport sizes written at upload time (thumb / PLP card / PDP gallery).</summary>
    public static IReadOnlyList<MediaVariantSpec> Defaults { get; } =
    [
        new(MediaVariantKeys.Thumb, 120, 120),
        new(MediaVariantKeys.Card, 320, 320),
        new(MediaVariantKeys.Gallery, 800, 800),
    ];
}
