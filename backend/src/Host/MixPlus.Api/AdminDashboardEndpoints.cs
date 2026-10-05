using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Cart.Infrastructure.Persistence;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;
using MixPlus.Modules.Identity.Infrastructure.Persistence;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;
using MixPlus.Modules.Sellers.Infrastructure.Persistence;

namespace MixPlus.Api;

internal static class AdminDashboardEndpoints
{
    public static void MapAdminDashboardEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/dashboard").WithTags("AdminDashboard");
        group.MapGet("/stats", GetStats).WithName("AdminDashboardStats");
    }

    private static async Task<IResult> GetStats(
        CatalogDbContext catalog,
        SellersDbContext sellers,
        IdentityDbContext identity,
        PromotionsDbContext promotions,
        CartDbContext cart,
        CancellationToken ct)
    {
        var productCount = await catalog.Products.AsNoTracking().CountAsync(ct);
        var publishedCount = await catalog.Products.AsNoTracking().CountAsync(x => x.IsPublished, ct);
        var pendingReviews = await catalog.Reviews.AsNoTracking()
            .CountAsync(x => x.Status == "pending", ct);
        var sellerCount = await sellers.Sellers.AsNoTracking().CountAsync(ct);
        var customerCount = await identity.Users.AsNoTracking().CountAsync(ct);
        var activeCampaigns = await promotions.OfferCampaigns.AsNoTracking()
            .CountAsync(x => x.IsActive, ct);

        var recentOrders = await cart.Orders.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(5)
            .Select(x => new
            {
                id = x.ExternalKey,
                customer = x.CustomerName,
                total = x.TotalAmount,
                status = x.Status,
                createdAt = x.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
            })
            .ToListAsync(ct);

        var stats = new[]
        {
            new
            {
                id = "products",
                label = "محصولات منتشر",
                value = publishedCount.ToString("N0"),
                hint = $"{productCount} کل در کاتالوگ",
            },
            new
            {
                id = "customers",
                label = "مشتریان",
                value = customerCount.ToString("N0"),
                hint = "کاربران Identity",
            },
            new
            {
                id = "sellers",
                label = "فروشندگان",
                value = sellerCount.ToString("N0"),
                hint = "بازارگاه",
            },
            new
            {
                id = "pending",
                label = "در انتظار اقدام",
                value = pendingReviews.ToString("N0"),
                hint = $"{activeCampaigns} کمپین فعال",
            },
        };

        return Results.Ok(new { stats, recentOrders });
    }
}
