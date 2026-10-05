using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Promotions.Domain;
using MixPlus.Modules.Promotions.Infrastructure.Persistence;

namespace MixPlus.Modules.Promotions.Api;

internal static class AdminCouponEndpoints
{
    public static void MapAdminCouponEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/promotions/coupons").WithTags("AdminCoupons");
        group.MapGet("/", ListCoupons).WithName("AdminListCoupons");
        group.MapPost("/", CreateCoupon).WithName("AdminCreateCoupon");
        group.MapPut("/{id}", UpdateCoupon).WithName("AdminUpdateCoupon");
        group.MapDelete("/{id}", DeleteCoupon).WithName("AdminDeleteCoupon");
    }

    private static async Task<IResult> ListCoupons(PromotionsDbContext db, CancellationToken ct)
    {
        var rows = await db.Coupons.AsNoTracking().OrderBy(x => x.Code).ToListAsync(ct);
        return Results.Ok(rows.Select(ToDto).ToList());
    }

    private static async Task<IResult> CreateCoupon(
        UpsertCouponRequest body,
        PromotionsDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Code))
            return Results.BadRequest(new { error = "کد کوپن الزامی است" });

        var code = body.Code.Trim().ToUpperInvariant();
        if (await db.Coupons.AnyAsync(x => x.Code == code, ct))
            return Results.Conflict(new { error = "کد کوپن تکراری است" });

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"cp-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        var coupon = Coupon.Create(
            externalKey,
            code,
            body.Discount ?? "",
            body.Limit,
            body.Status != "expired");

        db.Coupons.Add(coupon);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/admin/promotions/coupons/{coupon.ExternalKey}", ToDto(coupon));
    }

    private static async Task<IResult> UpdateCoupon(
        string id,
        UpsertCouponRequest body,
        PromotionsDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Code))
            return Results.BadRequest(new { error = "کد کوپن الزامی است" });

        var coupon = await db.Coupons.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (coupon is null) return Results.NotFound(new { error = "کوپن یافت نشد" });

        var code = body.Code.Trim().ToUpperInvariant();
        if (await db.Coupons.AnyAsync(x => x.Code == code && x.ExternalKey != id, ct))
            return Results.Conflict(new { error = "کد کوپن تکراری است" });

        coupon.Update(code, body.Discount ?? coupon.DiscountLabel, body.Limit, body.Status != "expired");
        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(coupon));
    }

    private static async Task<IResult> DeleteCoupon(
        string id,
        PromotionsDbContext db,
        CancellationToken ct)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (coupon is null) return Results.NotFound(new { error = "کوپن یافت نشد" });
        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static object ToDto(Coupon c) => new
    {
        id = c.ExternalKey,
        code = c.Code,
        discount = c.DiscountLabel,
        usage = c.UsageCount,
        limit = c.UsageLimit,
        status = c.IsActive ? "active" : "expired",
    };

    private sealed record UpsertCouponRequest(
        string? Id,
        string Code,
        string? Discount,
        int Limit,
        string Status);
}
