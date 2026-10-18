using System.Text.Json;
using Microsoft.Extensions.Hosting;

namespace MixPlus.Modules.Merchandising.Infrastructure;

public sealed class CmsPageDto
{
    public string Key { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Body { get; set; } = "";
    public bool IsPublished { get; set; } = true;
}

public interface ICmsPagesStore
{
    Task<IReadOnlyList<CmsPageDto>> ListAsync(CancellationToken ct = default);
    Task<CmsPageDto?> GetAsync(string key, CancellationToken ct = default);
    Task<CmsPageDto> UpsertAsync(CmsPageDto page, CancellationToken ct = default);
    Task<bool> DeleteAsync(string key, CancellationToken ct = default);
}

public sealed class CmsPagesStore(IHostEnvironment env) : ICmsPagesStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    private readonly string _path = Path.Combine(env.ContentRootPath, "storage", "cms-pages.json");
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<IReadOnlyList<CmsPageDto>> ListAsync(CancellationToken ct = default)
    {
        var doc = await ReadAsync(ct);
        return doc.Pages.OrderBy(p => p.Key, StringComparer.OrdinalIgnoreCase).ToList();
    }

    public async Task<CmsPageDto?> GetAsync(string key, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return null;
        }

        var normalized = NormalizeKey(key);
        var doc = await ReadAsync(ct);
        return doc.Pages.FirstOrDefault(p =>
            string.Equals(p.Key, normalized, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<CmsPageDto> UpsertAsync(CmsPageDto page, CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(page.Key);
        ArgumentException.ThrowIfNullOrWhiteSpace(page.Title);

        page.Key = NormalizeKey(page.Key);
        page.Title = page.Title.Trim();
        page.Description = page.Description?.Trim() ?? "";
        page.Body = page.Body ?? "";

        await _gate.WaitAsync(ct);
        try
        {
            var doc = await ReadUnlockedAsync(ct);
            var existing = doc.Pages.FirstOrDefault(p =>
                string.Equals(p.Key, page.Key, StringComparison.OrdinalIgnoreCase));
            if (existing is null)
            {
                doc.Pages.Add(page);
            }
            else
            {
                existing.Title = page.Title;
                existing.Description = page.Description;
                existing.Body = page.Body;
                existing.IsPublished = page.IsPublished;
                page = existing;
            }

            await WriteUnlockedAsync(doc, ct);
            return page;
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<bool> DeleteAsync(string key, CancellationToken ct = default)
    {
        var normalized = NormalizeKey(key);
        await _gate.WaitAsync(ct);
        try
        {
            var doc = await ReadUnlockedAsync(ct);
            var removed = doc.Pages.RemoveAll(p =>
                string.Equals(p.Key, normalized, StringComparison.OrdinalIgnoreCase));
            if (removed > 0)
            {
                await WriteUnlockedAsync(doc, ct);
            }

            return removed > 0;
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<CmsPagesDocument> ReadAsync(CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try
        {
            return await ReadUnlockedAsync(ct);
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<CmsPagesDocument> ReadUnlockedAsync(CancellationToken ct)
    {
        if (!File.Exists(_path))
        {
            var seeded = Defaults();
            await WriteUnlockedAsync(seeded, ct);
            return seeded;
        }

        try
        {
            await using var stream = File.OpenRead(_path);
            var doc = await JsonSerializer.DeserializeAsync<CmsPagesDocument>(stream, JsonOptions, ct);
            if (doc?.Pages is null || doc.Pages.Count == 0)
            {
                return Defaults();
            }

            return doc;
        }
        catch
        {
            return Defaults();
        }
    }

    private async Task WriteUnlockedAsync(CmsPagesDocument doc, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
        await using var stream = File.Create(_path);
        await JsonSerializer.SerializeAsync(stream, doc, JsonOptions, ct);
    }

    private static string NormalizeKey(string key) =>
        key.Trim().TrimStart('/').Replace('\\', '/');

    public static CmsPagesDocument Defaults() =>
        new()
        {
            Pages =
            [
                Page("about", "درباره میکپلاس", "میکپلاس فروشگاه آنلاین لوازم خانگی است؛ این صفحه معرفی برند و مأموریت ماست."),
                Page("page/contact-us", "تماس با میکپلاس", "راه‌های ارتباط با پشتیبانی و واحدهای مرتبط.",
                    "از طریق تلفن پشتیبانی، گفتگوی آنلاین یا فرم تماس با ما در ارتباط باشید.\n\nساعات پاسخگویی در فوتر و نوار بالای سایت قابل ویرایش است."),
                Page("page/terms", "شرایط استفاده", "قوانین و شرایط استفاده از خدمات میکپلاس."),
                Page("page/privacy", "حریم خصوصی", "نحوه جمع‌آوری و استفاده از اطلاعات کاربران."),
                Page("page/bug-report", "گزارش باگ", "اشکالات فنی سایت را گزارش دهید تا سریع‌تر رفع شوند."),
                Page("page/price-policy", "ضمانت قیمت", "سیاست قیمت‌گذاری و ضمانت بهترین قیمت میکپلاس."),
                Page("faq", "پرسش‌های متداول", "پاسخ سوالات پرتکرار درباره سفارش، ارسال و خدمات پس از فروش."),
                Page("careers", "فرصت‌های شغلی", "موقعیت‌های شغلی و همکاری با تیم میکپلاس."),
                Page("newsroom", "اتاق خبر میکپلاس", "اخبار و اطلاعیه‌های رسمی میکپلاس."),
                Page("report", "گزارش تخلف در میکپلاس", "گزارش موارد مشکوک یا تخلف را از این مسیر ارسال کنید."),
                Page("b2b", "خرید سازمانی", "خرید عمده و سازمانی از میکپلاس."),
                Page("enquiry", "صدور پیش‌فاکتور", "درخواست صدور پیش‌فاکتور برای خریدهای سازمانی و عمده."),
                Page("services/install", "نصب و سرویس", "درخواست نصب و خدمات پس از فروش لوازم خانگی."),
                Page("sellers/join", "فروشنده شو", "شرایط همکاری فروشندگان و پیوستن به مارکت‌پلیس میکپلاس."),
                Page("landing/dowry", "جهیزیه", "پکیج‌ها و پیشنهادهای ویژه جهیزیه."),
            ],
        };

    private static CmsPageDto Page(string key, string title, string description, string body = "") =>
        new()
        {
            Key = key,
            Title = title,
            Description = description,
            Body = body,
            IsPublished = true,
        };

    public sealed class CmsPagesDocument
    {
        public List<CmsPageDto> Pages { get; set; } = [];
    }
}
