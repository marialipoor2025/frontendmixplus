namespace MixPlus.Modules.Identity.Application.Auth;

public sealed record StartOtpRequest(string Username);

public sealed record StartOtpResponse(
    string ChallengeId,
    string MaskedDestination,
    int ExpiresInSeconds,
    int ResendAvailableInSeconds,
    /// <summary>Only returned for Mock SMS in Development — never in production providers.</summary>
    string? DevCode);

public sealed record VerifyOtpRequest(string ChallengeId, string Code);

public sealed record ResendOtpRequest(string ChallengeId);

public sealed record AuthUserDto(
    string Id,
    string DisplayName,
    string? Phone,
    string? Email);

public sealed record VerifyOtpResponse(
    string AccessToken,
    int ExpiresInSeconds,
    AuthUserDto User);

public sealed record PasswordLoginRequest(string Username, string Password);

public sealed record ConfirmForgotPasswordRequest(
    string ChallengeId,
    string Code,
    string NewPassword);

public sealed record SetPasswordRequest(string NewPassword);
