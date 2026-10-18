using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MixPlus.BuildingBlocks.Application;
using MixPlus.Modules.Support.Infrastructure;

namespace MixPlus.Modules.Support.Api;

/// <summary>
/// Support chat (visitor ↔ live agent), agent registry, and AI-bot hook stub.
/// </summary>
public sealed class SupportModule : IModule
{
    public string Name => "Support";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IChatSessionStore, ChatSessionStore>();
        services.AddSingleton<IAgentRegistry, AgentRegistry>();
        services.AddSingleton<IChatBotHook, CannedChatBotHook>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/support/health", () =>
                Results.Ok(new { module = Name, status = "ready" }))
            .WithTags("Support")
            .WithName("SupportHealth");

        endpoints.MapSupportChatEndpoints();
    }
}
