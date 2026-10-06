using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Media.Domain;
using MixPlus.Modules.Media.Infrastructure.Persistence;
using MixPlus.Modules.Media.Infrastructure.Storage;

namespace MixPlus.Modules.Media.Application;

public sealed class MediaUploadService(
    MediaDbContext db,
    ILocalMediaStorage storage,
    IImageResizer resizer,
    IOptions<MediaOptions> options) : IMediaUploadService
{
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    public async Task<Result<MediaAssetDto>> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            return Result.Failure<MediaAssetDto>("Unsupported image type. Use jpg, png, or webp.");
        }

        if (extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
        {
            extension = ".jpg";
        }

        await using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, cancellationToken);
        if (buffer.Length <= 0)
        {
            return Result.Failure<MediaAssetDto>("Empty upload.");
        }

        if (buffer.Length > options.Value.MaxUploadBytes)
        {
            return Result.Failure<MediaAssetDto>("File exceeds max upload size.");
        }

        var assetId = Guid.NewGuid();
        var relativeFolder = $"{DateTime.UtcNow:yyyy/MM}/{assetId:N}";
        var variants = new List<MediaVariant>();

        buffer.Position = 0;
        var (original, originalBytes) = await resizer.SaveOriginalAsync(buffer, extension, cancellationToken);
        await storage.WriteAsync(
            $"{relativeFolder}/{original.FileName}",
            new MemoryStream(originalBytes),
            cancellationToken);
        variants.Add(original);

        foreach (var spec in MediaVariantPresets.Defaults)
        {
            buffer.Position = 0;
            var (variant, bytes) = await resizer.CreateVariantAsync(buffer, spec, extension, cancellationToken);
            await storage.WriteAsync(
                $"{relativeFolder}/{variant.FileName}",
                new MemoryStream(bytes),
                cancellationToken);
            variants.Add(variant);
        }

        var safeName = Path.GetFileName(fileName);
        var asset = MediaAsset.Create(assetId, safeName, contentType, relativeFolder, variants);
        db.Assets.Add(asset);
        await db.SaveChangesAsync(cancellationToken);

        TryWriteMirror(safeName, originalBytes, productSlug: null);

        return Result.Success(ToDto(asset));
    }

    public async Task MirrorOriginalsAsync(
        IEnumerable<Guid> assetIds,
        string? productSlug = null,
        CancellationToken cancellationToken = default)
    {
        foreach (var assetId in assetIds.Distinct())
        {
            var asset = await db.Assets.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == assetId, cancellationToken);
            if (asset is null) continue;

            var original = asset.FindVariant(MediaVariantKeys.Original)
                ?? asset.Variants.FirstOrDefault();
            if (original is null) continue;

            var relative = $"{asset.RelativeFolder}/{original.FileName}";
            await using var stream = storage.OpenRead(relative);
            if (stream is null) continue;

            await using var buffer = new MemoryStream();
            await stream.CopyToAsync(buffer, cancellationToken);
            TryWriteMirror(asset.OriginalFileName, buffer.ToArray(), productSlug);
        }
    }

    private void TryWriteMirror(string originalFileName, byte[] bytes, string? productSlug)
    {
        var mirrorRoot = options.Value.MirrorOriginalsPath;
        if (string.IsNullOrWhiteSpace(mirrorRoot) || bytes.Length == 0) return;

        try
        {
            var targetDir = string.IsNullOrWhiteSpace(productSlug)
                ? Path.GetFullPath(mirrorRoot)
                : Path.GetFullPath(Path.Combine(mirrorRoot, SanitizeFolder(productSlug)));
            Directory.CreateDirectory(targetDir);

            var safe = Path.GetFileName(originalFileName);
            if (string.IsNullOrWhiteSpace(safe)) safe = "image.bin";
            var dest = Path.Combine(targetDir, safe);
            if (File.Exists(dest))
            {
                var stem = Path.GetFileNameWithoutExtension(safe);
                var ext = Path.GetExtension(safe);
                dest = Path.Combine(targetDir, $"{stem}-{DateTime.UtcNow:HHmmss}{ext}");
            }

            File.WriteAllBytes(dest, bytes);
        }
        catch
        {
            // Mirror is best-effort for local review; never fail the upload.
        }
    }

    private static string SanitizeFolder(string slug)
    {
        var cleaned = string.Concat(slug.Trim().Select(ch =>
            char.IsLetterOrDigit(ch) || ch is '-' or '_' ? ch : '-'));
        return string.IsNullOrWhiteSpace(cleaned) ? "product" : cleaned;
    }

    public async Task<(Stream Stream, string ContentType, string FileName)?> OpenVariantAsync(
        Guid assetId,
        string variantKey,
        CancellationToken cancellationToken = default)
    {
        var asset = await db.Assets.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == assetId, cancellationToken);

        if (asset is null)
        {
            return null;
        }

        var variant = asset.FindVariant(variantKey) ?? asset.FindVariant(MediaVariantKeys.Original);
        if (variant is null)
        {
            return null;
        }

        var relative = $"{asset.RelativeFolder}/{variant.FileName}";
        var stream = storage.OpenRead(relative);
        if (stream is null)
        {
            return null;
        }

        return (stream, asset.ContentType, variant.FileName);
    }

    private static MediaAssetDto ToDto(MediaAsset asset) =>
        new(
            asset.Id.ToString("D"),
            asset.OriginalFileName,
            asset.ContentType,
            asset.Variants.Select(v => new MediaVariantDto(
                v.Key,
                $"/api/media/{asset.Id:D}/{v.Key}",
                v.Width,
                v.Height,
                v.ByteSize)).ToList());
}
