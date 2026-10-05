using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Merchandising.Application.Home;
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

        endpoints.MapAdminCmsEndpoints();
    }
}
