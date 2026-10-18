using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Identity.Application.Abstractions;
using MixPlus.Modules.Identity.Application.Auth;
using MixPlus.Modules.Identity.Application.Options;
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

        services.Configure<MelipayamakOptions>(configuration.GetSection(MelipayamakOptions.SectionName));
        services.Configure<AdminStaffOptions>(configuration.GetSection(AdminStaffOptions.SectionName));

        var provider = configuration["Sms:Provider"] ?? "Mock";
        if (string.Equals(provider, "Melipayamak", StringComparison.OrdinalIgnoreCase))
        {
            services.AddHttpClient<ISmsSender, MelipayamakSmsSender>(client =>
            {
                client.Timeout = TimeSpan.FromSeconds(30);
            });
        }
        else
        {
            services.AddSingleton<ISmsSender, MockSmsSender>();
        }

        services.AddSingleton<IEmailSender, MockEmailSender>();

        services.AddScoped<IOtpAuthService, OtpAuthService>();
        services.AddScoped<IPasswordAuthService, PasswordAuthService>();
        services.AddScoped<ISessionAuthService, SessionAuthService>();
        services.AddScoped<IShopperSessionPort, ShopperSessionAdapter>();
        services.AddScoped<IAccessTokenValidator, SessionAccessTokenValidator>();
        services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/auth").WithTags("Identity");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("IdentityHealth");

        group.MapPost("/otp/start", async (StartOtpRequest body, IOtpAuthService auth, CancellationToken ct) =>
            {
                try
                {
                    var result = await auth.StartAsync(body, ct);
                    return result.IsSuccess
                        ? Results.Ok(result.Value)
                        : Results.BadRequest(new { error = result.Error });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            })
            .WithName("StartOtp");

        group.MapPost("/otp/resend", async (ResendOtpRequest body, IOtpAuthService auth, CancellationToken ct) =>
            {
                try
                {
                    var result = await auth.ResendAsync(body, ct);
                    return result.IsSuccess
                        ? Results.Ok(result.Value)
                        : Results.BadRequest(new { error = result.Error });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
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

        group.MapPost("/password/login", async (PasswordLoginRequest body, IPasswordAuthService auth, CancellationToken ct) =>
            {
                var result = await auth.LoginAsync(body, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            })
            .WithName("PasswordLogin");

        group.MapPost("/password/forgot/start", async (StartOtpRequest body, IPasswordAuthService auth, CancellationToken ct) =>
            {
                try
                {
                    var result = await auth.StartForgotAsync(body, ct);
                    return result.IsSuccess
                        ? Results.Ok(result.Value)
                        : Results.BadRequest(new { error = result.Error });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            })
            .WithName("ForgotPasswordStart");

        group.MapPost("/password/forgot/confirm", async (ConfirmForgotPasswordRequest body, IPasswordAuthService auth, CancellationToken ct) =>
            {
                var result = await auth.ConfirmForgotAsync(body, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            })
            .WithName("ForgotPasswordConfirm");

        group.MapPost("/password/set", async (HttpRequest request, SetPasswordRequest body, IPasswordAuthService auth, CancellationToken ct) =>
            {
                var result = await auth.SetPasswordAsync(ReadBearer(request), body, ct);
                if (!result.IsSuccess && result.Error == "Unauthorized")
                {
                    return Results.Unauthorized();
                }

                return result.IsSuccess
                    ? Results.NoContent()
                    : Results.BadRequest(new { error = result.Error });
            })
            .WithName("SetPassword");

        group.MapGet("/me", async (HttpRequest request, ISessionAuthService sessions, CancellationToken ct) =>
            {
                var result = await sessions.GetMeAsync(ReadBearer(request), ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.Unauthorized();
            })
            .WithName("AuthMe");

        group.MapPut("/profile", async (
                HttpRequest request,
                UpdateProfileRequest body,
                IdentityDbContext db,
                ISessionAuthService sessions,
                CancellationToken ct) =>
            {
                var me = await sessions.GetMeAsync(ReadBearer(request), ct);
                if (!me.IsSuccess)
                {
                    return Results.Unauthorized();
                }

                if (!Guid.TryParse(me.Value.Id, out var userId))
                {
                    return Results.Unauthorized();
                }

                var first = (body.FirstName ?? string.Empty).Trim();
                var last = (body.LastName ?? string.Empty).Trim();
                var display = string.Join(" ", new[] { first, last }.Where(s => s.Length > 0));
                if (string.IsNullOrWhiteSpace(display) && !string.IsNullOrWhiteSpace(body.DisplayName))
                {
                    display = body.DisplayName.Trim();
                }

                if (string.IsNullOrWhiteSpace(display))
                {
                    return Results.BadRequest(new { error = "نام نمایشی الزامی است" });
                }

                if (display.Length > 200)
                {
                    return Results.BadRequest(new { error = "نام بیش از حد طولانی است" });
                }

                // Reject Unicode replacement chars from wrong encodings.
                if (display.Contains('\uFFFD'))
                {
                    return Results.BadRequest(new { error = "\u06A9\u062F\u06AF\u0630\u0627\u0631\u06CC \u0646\u0627\u0645 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
                }

                var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
                if (user is null)
                {
                    return Results.Unauthorized();
                }

                try
                {
                    user.UpdateDisplayName(display);
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }

                await db.SaveChangesAsync(ct);
                return Results.Ok(new AuthUserDto(
                    user.Id.ToString("D"),
                    user.DisplayName,
                    user.Phone,
                    user.Email));
            })
            .WithName("UpdateAuthProfile");

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
        endpoints.MapAdminStaffEndpoints();
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

    private sealed record UpdateProfileRequest(
        string? FirstName,
        string? LastName,
        string? DisplayName);
}
