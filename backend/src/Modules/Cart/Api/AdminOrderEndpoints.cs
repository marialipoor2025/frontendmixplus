using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Cart.Domain;
using MixPlus.Modules.Cart.Infrastructure.Persistence;

namespace MixPlus.Modules.Cart.Api;

internal static class AdminOrderEndpoints
{
    public static void MapAdminOrderEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/orders").WithTags("AdminOrders");
        group.MapGet("/", ListOrders).WithName("AdminListOrders");
        group.MapPost("/", CreateOrder).WithName("AdminCreateOrder");
        group.MapPatch("/{id}/status", PatchStatus).WithName("AdminPatchOrderStatus");
    }

    private static async Task<IResult> ListOrders(CartDbContext db, CancellationToken ct)
    {
        var rows = await db.Orders.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new
            {
                id = x.ExternalKey,
                customer = x.CustomerName,
                total = x.TotalAmount,
                status = x.Status,
                createdAt = x.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
            })
            .ToListAsync(ct);
        return Results.Ok(rows);
    }

    private static async Task<IResult> CreateOrder(
        UpsertOrderRequest body,
        CartDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Customer))
            return Results.BadRequest(new { error = "نام مشتری الزامی است" });

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"MP-{DateTime.UtcNow:yyMMddHHmmss}"
            : body.Id.Trim();

        if (await db.Orders.AnyAsync(x => x.ExternalKey == externalKey, ct))
            return Results.Conflict(new { error = "شناسه سفارش تکراری است" });

        var order = ShopOrder.Create(externalKey, body.Customer, body.Total, body.Status ?? "new");
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/admin/orders/{order.ExternalKey}", new
        {
            id = order.ExternalKey,
            customer = order.CustomerName,
            total = order.TotalAmount,
            status = order.Status,
            createdAt = order.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
        });
    }

    private static async Task<IResult> PatchStatus(
        string id,
        PatchStatusRequest body,
        CartDbContext db,
        CancellationToken ct)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (order is null) return Results.NotFound(new { error = "سفارش یافت نشد" });

        order.SetStatus(body.Status);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new
        {
            id = order.ExternalKey,
            customer = order.CustomerName,
            total = order.TotalAmount,
            status = order.Status,
            createdAt = order.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
        });
    }

    private sealed record UpsertOrderRequest(
        string? Id,
        string Customer,
        decimal Total,
        string? Status);

    private sealed record PatchStatusRequest(string Status);
}
