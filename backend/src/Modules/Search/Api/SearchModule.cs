using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;

namespace MixPlus.Modules.Search.Api;

/// <summary>
/// Stub — search &amp; discovery. Deferred until search PLP is built outside-in.
/// </summary>
public sealed class SearchModule : IModule
{
    public string Name => "Search";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/search/health", () =>
                Results.Ok(new { module = Name, status = "stub" }))
            .WithTags("Search")
            .WithName("SearchHealth");
    }
}
