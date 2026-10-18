using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Merchandising.Application.Home;
using MixPlus.Modules.Merchandising.Infrastructure;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;

namespace MixPlus.Modules.Merchandising.Api;

public sealed class MerchandisingModule : IModule
{
    public string Name => "Merchandising";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<MerchandisingDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                MerchandisingDbContext.Schema,
                typeof(MerchandisingDbContext).Assembly.GetName().Name));

        services.AddScoped<IGetHomePageQuery, GetHomePageQuery>();
        services.AddSingleton<IFooterSettingsStore, FooterSettingsStore>();
        services.AddSingleton<ICmsPagesStore, CmsPagesStore>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/home", async (IGetHomePageQuery query, CancellationToken ct) =>
            {
                var result = await query.ExecuteAsync(ct);
                return result.IsSuccess
                    ? Results.Json(result.Value)
                    : Results.NotFound(new { error = result.Error });
            })
            .WithTags("Merchandising")
            .WithName("GetHomePage");

        endpoints.MapGet("/api/merchandising/health", () =>
                Results.Ok(new { module = Name, status = "ready" }))
            .WithTags("Merchandising")
            .WithName("MerchandisingHealth");

        endpoints.MapGet("/api/merchandising/footer", async (IFooterSettingsStore store, CancellationToken ct) =>
                Results.Ok(await store.GetAsync(ct)))
            .WithTags("Merchandising")
            .WithName("GetFooterSettings");

        endpoints.MapPost("/api/merchandising/newsletter", async (
                NewsletterRequest body,
                IHostEnvironment env,
                CancellationToken ct) =>
            {
                var email = body.Email?.Trim() ?? "";
                if (email.Length < 5 || !email.Contains('@'))
                {
                    return Results.BadRequest(new { error = "ایمیل نامعتبر است" });
                }

                var dir = Path.Combine(env.ContentRootPath, "storage");
                Directory.CreateDirectory(dir);
                var path = Path.Combine(dir, "newsletter-emails.txt");
                await File.AppendAllTextAsync(path, email + Environment.NewLine, ct);
                return Results.Ok(new { ok = true });
            })
            .WithTags("Merchandising")
            .WithName("SubscribeNewsletter");

        endpoints.MapGet("/api/admin/merchandising/footer", async (IFooterSettingsStore store, CancellationToken ct) =>
                Results.Ok(await store.GetAsync(ct)))
            .WithTags("AdminCms")
            .WithName("AdminGetFooterSettings");

        endpoints.MapPut("/api/admin/merchandising/footer", async (
                FooterSettingsDto body,
                IFooterSettingsStore store,
                CancellationToken ct) =>
            {
                await store.SaveAsync(body, ct);
                return Results.Ok(await store.GetAsync(ct));
            })
            .WithTags("AdminCms")
            .WithName("AdminSaveFooterSettings");

        endpoints.MapAdminCmsEndpoints();
        endpoints.MapAdminRailsEndpoints();
        endpoints.MapAdminCmsPagesEndpoints();
    }

    private sealed record NewsletterRequest(string? Email);
}
