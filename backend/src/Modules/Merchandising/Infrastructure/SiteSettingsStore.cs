using System.Text.Json;
using Microsoft.Extensions.Hosting;

namespace MixPlus.Modules.Merchandising.Infrastructure;

/// <summary>Marketplace-wide site config (not seller-specific).</summary>
public sealed class SiteSettingsDto
{
    public string SiteName { get; set; } = "میکس پلاس";
    public string SiteUrl { get; set; } = "https://mixplusshop.ir";
    public string BlogUrl { get; set; } = "https://mixplusshop.ir";
    public string SupportEmail { get; set; } = "support@mixplusshop.ir";
    public string DefaultCurrency { get; set; } = "IRT";
}

public interface ISiteSettingsStore
{
    Task<SiteSettingsDto> GetAsync(CancellationToken ct = default);
    Task SaveAsync(SiteSettingsDto settings, CancellationToken ct = default);
}

public sealed class SiteSettingsStore(IHostEnvironment env) : ISiteSettingsStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    private readonly string _path = Path.Combine(env.ContentRootPath, "storage", "site-settings.json");
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<SiteSettingsDto> GetAsync(CancellationToken ct = default)
    {
        await _gate.WaitAsync(ct);
        try
        {
            if (!File.Exists(_path)) return Defaults();
            await using var stream = File.OpenRead(_path);
            var dto = await JsonSerializer.DeserializeAsync<SiteSettingsDto>(stream, JsonOptions, ct);
            return Hydrate(dto ?? Defaults());
        }
        catch
        {
            return Defaults();
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task SaveAsync(SiteSettingsDto settings, CancellationToken ct = default)
    {
        await _gate.WaitAsync(ct);
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
            await using var stream = File.Create(_path);
            await JsonSerializer.SerializeAsync(stream, Hydrate(settings), JsonOptions, ct);
        }
        finally
        {
            _gate.Release();
        }
    }

    private static SiteSettingsDto Hydrate(SiteSettingsDto dto)
    {
        var d = Defaults();
        if (string.IsNullOrWhiteSpace(dto.SiteName)) dto.SiteName = d.SiteName;
        if (string.IsNullOrWhiteSpace(dto.SiteUrl)) dto.SiteUrl = d.SiteUrl;
        if (string.IsNullOrWhiteSpace(dto.BlogUrl)) dto.BlogUrl = d.BlogUrl;
        if (string.IsNullOrWhiteSpace(dto.SupportEmail)) dto.SupportEmail = d.SupportEmail;
        if (string.IsNullOrWhiteSpace(dto.DefaultCurrency)) dto.DefaultCurrency = d.DefaultCurrency;
        return dto;
    }

    public static SiteSettingsDto Defaults() => new();
}
