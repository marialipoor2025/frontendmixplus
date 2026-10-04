using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;

namespace MixPlus.Modules.Cart.Api;

/// <summary>
/// Stub — cart &amp; checkout. Deferred until cart UI is built outside-in.
/// </summary>
public sealed class CartModule : IModule
{
    public string Name => "Cart";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/cart/health", () =>
                Results.Ok(new { module = Name, status = "stub" }))
            .WithTags("Cart")
            .WithName("CartHealth");
    }
}
