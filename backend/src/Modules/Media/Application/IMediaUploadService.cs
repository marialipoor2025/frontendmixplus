using MixPlus.BuildingBlocks.Application;

namespace MixPlus.Modules.Media.Application;

public sealed record MediaVariantDto(
    string Key,
    string Url,
    int Width,
    int Height,
    long ByteSize);

public sealed record MediaAssetDto(
    string Id,
    string OriginalFileName,
    string ContentType,
    IReadOnlyList<MediaVariantDto> Variants);

public interface IMediaUploadService
{
    Task<Result<MediaAssetDto>> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<(Stream Stream, string ContentType, string FileName)?> OpenVariantAsync(
        Guid assetId,
        string variantKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Copy originals into <see cref="MediaOptions.MirrorOriginalsPath"/> (optional product subfolder).
    /// </summary>
    Task MirrorOriginalsAsync(
        IEnumerable<Guid> assetIds,
        string? productSlug = null,
        CancellationToken cancellationToken = default);
}
