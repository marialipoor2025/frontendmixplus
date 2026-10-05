using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Infrastructure;
using MixPlus.Modules.Media.Application;
using MixPlus.Modules.Media.Infrastructure.Persistence;
using MixPlus.Modules.Media.Infrastructure.Storage;

namespace MixPlus.Modules.Media.Api;

public sealed class MediaModule : IModule
{
    public string Name => "Media";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MediaOptions>(configuration.GetSection(MediaOptions.SectionName));

        services.AddDbContext<MediaDbContext>(options =>
            options.UseMixPlusDatabase(
                configuration,
                MediaDbContext.Schema,
                typeof(MediaDbContext).Assembly.GetName().Name));

        services.AddSingleton<ILocalMediaStorage, LocalMediaStorage>();
        services.AddSingleton<IImageResizer, ImageSharpResizer>();
        services.AddScoped<IMediaUploadService, MediaUploadService>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/media").WithTags("Media");

        group.MapGet("/health", () => Results.Ok(new { module = Name, status = "ready" }))
            .WithName("MediaHealth");

        group.MapPost("/upload", async (HttpRequest request, IMediaUploadService media, CancellationToken ct) =>
            {
                if (!request.HasFormContentType)
                {
                    return Results.BadRequest(new { error = "Expected multipart form upload." });
                }

                var form = await request.ReadFormAsync(ct);
                var file = form.Files.GetFile("file") ?? form.Files.FirstOrDefault();
                if (file is null || file.Length == 0)
                {
                    return Results.BadRequest(new { error = "Missing file field." });
                }

                await using var stream = file.OpenReadStream();
                var result = await media.UploadAsync(stream, file.FileName, file.ContentType, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            })
            .DisableAntiforgery()
            .WithName("UploadMedia");

        group.MapGet("/{id:guid}/{variant}", async (
                Guid id,
                string variant,
                IMediaUploadService media,
                CancellationToken ct) =>
            {
                var opened = await media.OpenVariantAsync(id, variant, ct);
                if (opened is null)
                {
                    return Results.NotFound();
                }

                var (stream, contentType, fileName) = opened.Value;
                return Results.File(stream, contentType, fileDownloadName: fileName, enableRangeProcessing: true);
            })
            .WithName("GetMediaVariant");
    }
}
