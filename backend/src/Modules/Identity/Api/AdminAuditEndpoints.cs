using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Identity.Domain;
using MixPlus.Modules.Identity.Infrastructure.Persistence;

namespace MixPlus.Modules.Identity.Api;

internal static class AdminAuditEndpoints
{
    public static void MapAdminAuditEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/audit").WithTags("AdminAudit");
        group.MapGet("/", ListAudit).WithName("AdminListAudit");
        group.MapPost("/", CreateAudit).WithName("AdminCreateAudit");
    }

    private static async Task<IResult> ListAudit(IdentityDbContext db, CancellationToken ct)
    {
        var rows = await db.AuditLogs.AsNoTracking()
            .OrderByDescending(x => x.AtUtc)
            .Take(200)
            .Select(x => new
            {
                id = x.ExternalKey,
                actor = x.Actor,
                action = x.Action,
                entity = x.Entity,
                at = x.AtUtc.ToString("yyyy-MM-dd HH:mm"),
            })
            .ToListAsync(ct);
        return Results.Ok(rows);
    }

    private static async Task<IResult> CreateAudit(
        CreateAuditRequest body,
        IdentityDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Actor) || string.IsNullOrWhiteSpace(body.Action))
            return Results.BadRequest(new { error = "عامل و اقدام الزامی هستند" });

        var entry = AuditLogEntry.Create(body.Actor, body.Action, body.Entity ?? "");
        db.AuditLogs.Add(entry);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/admin/audit/{entry.ExternalKey}", new
        {
            id = entry.ExternalKey,
            actor = entry.Actor,
            action = entry.Action,
            entity = entry.Entity,
            at = entry.AtUtc.ToString("yyyy-MM-dd HH:mm"),
        });
    }

    private sealed record CreateAuditRequest(string Actor, string Action, string? Entity);
}
