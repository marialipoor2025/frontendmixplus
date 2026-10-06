using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MixPlus.Modules.Identity.Application.Abstractions;
using MixPlus.Modules.Identity.Application.Options;

namespace MixPlus.Modules.Identity.Infrastructure.Messaging;

/// <summary>
/// Melipayamak <c>SendOtp</c> REST adapter.
/// See https://www.melipayamak.com/api/sendotp/
/// </summary>
public sealed class MelipayamakSmsSender(
    HttpClient http,
    IOptions<MelipayamakOptions> options,
    ILogger<MelipayamakSmsSender> logger) : ISmsSender
{
    public async Task SendOtpAsync(
        string phone,
        string code,
        CancellationToken cancellationToken = default)
    {
        var opts = options.Value;
        if (string.IsNullOrWhiteSpace(opts.Username) || string.IsNullOrWhiteSpace(opts.Password))
        {
            throw new InvalidOperationException(
                "Sms:Melipayamak Username/Password is not configured. Use appsettings.Local.json or environment variables.");
        }

        if (!int.TryParse(code, NumberStyles.None, CultureInfo.InvariantCulture, out var codeInt))
        {
            throw new InvalidOperationException("OTP code must be numeric for Melipayamak SendOtp.");
        }

        var to = NormalizeIranMobile(phone);
        using var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["username"] = opts.Username.Trim(),
            ["password"] = opts.Password,
            ["to"] = to,
            ["from"] = opts.From?.Trim() ?? string.Empty,
            ["code"] = codeInt.ToString(CultureInfo.InvariantCulture),
        });

        using var request = new HttpRequestMessage(HttpMethod.Post, opts.RestUrl)
        {
            Content = form,
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        logger.LogInformation("Melipayamak SendOtp to={Phone}", to);
        using var response = await http.SendAsync(request, cancellationToken);
        var body = (await response.Content.ReadAsStringAsync(cancellationToken)).Trim();

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError(
                "Melipayamak HTTP {Status}: {Body}",
                (int)response.StatusCode,
                body);
            throw new InvalidOperationException("ارسال پیامک یک‌بارمصرف ناموفق بود.");
        }

        var value = ExtractReturnValue(body);
        if (IsSuccessRecId(value))
        {
            logger.LogInformation("Melipayamak SendOtp ok recId={RecId}", value);
            return;
        }

        var message = MapError(value);
        logger.LogWarning("Melipayamak SendOtp rejected: raw={Raw} value={Value} → {Message}", body, value, message);
        throw new InvalidOperationException(message);
    }

    private static string ExtractReturnValue(string raw)
    {
        // REST often returns {"Value":"123","RetStatus":1,"StrRetStatus":"Ok"}
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (doc.RootElement.TryGetProperty("Value", out var valueProp))
            {
                return valueProp.ValueKind switch
                {
                    JsonValueKind.Number => valueProp.GetRawText(),
                    JsonValueKind.String => valueProp.GetString() ?? string.Empty,
                    _ => valueProp.ToString(),
                };
            }
        }
        catch (JsonException)
        {
            // plain string / number body
        }

        return raw.Trim().Trim('"');
    }

    private static bool IsSuccessRecId(string value)
    {
        var s = value.Trim();
        if (s.StartsWith("-", StringComparison.Ordinal) || s.Equals("0", StringComparison.Ordinal))
        {
            return false;
        }

        return long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var id) && id > 20;
    }

    private static string MapError(string value)
    {
        var s = value.Trim();
        return s switch
        {
            "0" => "نام کاربری یا رمز عبور پیامک نادرست است.",
            "2" => "اعتبار پنل پیامک کافی نیست.",
            "3" => "محدودیت ارسال روزانه پیامک.",
            "5" => "شماره فرستنده معتبر نیست — Sms:Melipayamak:From را در appsettings.Local.json تنظیم کنید.",
            "9" => "ارسال از خطوط عمومی از طریق وب‌سرویس ممکن نیست؛ خط اختصاصی تنظیم کنید.",
            "10" => "کاربر پنل پیامک غیرفعال است.",
            "11" => "پیامک ارسال نشد — معمولاً شماره فرستنده (From) خالی/نامعتبر است. در پنل ملی‌پیامک خط ارسال را بگیرید و در Sms:Melipayamak:From بگذارید.",
            "12" => "مدارک پنل پیامک کامل نیست.",
            "18" => "شماره گیرنده نامعتبر است.",
            "35" => "شماره در لیست سیاه مخابرات است.",
            "108" or "109" or "110" or "111" or "-IP" =>
                "دسترسی API پیامک محدود است (IP/ApiKey). در پنل ملی‌پیامک IP سرور را مجاز کنید.",
            _ => $"ارسال پیامک ناموفق بود (کد {s}).",
        };
    }

    private static string NormalizeIranMobile(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
        {
            digits = "0" + digits[2..];
        }

        return digits;
    }
}
