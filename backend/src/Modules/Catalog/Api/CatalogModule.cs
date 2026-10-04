using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Catalog.Application.Abstractions;
using MixPlus.Modules.Catalog.Application.Products;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Infrastructure;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

public sealed class CatalogModule : IModule
{
    public string Name => "Catalog";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CatalogDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                CatalogDbContext.Schema,
                typeof(CatalogDbContext).Assembly.GetName().Name));

        services.AddScoped<ICatalogDbContext>(sp => sp.GetRequiredService<CatalogDbContext>());
        services.AddScoped<IProductCardReadPort, CatalogProductCardReadPort>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/catalog").WithTags("Catalog");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("CatalogHealth");

        group.MapGet("/products", async (CatalogDbContext db, CancellationToken ct) =>
            {
                var rows = await db.Products.AsNoTracking()
                    .Where(x => x.IsPublished)
                    .OrderBy(x => x.Title)
                    .ToListAsync(ct);
                return Results.Ok(rows.Select(ToDto).ToList());
            })
            .WithName("ListCatalogProducts");

        group.MapGet("/brands", async (CatalogDbContext db, CancellationToken ct) =>
            {
                var rows = await db.Brands.AsNoTracking()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.Name)
                    .Select(x => new BrandDto(x.ExternalKey, x.Name, x.Slug, x.LogoUrl))
                    .ToListAsync(ct);
                return Results.Ok(rows);
            })
            .WithName("ListCatalogBrands");

        group.MapGet("/categories", async (CatalogDbContext db, CancellationToken ct) =>
            {
                var rows = await db.Categories.AsNoTracking()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.SortOrder)
                    .Select(x => new CategoryDto(x.ExternalKey, x.Title, x.Href, x.ImageUrl))
                    .ToListAsync(ct);
                return Results.Ok(rows);
            })
            .WithName("ListCatalogCategories");

        endpoints.MapAdminCatalogEndpoints();
    }

    private static ProductCardDto ToDto(Product product)
    {
        IReadOnlyList<string>? badges = null;
        if (!string.IsNullOrWhiteSpace(product.BadgesJson))
        {
            badges = JsonSerializer.Deserialize<List<string>>(product.BadgesJson);
        }

        return new ProductCardDto(
            product.ExternalKey,
            product.Title,
            product.Slug,
            product.ImageUrl,
            product.BrandExternalKey,
            product.BrandName,
            product.BrandLogoUrl,
            product.SellerExternalKey,
            product.SellerName,
            new MoneyDto(product.Price.Amount, product.Price.Currency),
            product.OriginalPrice is null
                ? null
                : new MoneyDto(product.OriginalPrice.Amount, product.OriginalPrice.Currency),
            product.DiscountPercent,
            product.Rating,
            product.ReviewCount,
            badges,
            product.Condition == ProductCondition.Used ? "used" : "new",
            product.InStock);
    }
}
