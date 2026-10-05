using MixPlus.Modules.Media.Application;
using MixPlus.Modules.Media.Domain;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace MixPlus.Modules.Media.Infrastructure.Storage;

public interface IImageResizer
{
    Task<(MediaVariant Variant, byte[] Bytes)> SaveOriginalAsync(
        Stream source,
        string extension,
        CancellationToken cancellationToken = default);

    Task<(MediaVariant Variant, byte[] Bytes)> CreateVariantAsync(
        Stream source,
        MediaVariantSpec spec,
        string extension,
        CancellationToken cancellationToken = default);
}

public sealed class ImageSharpResizer : IImageResizer
{
    public async Task<(MediaVariant Variant, byte[] Bytes)> SaveOriginalAsync(
        Stream source,
        string extension,
        CancellationToken cancellationToken = default)
    {
        using var image = await Image.LoadAsync(source, cancellationToken);
        await using var ms = new MemoryStream();
        await EncodeAsync(image, ms, extension, cancellationToken);
        var bytes = ms.ToArray();
        var variant = MediaVariant.Create(
            MediaVariantKeys.Original,
            $"original{extension}",
            image.Width,
            image.Height,
            bytes.LongLength);
        return (variant, bytes);
    }

    public async Task<(MediaVariant Variant, byte[] Bytes)> CreateVariantAsync(
        Stream source,
        MediaVariantSpec spec,
        string extension,
        CancellationToken cancellationToken = default)
    {
        using var image = await Image.LoadAsync(source, cancellationToken);
        image.Mutate(ctx => ctx.Resize(new ResizeOptions
        {
            Mode = ResizeMode.Max,
            Size = new Size(spec.MaxWidth, spec.MaxHeight),
        }));

        await using var ms = new MemoryStream();
        await EncodeAsync(image, ms, extension, cancellationToken);
        var bytes = ms.ToArray();
        var variant = MediaVariant.Create(
            spec.Key,
            $"{spec.Key}{extension}",
            image.Width,
            image.Height,
            bytes.LongLength);
        return (variant, bytes);
    }

    private static async Task EncodeAsync(
        Image image,
        Stream output,
        string extension,
        CancellationToken cancellationToken)
    {
        switch (extension.ToLowerInvariant())
        {
            case ".png":
                await image.SaveAsPngAsync(output, cancellationToken);
                break;
            case ".webp":
                await image.SaveAsWebpAsync(output, new WebpEncoder { Quality = 85 }, cancellationToken);
                break;
            default:
                await image.SaveAsJpegAsync(output, new JpegEncoder { Quality = 85 }, cancellationToken);
                break;
        }
    }
}
