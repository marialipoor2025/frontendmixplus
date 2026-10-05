using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Api;

internal static class AdminCustomerEndpoints
{
    public static void MapAdminCustomerEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/customers").WithTags("AdminCustomers");
        group.MapGet("/", ListCustomers).WithName("AdminListCustomers");
        group.MapPatch("/{id}/block", SetBlocked).WithName("AdminBlockCustomer");
    }

    private static async Task<IResult> ListCustomers(IdentityDbContext db, CancellationToken ct)
    {
        var rows = await db.Users.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new
            {
                id = x.ExternalKey,
                name = x.DisplayName,
                phone = x.Phone ?? x.Email ?? x.ExternalKey,
                orders = 0,
                status = x.IsBlocked ? "blocked" : "active",
            })
            .ToListAsync(ct);
        return Results.Ok(rows);
    }

    private static async Task<IResult> SetBlocked(
        string id,
        BlockCustomerRequest body,
        IdentityDbContext db,
        CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (user is null) return Results.NotFound(new { error = "مشتری یافت نشد" });

        user.SetBlocked(body.Blocked);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new
        {
            id = user.ExternalKey,
            name = user.DisplayName,
            phone = user.Phone ?? user.Email ?? user.ExternalKey,
            orders = 0,
            status = user.IsBlocked ? "blocked" : "active",
        });
    }

    private sealed record BlockCustomerRequest(bool Blocked);
}
