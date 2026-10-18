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

        var fa = System.Globalization.CultureInfo.GetCultureInfo("fa-IR");
        string Fa(int n) => n.ToString("N0", fa);
        string FaD(decimal n) => n.ToString("N0", fa);

        var rows = new[]
        {
            new
            {
                id = "products-published",
                metric = "محصولات منتشر",
                period = "اکنون",
                value = Fa(published),
                change = $"{Fa(totalProducts)} محصول کل",
            },
            new
            {
                id = "customers",
                metric = "مشتریان",
                period = "اکنون",
                value = Fa(customers),
                change = "Identity",
            },
            new
            {
                id = "sellers",
                metric = "فروشندگان",
                period = "اکنون",
                value = Fa(sellersCount),
                change = "بازارگاه",
            },
            new
            {
                id = "orders",
                metric = "سفارش‌ها",
                period = "اکنون",
                value = Fa(orders),
                change = $"GMV {FaD(gmv)}",
            },
            new
            {
                id = "reviews-pending",
                metric = "نظرات در انتظار",
                period = "اکنون",
                value = Fa(pendingReviews),
                change = "نیازمند بررسی",
            },
        };

        return Results.Ok(rows);
    }
}
