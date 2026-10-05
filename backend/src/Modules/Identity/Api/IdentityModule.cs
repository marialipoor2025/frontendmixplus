using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Identity.Application.Abstractions;
using MixPlus.Modules.Identity.Application.Auth;
using MixPlus.Modules.Identity.Infrastructure;
using MixPlus.Modules.Identity.Infrastructure.Messaging;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Api;

public sealed class IdentityModule : IModule
{
    public string Name => "Identity";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                IdentityDbContext.Schema,
                typeof(IdentityDbContext).Assembly.GetName().Name));

        var provider = configuration["Sms:Provider"] ?? "Mock";
        if (string.Equals(provider, "Mock", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<ISmsSender, MockSmsSender>();
            services.AddSingleton<IEmailSender, MockEmailSender>();
        }
        else
        {
            // Future: register HttpSmsSender / Kavenegar / etc.
            services.AddSingleton<ISmsSender, MockSmsSender>();
            services.AddSingleton<IEmailSender, MockEmailSender>();
        }

        services.AddScoped<IOtpAuthService, OtpAuthService>();
        services.AddScoped<ISessionAuthService, SessionAuthService>();
        services.AddScoped<IAccessTokenValidator, SessionAccessTokenValidator>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/auth").WithTags("Identity");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("IdentityHealth");

        group.MapPost("/otp/start", async (StartOtpRequest body, IOtpAuthService auth, CancellationToken ct) =>
            {
                var result = await auth.StartAsync(body, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            })
            .WithName("StartOtp");

        group.MapPost("/otp/resend", async (ResendOtpRequest body, IOtpAuthService auth, CancellationToken ct) =>
            {
                var result = await auth.ResendAsync(body, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            })
            .WithName("ResendOtp");

        group.MapPost("/otp/verify", async (VerifyOtpRequest body, IOtpAuthService auth, CancellationToken ct) =>
            {
                var result = await auth.VerifyAsync(body, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            })
            .WithName("VerifyOtp");

        group.MapGet("/me", async (HttpRequest request, ISessionAuthService sessions, CancellationToken ct) =>
            {
                var result = await sessions.GetMeAsync(ReadBearer(request), ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.Unauthorized();
            })
            .WithName("AuthMe");

        group.MapPost("/logout", async (HttpRequest request, ISessionAuthService sessions, CancellationToken ct) =>
            {
                await sessions.LogoutAsync(ReadBearer(request), ct);
                return Results.NoContent();
            })
            .WithName("AuthLogout");

        endpoints.MapWishlistEndpoints();
        endpoints.MapAdminCustomerEndpoints();
        endpoints.MapAdminAuditEndpoints();
        endpoints.MapAdminRoleEndpoints();
    }

    private static string? ReadBearer(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header))
        {
            return null;
        }

        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }
}
