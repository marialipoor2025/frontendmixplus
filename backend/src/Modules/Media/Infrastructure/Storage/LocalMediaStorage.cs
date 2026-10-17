using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MixPlus.Modules.Media.Application;

namespace MixPlus.Modules.Media.Infrastructure.Storage;

public interface ILocalMediaStorage
{
    string RootPath { get; }
    Task WriteAsync(string relativePath, Stream content, CancellationToken cancellationToken = default);
    Stream? OpenRead(string relativePath);
}

/// <summary>
/// Stores originals + pre-generated viewport variants on the deploy host disk
/// (not resized on the fly at request time).
/// </summary>
public sealed class LocalMediaStorage(IOptions<MediaOptions> options, IHostEnvironment env) : ILocalMediaStorage
{
    private readonly string _root = ResolveRoot(options.Value.RootPath, env.ContentRootPath);

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

    private static string ResolveRoot(string configured, string contentRoot)
    {
        var path = string.IsNullOrWhiteSpace(configured) ? "storage/media" : configured.Trim();
        if (!Path.IsPathRooted(path))
        {
            path = Path.Combine(contentRoot, path);
        }

        var full = Path.GetFullPath(path);
        Directory.CreateDirectory(full);
        return full;
    }
}
