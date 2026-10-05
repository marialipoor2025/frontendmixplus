using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Cart.Infrastructure.Persistence;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Identity.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api;

internal static class AdminReportEndpoints
{
    public static void MapAdminReportEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/reports").WithTags("AdminReports");
        group.MapGet("/", GetReports).WithName("AdminListReports");
    }

    private static async Task<IResult> GetReports(
        CatalogDbContext catalog,
        CartDbContext cart,
        IdentityDbContext identity,
        SellersDbContext sellers,
        CancellationToken ct)
    {
        var published = await catalog.Products.AsNoTracking().CountAsync(x => x.IsPublished, ct);
        var totalProducts = await catalog.Products.AsNoTracking().CountAsync(ct);
        var customers = await identity.Users.AsNoTracking().CountAsync(ct);
        var sellersCount = await sellers.Sellers.AsNoTracking().CountAsync(ct);
        var orders = await cart.Orders.AsNoTracking().CountAsync(ct);
        var gmv = await cart.Orders.AsNoTracking().SumAsync(x => (decimal?)x.TotalAmount, ct) ?? 0;
        var pendingReviews = await catalog.Reviews.AsNoTracking()
            .CountAsync(x => x.Status == "pending", ct);

        var rows = new[]
        {
            new
            {
                id = "products-published",
                metric = "محصولات منتشر",
                period = "اکنون",
                value = published.ToString("N0"),
                change = $"{totalProducts} کل",
            },
            new
            {
                id = "customers",
                metric = "مشتریان",
                period = "اکنون",
                value = customers.ToString("N0"),
                change = "Identity",
            },
            new
            {
                id = "sellers",
                metric = "فروشندگان",
                period = "اکنون",
                value = sellersCount.ToString("N0"),
                change = "بازارگاه",
            },
            new
            {
                id = "orders",
                metric = "سفارش‌ها",
                period = "اکنون",
                value = orders.ToString("N0"),
                change = $"GMV {gmv:N0}",
            },
            new
            {
                id = "reviews-pending",
                metric = "نظرات در انتظار",
                period = "اکنون",
                value = pendingReviews.ToString("N0"),
                change = "نیازمند بررسی",
            },
        };

        return Results.Ok(rows);
    }
}
