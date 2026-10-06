namespace MixPlus.Modules.Identity.Application.Options;

/// <summary>
/// Melipayamak SendOtp settings — bound from <c>Sms:Melipayamak</c>.
/// Secrets live in env vars or <c>appsettings.Local.json</c>, never in source.
/// Docs: https://www.melipayamak.com/api/sendotp/
/// </summary>
public sealed class MelipayamakOptions
{
    public const string SectionName = "Sms:Melipayamak";

    /// <summary>Panel username (often a mobile number).</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Panel password or API key.</summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>Sender line; empty uses account default shared line when allowed.</summary>
    public string From { get; set; } = string.Empty;

    /// <summary>REST endpoint for SendOtp.</summary>
    public string RestUrl { get; set; } = "https://rest.payamak-panel.com/api/SendSMS/SendOtp";
}
