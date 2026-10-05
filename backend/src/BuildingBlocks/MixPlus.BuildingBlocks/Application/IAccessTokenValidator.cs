namespace MixPlus.BuildingBlocks.Application;

/// <summary>
/// Cross-module port for validating opaque session tokens (implemented by Identity).
/// </summary>
public interface IAccessTokenValidator
{
    Task<bool> IsValidAsync(string? accessToken, CancellationToken cancellationToken = default);
}
