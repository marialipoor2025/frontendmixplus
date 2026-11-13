namespace MixPlus.Modules.Identity.Application.Options;

/// <summary>
/// sms.ir settings — bound from <c>Sms:SmsIr</c>.
/// API key comes from panel → برنامه‌نویسان. Docs: https://sms.ir/web-service/
/// </summary>
public sealed class SmsIrOptions
{
    public const string SectionName = "Sms:SmsIr";

    /// <summary>Panel login / account mobile (informational).</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Developer API key (x-api-key). Not the panel password unless they match.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// VERIFY template id. When 0, loads approved templates from
    /// <c>GET /v1/templates?status=2</c> and prefers type=1 (OTP).
    /// </summary>
    public int TemplateId { get; set; }

    /// <summary>
    /// Template placeholder name without # (e.g. <c>Code</c> / <c>CODE</c>).
    /// Used when <see cref="TemplateId"/> is set explicitly.
    /// </summary>
    public string ParameterName { get; set; } = "Code";
}
