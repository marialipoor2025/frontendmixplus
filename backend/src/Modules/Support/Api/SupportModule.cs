using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;

namespace MixPlus.Modules.Support.Api;

/// <summary>
/// Stub — support chat, enquiry, FAQ content. Deferred until support APIs are needed.
/// </summary>
public sealed class SupportModule : IModule
{
    public string Name => "Support";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/support/health", () =>
                Results.Ok(new { module = Name, status = "stub" }))
            .WithTags("Support")
            .WithName("SupportHealth");
    }
}
