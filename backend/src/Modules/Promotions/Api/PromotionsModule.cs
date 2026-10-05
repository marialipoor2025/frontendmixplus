using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Promotions.Infrastructure;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Modules.Promotions.Api;

public sealed class PromotionsModule : IModule
{
    public string Name => "Promotions";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PromotionsDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                PromotionsDbContext.Schema,
                typeof(PromotionsDbContext).Assembly.GetName().Name));

        services.AddScoped<IOfferCampaignReadPort, OfferCampaignReadPort>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/promotions").WithTags("Promotions");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("PromotionsHealth");

        endpoints.MapAdminPromotionEndpoints();
    }
}
