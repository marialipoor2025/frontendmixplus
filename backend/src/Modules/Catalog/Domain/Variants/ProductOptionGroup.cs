using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Variants;

public sealed class ProductOptionGroup : AggregateRoot
{
    private readonly List<ProductOptionValue> _values = [];

    private ProductOptionGroup()
    {
    }

    public Guid ProductId { get; private set; }
    public string ProductExternalKey { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Ui { get; private set; } = "chip";
    public int SortOrder { get; private set; }
    public IReadOnlyCollection<ProductOptionValue> Values => _values.AsReadOnly();

    public static ProductOptionGroup Create(
        Guid productId,
        string productExternalKey,
        string code,
        string name,
        string ui,
        int sortOrder,
        IEnumerable<ProductOptionValue> values)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var group = new ProductOptionGroup
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ProductExternalKey = productExternalKey.Trim(),
            Code = code.Trim().ToLowerInvariant(),
            Name = name.Trim(),
            Ui = string.IsNullOrWhiteSpace(ui) ? "chip" : ui.Trim().ToLowerInvariant(),
            SortOrder = sortOrder,
        };

        foreach (var value in values)
        {
            group._values.Add(value);
        }

        return group;
    }

    public void Update(string name, string ui, int sortOrder)
    {
        Name = name.Trim();
        Ui = string.IsNullOrWhiteSpace(ui) ? Ui : ui.Trim().ToLowerInvariant();
        SortOrder = sortOrder;
    }

    public void ReplaceValues(IEnumerable<ProductOptionValue> values)
    {
        _values.Clear();
        _values.AddRange(values);
    }
}

public sealed class ProductOptionValue
{
    private ProductOptionValue()
    {
    }

    public Guid Id { get; private set; }
    public string Label { get; private set; } = string.Empty;
    public string? SwatchHex { get; private set; }
    public bool Available { get; private set; } = true;
    public int SortOrder { get; private set; }

    public static ProductOptionValue Create(
        string label,
        string? swatchHex,
        bool available,
        int sortOrder,
        Guid? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(label);
        return new ProductOptionValue
        {
            Id = id ?? Guid.NewGuid(),
            Label = label.Trim(),
            SwatchHex = string.IsNullOrWhiteSpace(swatchHex) ? null : swatchHex.Trim(),
            Available = available,
            SortOrder = sortOrder,
        };
    }
}
