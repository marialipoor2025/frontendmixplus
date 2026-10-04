using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Modules.Sellers.Api;

public sealed class SellersModule : IModule
{
    public string Name => "Sellers";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<SellersDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                SellersDbContext.Schema,
                typeof(SellersDbContext).Assembly.GetName().Name));
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/sellers").WithTags("Sellers");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("SellersHealth");

        group.MapGet("/", async (SellersDbContext db, CancellationToken ct) =>
            {
                var rows = await db.Sellers.AsNoTracking()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.Name)
                    .Select(x => new { id = x.ExternalKey, name = x.Name, slug = x.Slug, rating = x.Rating })
                    .ToListAsync(ct);
                return Results.Ok(rows);
            })
            .WithName("ListSellers");
    }
}
