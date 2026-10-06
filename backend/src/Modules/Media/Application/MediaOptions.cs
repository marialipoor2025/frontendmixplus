namespace MixPlus.Modules.Media.Application;

public sealed class MediaOptions
{
    public const string SectionName = "Media";

    /// <summary>Absolute or relative root folder for uploaded binaries (not in DB).</summary>
    public string RootPath { get; set; } = "storage/media";

    /// <summary>
    /// Optional folder that receives a copy of each uploaded original
    /// (e.g. Digikala screenshot products directory for local review).
    /// </summary>
    public string? MirrorOriginalsPath { get; set; }

    /// <summary>Max upload size in bytes (default 8 MB).</summary>
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
    public static IReadOnlyList<MediaVariantSpec> Defaults { get; } =
    [
        new(MediaVariantKeys.Thumb, 120, 120),
        new(MediaVariantKeys.Card, 320, 320),
        new(MediaVariantKeys.Gallery, 800, 800),
    ];
}
