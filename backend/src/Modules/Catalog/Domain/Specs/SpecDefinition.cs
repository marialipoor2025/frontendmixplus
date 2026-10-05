using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Specs;

/// <summary>Reusable attribute dictionary entry (admin catalog). </summary>
public sealed class SpecDefinition : AggregateRoot
{
    private SpecDefinition()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Group { get; private set; } = string.Empty;
    public string Unit { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;

    public static SpecDefinition Create(
        string externalKey,
        string name,
        string group,
        string unit,
        string category)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(group);

        return new SpecDefinition
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Name = name.Trim(),
            Group = group.Trim(),
            Unit = string.IsNullOrWhiteSpace(unit) ? "—" : unit.Trim(),
            Category = category?.Trim() ?? string.Empty,
        };
    }

    public void Update(string name, string group, string unit, string category)
    {
        Name = name.Trim();
        Group = group.Trim();
        Unit = string.IsNullOrWhiteSpace(unit) ? "—" : unit.Trim();
        Category = category?.Trim() ?? string.Empty;
    }
}
