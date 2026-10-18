using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using MixPlus.Modules.Merchandising.Infrastructure;

namespace MixPlus.Modules.Merchandising.Api;

/// <summary>
/// Admin + public CMS for editable static / info pages.
/// </summary>
internal static class AdminCmsPagesEndpoints
{
    public static void MapAdminCmsPagesEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/cms/pages/{*key}", GetPublicPage)
            .WithTags("Cms")
            .WithName("GetCmsPage");

        var group = endpoints.MapGroup("/api/admin/cms/pages").WithTags("AdminCmsPages");
        group.MapGet("/", ListPages).WithName("AdminListCmsPages");
        group.MapGet("/{*key}", GetAdminPage).WithName("AdminGetCmsPage");
        group.MapPut("/{*key}", UpsertPage).WithName("AdminUpsertCmsPage");
        group.MapPost("/", CreatePage).WithName("AdminCreateCmsPage");
        group.MapDelete("/{*key}", DeletePage).WithName("AdminDeleteCmsPage");
    }

    private static async Task<IResult> GetPublicPage(
        string key,
        ICmsPagesStore store,
        CancellationToken ct)
    {
        var page = await store.GetAsync(key, ct);
        if (page is null || !page.IsPublished)
        {
            return Results.NotFound(new { error = "صفحه یافت نشد" });
        }

        return Results.Ok(page);
    }

    private static async Task<IResult> ListPages(ICmsPagesStore store, CancellationToken ct) =>
        Results.Ok(await store.ListAsync(ct));

    private static async Task<IResult> GetAdminPage(
        string key,
        ICmsPagesStore store,
        CancellationToken ct)
    {
        var page = await store.GetAsync(key, ct);
        return page is null
            ? Results.NotFound(new { error = "صفحه یافت نشد" })
            : Results.Ok(page);
    }

    private static async Task<IResult> CreatePage(
        CmsPageDto body,
        ICmsPagesStore store,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Key) || string.IsNullOrWhiteSpace(body.Title))
        {
            return Results.BadRequest(new { error = "کلید و عنوان صفحه الزامی است" });
        }

        if (await store.GetAsync(body.Key, ct) is not null)
        {
            return Results.Conflict(new { error = "صفحه با این کلید وجود دارد" });
        }

        var saved = await store.UpsertAsync(body, ct);
        return Results.Created($"/api/admin/cms/pages/{saved.Key}", saved);
    }

    private static async Task<IResult> UpsertPage(
        string key,
        CmsPageDto body,
        ICmsPagesStore store,
        CancellationToken ct)
    {
        body.Key = string.IsNullOrWhiteSpace(body.Key) ? key : body.Key;
        if (string.IsNullOrWhiteSpace(body.Title))
        {
            return Results.BadRequest(new { error = "عنوان صفحه الزامی است" });
        }

        var saved = await store.UpsertAsync(body, ct);
        return Results.Ok(saved);
    }

    private static async Task<IResult> DeletePage(
        string key,
        ICmsPagesStore store,
        CancellationToken ct)
    {
        var ok = await store.DeleteAsync(key, ct);
        return ok ? Results.NoContent() : Results.NotFound(new { error = "صفحه یافت نشد" });
    }
}
