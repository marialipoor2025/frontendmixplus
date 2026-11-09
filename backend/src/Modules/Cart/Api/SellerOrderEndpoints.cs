using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Cart.Infrastructure.Persistence;

namespace MixPlus.Modules.Cart.Api;

/// <summary>
/// Seller-scoped order reads — orders that include at least one line for the seller.
/// </summary>
internal static class SellerOrderEndpoints
{
    public static void MapSellerOrderEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/seller").WithTags("SellerOrders");
        group.MapGet("/orders", ListOrders).WithName("SellerListOrders");
        group.MapGet("/orders/{id}", GetOrder).WithName("SellerGetOrder");
    }

    private static async Task<IResult> ListOrders(
        HttpRequest request,
        CartDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        string? status,
        int page = 1,
        int pageSize = 10,
        CancellationToken ct = default)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;
        var sellerKey = seller!.ExternalKey;
        var sellerName = seller.Name;

        var matchingOrderIds = db.OrderLines.AsNoTracking()
            .Where(l =>
                l.SellerExternalKey == sellerKey ||
                (l.SellerExternalKey == "" && l.SellerName == sellerName))
            .Select(l => l.OrderId)
            .Distinct();

        var query = db.Orders.AsNoTracking()
            .Where(o => matchingOrderIds.Contains(o.Id));

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim();
            query = query.Where(o => EF.Functions.ILike(o.Status, st));
        }

        var totalCount = await query.CountAsync(ct);
        var orders = await query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.Id,
                o.ExternalKey,
                o.CustomerName,
                o.Status,
                o.CreatedAtUtc,
                o.Currency,
            })
            .ToListAsync(ct);

        var orderIds = orders.Select(o => o.Id).ToList();
        var lines = await db.OrderLines.AsNoTracking()
            .Where(l => orderIds.Contains(l.OrderId))
            .Where(l =>
                l.SellerExternalKey == sellerKey ||
                (l.SellerExternalKey == "" && l.SellerName == sellerName))
            .Select(l => new
            {
                l.OrderId,
                l.UnitPrice,
                l.Quantity,
            })
            .ToListAsync(ct);

        var linesByOrder = lines.GroupBy(l => l.OrderId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var items = orders.Select(o =>
        {
            linesByOrder.TryGetValue(o.Id, out var orderLines);
            orderLines ??= [];
            var sellerTotal = orderLines.Sum(l => l.UnitPrice * l.Quantity);
            return new SellerOrderListItemDto(
                o.ExternalKey,
                o.CustomerName,
                o.Status,
                o.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
                orderLines.Count,
                sellerTotal,
                o.Currency);
        }).ToList();

        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        return Results.Ok(new
        {
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
        });
    }

    private static async Task<IResult> GetOrder(
        string id,
        HttpRequest request,
        CartDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var sellerKey = seller!.ExternalKey;
        var sellerName = seller.Name;

        var order = await db.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.ExternalKey == id, ct);
        if (order is null)
        {
            return Results.NotFound(new { error = "سفارش یافت نشد" });
        }

        var lines = await db.OrderLines.AsNoTracking()
            .Where(l => l.OrderId == order.Id)
            .Where(l =>
                l.SellerExternalKey == sellerKey ||
                (l.SellerExternalKey == "" && l.SellerName == sellerName))
            .Select(l => new
            {
                l.Title,
                l.ImageUrl,
                l.VariantLabel,
                l.Quantity,
                l.UnitPrice,
                l.Currency,
                l.SkuExternalKey,
            })
            .ToListAsync(ct);

        if (lines.Count == 0)
        {
            return Results.NotFound(new { error = "سفارش یافت نشد" });
        }

        return Results.Ok(new
        {
            id = order.ExternalKey,
            customerName = order.CustomerName,
            status = order.Status,
            createdAt = order.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
            currency = order.Currency,
            orderTotal = order.TotalAmount,
            sellerTotal = lines.Sum(l => l.UnitPrice * l.Quantity),
            items = lines,
        });
    }

    private static async Task<(SellerAccountModel? Seller, IResult? Error)> ResolveSellerAsync(
        HttpRequest request,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var userId = await users.GetUserIdAsync(ReadBearer(request), ct);
        if (userId is null)
        {
            return (null, Results.Unauthorized());
        }

        var seller = await sellers.GetByOwnerUserIdAsync(userId.Value, ct);
        if (seller is null || !seller.IsActive)
        {
            return (null, Results.Json(
                new { error = "حساب فروشنده برای این کاربر یافت نشد" },
                statusCode: StatusCodes.Status403Forbidden));
        }

        return (seller, null);
    }

    private static string? ReadBearer(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header))
        {
            return null;
        }

        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }

    private sealed record SellerOrderListItemDto(
        string Id,
        string CustomerName,
        string Status,
        string CreatedAt,
        int ItemCount,
        decimal SellerTotal,
        string Currency);
}
