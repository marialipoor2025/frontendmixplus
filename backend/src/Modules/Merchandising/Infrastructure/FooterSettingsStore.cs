using System.Text.Json;
using Microsoft.Extensions.Hosting;

namespace MixPlus.Modules.Merchandising.Infrastructure;

public sealed class FooterPartnerDto
{
    public string Label { get; set; } = "";
    public string Href { get; set; } = "";
    public string Icon { get; set; } = "";
    public bool Visible { get; set; } = true;
}

public sealed class FooterTrustSealDto
{
    public string Label { get; set; } = "";
    public string Src { get; set; } = "";
    public bool Visible { get; set; } = true;
}

public sealed class FooterSettingsDto
{
    public bool ShowTrustSeals { get; set; } = true;
    public bool ShowPartners { get; set; } = true;
    public List<FooterTrustSealDto> TrustSeals { get; set; } = [];
    public List<FooterPartnerDto> Partners { get; set; } = [];

    /// <summary>Footer primary support phone line (display).</summary>
    public string PhonePrimary { get; set; } = "تلفن پشتیبانی ۶۱۹۳۰۰۰۰ - ۰۲۱";

    /// <summary>Footer secondary phone line (display).</summary>
    public string PhoneSecondary { get; set; } = "۰۲۱-۹۱۰۰۰۱۰۰";

    /// <summary>Footer availability / working-hours line.</summary>
    public string HoursLine { get; set; } = "۷ روز هفته، ۲۴ ساعته پاسخگوی شما هستیم";

    /// <summary>Header top-bar short hours text.</summary>
    public string HeaderHours { get; set; } = "از ساعت ۹ تا ۱۷ در روزهای کاری پاسخگوی شما هستیم";

    /// <summary>Header top-bar phone (display, Persian digits OK).</summary>
    public string HeaderPhone { get; set; } = "۰۲۱-۶۱۹۳۰۰۰۰";

    /// <summary>tel: href for header phone link.</summary>
    public string HeaderPhoneTel { get; set; } = "+982161930000";
}

public interface IFooterSettingsStore
{
    Task<FooterSettingsDto> GetAsync(CancellationToken ct = default);
    Task SaveAsync(FooterSettingsDto settings, CancellationToken ct = default);
}

public sealed class FooterSettingsStore(IHostEnvironment env) : IFooterSettingsStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    private readonly string _path = Path.Combine(env.ContentRootPath, "storage", "footer-settings.json");
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<FooterSettingsDto> GetAsync(CancellationToken ct = default)
    {
        await _gate.WaitAsync(ct);
        try
        {
            if (!File.Exists(_path))
            {
                return Defaults();
            }

            await using var stream = File.OpenRead(_path);
            var dto = await JsonSerializer.DeserializeAsync<FooterSettingsDto>(stream, JsonOptions, ct);
            if (dto is null || dto.TrustSeals.Count == 0)
            {
                return Defaults();
            }

            return HydrateContactDefaults(dto);
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

    public async Task SaveAsync(FooterSettingsDto settings, CancellationToken ct = default)
    {
        await _gate.WaitAsync(ct);
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
            await using var stream = File.Create(_path);
            await JsonSerializer.SerializeAsync(stream, settings, JsonOptions, ct);
        }
        finally
        {
            _gate.Release();
        }
    }

    private static FooterSettingsDto HydrateContactDefaults(FooterSettingsDto dto)
    {
        var defaults = Defaults();
        if (string.IsNullOrWhiteSpace(dto.PhonePrimary)) dto.PhonePrimary = defaults.PhonePrimary;
        if (string.IsNullOrWhiteSpace(dto.PhoneSecondary)) dto.PhoneSecondary = defaults.PhoneSecondary;
        if (string.IsNullOrWhiteSpace(dto.HoursLine)) dto.HoursLine = defaults.HoursLine;
        if (string.IsNullOrWhiteSpace(dto.HeaderHours)) dto.HeaderHours = defaults.HeaderHours;
        if (string.IsNullOrWhiteSpace(dto.HeaderPhone)) dto.HeaderPhone = defaults.HeaderPhone;
        if (string.IsNullOrWhiteSpace(dto.HeaderPhoneTel)) dto.HeaderPhoneTel = defaults.HeaderPhoneTel;
        return dto;
    }

    public static FooterSettingsDto Defaults() =>
        new()
        {
            ShowTrustSeals = true,
            ShowPartners = true,
            PhonePrimary = "تلفن پشتیبانی ۶۱۹۳۰۰۰۰ - ۰۲۱",
            PhoneSecondary = "۰۲۱-۹۱۰۰۰۱۰۰",
            HoursLine = "۷ روز هفته، ۲۴ ساعته پاسخگوی شما هستیم",
            HeaderHours = "از ساعت ۹ تا ۱۷ در روزهای کاری پاسخگوی شما هستیم",
            HeaderPhone = "۰۲۱-۶۱۹۳۰۰۰۰",
            HeaderPhoneTel = "+982161930000",
            TrustSeals =
            [
                new() { Label = "نماد کسب و کارهای مجازی", Src = "/images/footer/nemads/kasbokar.webp", Visible = true },
                new() { Label = "نشان ملی ثبت", Src = "/images/footer/nemads/rezi.webp", Visible = true },
                new() { Label = "سامانه پایش", Src = "/images/footer/nemads/sapra.webp", Visible = true },
            ],
            Partners =
            [
                new() { Label = "مجله اینترنتی دیجی‌کالا مگ", Href = "https://www.digikala.com/mag/", Icon = "/images/footer/partners/mag.svg", Visible = true },
                new() { Label = "دیجی‌پی", Href = "https://www.mydigipay.com/", Icon = "/images/footer/partners/digipay.svg", Visible = true },
                new() { Label = "دیجی‌استایل", Href = "https://www.digistyle.com/", Icon = "/images/footer/partners/digistyle.svg", Visible = true },
                new() { Label = "دیجی‌کالا پلاس", Href = "/plus/landing", Icon = "/images/footer/partners/digiplus.svg", Visible = false },
                new() { Label = "دیجی کلاب", Href = "/digiclub", Icon = "/images/footer/partners/digiclub.svg", Visible = false },
            ],
        };
}
