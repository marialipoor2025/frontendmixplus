using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Identity.Domain;

public sealed class AuditLogEntry : AggregateRoot
{
    private AuditLogEntry()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Actor { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string Entity { get; private set; } = string.Empty;
    public DateTime AtUtc { get; private set; }

    public static AuditLogEntry Create(string actor, string action, string entity)
    {
        var key = $"aud-{Guid.NewGuid():N}"[..16];
        return new AuditLogEntry
        {
            Id = StableGuid.From(key),
            ExternalKey = key,
            Actor = actor.Trim(),
            Action = action.Trim(),
            Entity = entity.Trim(),
            AtUtc = DateTime.UtcNow,
        };
    }
}
