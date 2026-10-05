using System.Text.Json.Serialization;
using MixPlus.Api.Seed;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Cart.Api;
using MixPlus.Modules.Catalog.Api;
using MixPlus.Modules.Identity.Api;
using MixPlus.Modules.Media.Api;
using MixPlus.Modules.Merchandising.Api;
using MixPlus.Modules.Navigation.Api;
using MixPlus.Modules.Promotions.Api;
using MixPlus.Modules.Search.Api;
using MixPlus.Modules.Sellers.Api;
using MixPlus.Modules.Support.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "MixPlus API", Version = "v1" });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                ?? ["http://localhost:3000", "http://127.0.0.1:3000"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

IModule[] modules =
[
    new CatalogModule(),
    new SellersModule(),
    new MerchandisingModule(),
    new NavigationModule(),
    new PromotionsModule(),
    new IdentityModule(),
    new MediaModule(),
    new CartModule(),
    new SearchModule(),
    new SupportModule(),
];

foreach (var module in modules)
{
    module.RegisterServices(builder.Services, builder.Configuration);
}

var app = builder.Build();

await DatabaseInitializer.InitializeAsync(app);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.MapGet("/health", () => Results.Ok(new
{
    service = "MixPlus.Api",
    status = "ok",
    modules = modules.Select(m => m.Name).ToArray(),
}))
.WithTags("Host");

foreach (var module in modules)
{
    module.MapEndpoints(app);
}

app.Run();

public partial class Program;
