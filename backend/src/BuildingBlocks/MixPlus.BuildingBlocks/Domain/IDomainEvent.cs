namespace MixPlus.BuildingBlocks.Domain;

/// <summary>
/// In-process domain event. Modules publish; other modules may subscribe via the host mediator/bus.
/// </summary>
public interface IDomainEvent
{
    Guid EventId { get; }
    DateTime OccurredOnUtc { get; }
}
