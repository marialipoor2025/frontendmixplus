using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Domain.Reviews;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

internal static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var catalog = endpoints.MapGroup("/api/catalog").WithTags("Catalog");
        catalog.MapGet("/products/{productKey}/reviews", ListProductReviews)
            .WithName("ListProductReviews");
        catalog.MapPost("/products/{productKey}/reviews", SubmitProductReview)
            .WithName("SubmitProductReview");

        var admin = endpoints.MapGroup("/api/admin/catalog").WithTags("AdminCatalog");
        admin.MapGet("/reviews", ListReviews).WithName("AdminListReviews");
        admin.MapPost("/reviews", CreateReview).WithName("AdminCreateReview");
        admin.MapPatch("/reviews/{id}", PatchReview).WithName("AdminPatchReview");
        admin.MapDelete("/reviews/{id}", DeleteReview).WithName("AdminDeleteReview");
    }

    private static async Task<IResult> ListProductReviews(
        string productKey,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var slug = productKey.Trim().ToLowerInvariant();
        var rows = await db.Reviews.AsNoTracking()
            .Where(x => x.Status == "approved" && x.ProductSlug == slug)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new
            {
                id = x.ExternalKey,
                authorName = x.IsAnonymous ? "کاربر ناشناس" : x.CustomerName,
                rating = x.Rating,
                body = x.Excerpt,
                dateLabel = x.CreatedAtUtc.ToString("yyyy/MM/dd"),
                isAnonymous = x.IsAnonymous,
                isPending = false,
            })
            .ToListAsync(ct);
        return Results.Ok(rows);
    }

    private static async Task<IResult> SubmitProductReview(
        string productKey,
        SubmitReviewRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        if (body.Rating is < 1 or > 5)
            return Results.BadRequest(new { error = "امتیاز باید بین ۱ تا ۵ باشد" });
        if (string.IsNullOrWhiteSpace(body.Body) || body.Body.Trim().Length < 10)
            return Results.BadRequest(new { error = "متن دیدگاه کوتاه است" });

        var slug = productKey.Trim().ToLowerInvariant();
        var product = await db.Products.AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.IsPublished && (x.ExternalKey == productKey || x.Slug == slug),
                ct);
        if (product is null)
            return Results.NotFound(new { error = "محصول یافت نشد" });

        var customer = string.IsNullOrWhiteSpace(body.CustomerName)
            ? "کاربر میکس پلاس"
            : body.CustomerName.Trim();
        var externalKey = $"rv-{Guid.NewGuid():N}"[..12];

        var review = ProductReview.Create(
            externalKey,
            slug,
            product.Title,
            customer,
            body.Rating,
            body.Body.Trim(),
            body.IsAnonymous);

        db.Reviews.Add(review);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new
        {
            message = "دیدگاه شما ثبت شد و پس از بررسی نمایش داده می‌شود.",
            id = review.ExternalKey,
        });
    }

    private static async Task<IResult> ListReviews(CatalogDbContext db, CancellationToken ct)
    {
        var rows = await db.Reviews.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new
            {
                id = x.ExternalKey,
                product = x.ProductTitle,
                customer = x.CustomerName,
                rating = x.Rating,
                excerpt = x.Excerpt,
                status = x.Status,
            })
            .ToListAsync(ct);
        return Results.Ok(rows);
    }

    private static async Task<IResult> CreateReview(
        UpsertReviewRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Product) || string.IsNullOrWhiteSpace(body.Customer))
            return Results.BadRequest(new { error = "محصول و مشتری الزامی هستند" });

        var externalKey = string.IsNullOrWhiteSpace(body.Id)
            ? $"rv-{Guid.NewGuid():N}"[..12]
            : body.Id.Trim();

        var review = ProductReview.Create(
            externalKey,
            body.ProductSlug ?? "",
            body.Product,
            body.Customer,
            body.Rating,
            body.Excerpt ?? "");
        if (!string.IsNullOrWhiteSpace(body.Status))
        {
            review.SetStatus(body.Status);
        }

        db.Reviews.Add(review);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/admin/catalog/reviews/{review.ExternalKey}", ToDto(review));
    }

    private static async Task<IResult> PatchReview(
        string id,
        PatchReviewRequest body,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (review is null) return Results.NotFound(new { error = "نظر یافت نشد" });

        if (!string.IsNullOrWhiteSpace(body.Status))
        {
            review.SetStatus(body.Status);
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(review));
    }

    private static async Task<IResult> DeleteReview(
        string id,
        CatalogDbContext db,
        CancellationToken ct)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(x => x.ExternalKey == id, ct);
        if (review is null) return Results.NotFound(new { error = "نظر یافت نشد" });
        db.Reviews.Remove(review);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static object ToDto(ProductReview x) => new
    {
        id = x.ExternalKey,
        product = x.ProductTitle,
        customer = x.CustomerName,
        rating = x.Rating,
        excerpt = x.Excerpt,
        status = x.Status,
    };

    private sealed record SubmitReviewRequest(
        int Rating,
        string Body,
        bool IsAnonymous,
        string? CustomerName);

    private sealed record UpsertReviewRequest(
        string? Id,
        string Product,
        string? ProductSlug,
        string Customer,
        int Rating,
        string? Excerpt,
        string? Status);

    private sealed record PatchReviewRequest(string? Status);
}
