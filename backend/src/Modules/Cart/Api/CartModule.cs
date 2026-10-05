using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Cart.Infrastructure.Persistence;

namespace MixPlus.Modules.Cart.Api;

public sealed class CartModule : IModule
{
    public string Name => "Cart";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CartDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                CartDbContext.Schema,
                typeof(CartDbContext).Assembly.GetName().Name));
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/cart/health", () =>
                Results.Ok(new { module = Name, status = "ready" }))
            .WithTags("Cart")
            .WithName("CartHealth");

        endpoints.MapAdminOrderEndpoints();
    }
}
