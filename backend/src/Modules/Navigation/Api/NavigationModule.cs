using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Navigation.Application;
using MixPlus.Modules.Navigation.Infrastructure.Persistence;

namespace MixPlus.Modules.Navigation.Api;

public sealed class NavigationModule : IModule
{
    public string Name => "Navigation";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<NavigationDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                NavigationDbContext.Schema,
                typeof(NavigationDbContext).Assembly.GetName().Name));

        services.AddScoped<IGetMainNavQuery, GetMainNavQuery>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/nav", async (IGetMainNavQuery query, CancellationToken ct) =>
            {
                var result = await query.ExecuteAsync(ct);
                return result.IsSuccess
                    ? Results.Json(result.Value)
                    : Results.NotFound(new { error = result.Error });
            })
            .WithTags("Navigation")
            .WithName("GetMainNav");

        endpoints.MapGet("/api/navigation/health", () =>
                Results.Ok(new { module = Name, status = "ready" }))
            .WithTags("Navigation")
            .WithName("NavigationHealth");
    }
}
