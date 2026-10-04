using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MixPlus.BuildingBlocks.Application;

/// <summary>
/// Each bounded context registers DI and HTTP endpoints through this contract.
/// The host composes modules; modules never reference each other directly.
/// </summary>
public interface IModule
{
    string Name { get; }

    void RegisterServices(IServiceCollection services, IConfiguration configuration);

    void MapEndpoints(IEndpointRouteBuilder endpoints);
}
