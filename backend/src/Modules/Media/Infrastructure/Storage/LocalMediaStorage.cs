using Microsoft.Extensions.Options;
using MixPlus.Modules.Media.Application;

namespace MixPlus.Modules.Media.Infrastructure.Storage;

public interface ILocalMediaStorage
{
    string RootPath { get; }
    Task WriteAsync(string relativePath, Stream content, CancellationToken cancellationToken = default);
    Stream? OpenRead(string relativePath);
}

public sealed class LocalMediaStorage(IOptions<MediaOptions> options) : ILocalMediaStorage
{
    private readonly string _root = Path.GetFullPath(options.Value.RootPath);

    public string RootPath => _root;

    public async Task WriteAsync(string relativePath, Stream content, CancellationToken cancellationToken = default)
    {
        var full = Resolve(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(full)!);
        await using var file = File.Create(full);
        await content.CopyToAsync(file, cancellationToken);
    }

    public Stream? OpenRead(string relativePath)
    {
        var full = Resolve(relativePath);
        if (!File.Exists(full))
        {
            return null;
        }

        return File.OpenRead(full);
    }

    private string Resolve(string relativePath)
    {
        var normalized = relativePath.Replace('\\', '/').TrimStart('/');
        var full = Path.GetFullPath(Path.Combine(_root, normalized));
        if (!full.StartsWith(_root, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid media path.");
        }

        return full;
    }
}
