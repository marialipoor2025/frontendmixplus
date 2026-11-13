using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MixPlus.Modules.Identity.Application.Abstractions;
using MixPlus.Modules.Identity.Application.Options;

namespace MixPlus.Modules.Identity.Infrastructure.Messaging;

/// <summary>
/// sms.ir VERIFY send — <c>POST /v1/send/verify</c>.
/// Resolves <c>TemplateId</c> from config or <c>GET /v1/templates?status=2</c>.
/// </summary>
public sealed class SmsIrSmsSender(
    HttpClient http,
    IOptions<SmsIrOptions> options,
    ILogger<SmsIrSmsSender> logger) : ISmsSender
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly SemaphoreSlim _resolveLock = new(1, 1);
    private int? _resolvedTemplateId;
    private string? _resolvedParameterName;

    public async Task SendOtpAsync(
        string phone,
        string code,
        CancellationToken cancellationToken = default)
    {
        var opts = options.Value;
        if (string.IsNullOrWhiteSpace(opts.ApiKey))
        {
            throw new InvalidOperationException(
                "Sms:SmsIr:ApiKey تنظیم نشده است. کلید را از بخش برنامه‌نویسان پنل sms.ir بگیرید.");
        }

        var (templateId, parameterName) = await ResolveTemplateAsync(opts, cancellationToken);
        var mobile = NormalizeIranMobile(phone);
        var value = code.Length > 25 ? code[..25] : code;

        var body = new VerifySendRequest
        {
            Mobile = mobile,
            TemplateId = templateId,
            Parameters =
            [
                new VerifySendParameterDto
                {
                    Name = parameterName,
                    Value = value,
                },
            ],
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sms.ir/v1/send/verify")
        {
            Content = JsonContent.Create(body, options: JsonOpts),
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.TryAddWithoutValidation("x-api-key", opts.ApiKey.Trim());

        logger.LogInformation(
            "sms.ir VERIFY to={Phone} template={TemplateId} param={Param}",
            mobile,
            templateId,
            parameterName);

        using var response = await http.SendAsync(request, cancellationToken);
        var raw = (await response.Content.ReadAsStringAsync(cancellationToken)).Trim();

        VerifyApiResponse? parsed = null;
        try
        {
            parsed = JsonSerializer.Deserialize<VerifyApiResponse>(raw, JsonOpts);
        }
        catch (JsonException)
        {
            // fall through
        }

        if (!response.IsSuccessStatusCode || parsed is null || parsed.Status != 1)
        {
            logger.LogWarning(
                "sms.ir VERIFY rejected http={Status} body={Body}",
                (int)response.StatusCode,
                raw);
            throw new InvalidOperationException(MapFailure(parsed, raw));
        }

        logger.LogInformation(
            "sms.ir VERIFY ok messageId={MessageId} cost={Cost}",
            parsed.Data?.MessageId,
            parsed.Data?.Cost);
    }

    private async Task<(int TemplateId, string ParameterName)> ResolveTemplateAsync(
        SmsIrOptions opts,
        CancellationToken cancellationToken)
    {
        if (opts.TemplateId > 0)
        {
            var configuredName = string.IsNullOrWhiteSpace(opts.ParameterName)
                ? "Code"
                : opts.ParameterName.Trim();
            return (opts.TemplateId, configuredName);
        }

        if (_resolvedTemplateId is > 0 && !string.IsNullOrWhiteSpace(_resolvedParameterName))
        {
            return (_resolvedTemplateId.Value, _resolvedParameterName!);
        }

        await _resolveLock.WaitAsync(cancellationToken);
        try
        {
            if (_resolvedTemplateId is > 0 && !string.IsNullOrWhiteSpace(_resolvedParameterName))
            {
                return (_resolvedTemplateId.Value, _resolvedParameterName!);
            }

            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                "https://api.sms.ir/v1/templates?pageNumber=1&pageSize=100&status=2");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.TryAddWithoutValidation("x-api-key", opts.ApiKey.Trim());

            using var response = await http.SendAsync(request, cancellationToken);
            var raw = await response.Content.ReadAsStringAsync(cancellationToken);
            var list = JsonSerializer.Deserialize<TemplatesApiResponse>(raw, JsonOpts);
            if (!response.IsSuccessStatusCode || list?.Status != 1 || list.Data is null || list.Data.Count == 0)
            {
                throw new InvalidOperationException(
                    "هیچ قالب تایید‌شده‌ای در sms.ir نیست. در پنل → ارسال سریع یک قالب OTP بسازید و منتظر تایید بمانید.");
            }

            // Prefer OTP type (1), else any approved template that has a code-like parameter.
            var template =
                list.Data.FirstOrDefault(t => t.Type == 1)
                ?? list.Data.FirstOrDefault(t =>
                    t.Parameters?.Any(p => IsCodeParameter(p.Name)) == true)
                ?? list.Data[0];

            var param =
                template.Parameters?.FirstOrDefault(p => IsCodeParameter(p.Name))
                ?? template.Parameters?.FirstOrDefault()
                ?? new TemplateParameterDto { Name = "Code" };

            if (template.Id <= 0 || string.IsNullOrWhiteSpace(param.Name))
            {
                throw new InvalidOperationException(
                    "قالب تایید‌شده sms.ir معتبر نیست یا پارامتر کد ندارد.");
            }

            _resolvedTemplateId = template.Id;
            _resolvedParameterName = param.Name.Trim();
            logger.LogInformation(
                "sms.ir resolved template id={Id} title={Title} param={Param}",
                template.Id,
                template.Title,
                _resolvedParameterName);

            return (_resolvedTemplateId.Value, _resolvedParameterName!);
        }
        finally
        {
            _resolveLock.Release();
        }
    }

    private static bool IsCodeParameter(string? name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        var n = name.Trim();
        return n.Equals("Code", StringComparison.OrdinalIgnoreCase)
            || n.Equals("CODE", StringComparison.OrdinalIgnoreCase)
            || n.Equals("Otp", StringComparison.OrdinalIgnoreCase)
            || n.Equals("VerificationCode", StringComparison.OrdinalIgnoreCase);
    }

    private static string MapFailure(VerifyApiResponse? parsed, string raw)
    {
        if (!string.IsNullOrWhiteSpace(parsed?.Message))
        {
            return $"ارسال پیامک sms.ir ناموفق بود: {parsed.Message}";
        }

        return string.IsNullOrWhiteSpace(raw)
            ? "ارسال پیامک یک‌بارمصرف از طریق sms.ir ناموفق بود."
            : $"ارسال پیامک sms.ir ناموفق بود ({raw})";
    }

    /// <summary>sms.ir expects 10-digit mobiles like 9120000000 (no leading 0).</summary>
    private static string NormalizeIranMobile(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
        {
            digits = digits[2..];
        }
        else if (digits.StartsWith("0", StringComparison.Ordinal) && digits.Length == 11)
        {
            digits = digits[1..];
        }

        return digits;
    }

    private sealed class VerifySendRequest
    {
        public string Mobile { get; set; } = string.Empty;
        public int TemplateId { get; set; }
        public VerifySendParameterDto[] Parameters { get; set; } = [];
    }

    private sealed class VerifySendParameterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    private sealed class VerifyApiResponse
    {
        public int Status { get; set; }
        public string? Message { get; set; }
        public VerifySendData? Data { get; set; }
    }

    private sealed class VerifySendData
    {
        public long MessageId { get; set; }
        public decimal Cost { get; set; }
    }

    private sealed class TemplatesApiResponse
    {
        public int Status { get; set; }
        public string? Message { get; set; }
        public List<TemplateDto>? Data { get; set; }
    }

    private sealed class TemplateDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? TemplateText { get; set; }
        public byte Type { get; set; }
        public byte Status { get; set; }
        public List<TemplateParameterDto>? Parameters { get; set; }
    }

    private sealed class TemplateParameterDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
