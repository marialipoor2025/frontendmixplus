using System.Text.Json;
using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Specs;

public sealed class ProductSpecGroup : AggregateRoot
{
    private readonly List<ProductSpecAttribute> _attributes = [];

    private ProductSpecGroup()
    {
    }

    public Guid ProductId { get; private set; }
    public string ProductExternalKey { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public int? PreviewCount { get; private set; }
    public IReadOnlyCollection<ProductSpecAttribute> Attributes => _attributes.AsReadOnly();

    public static ProductSpecGroup Create(
        Guid productId,
        string productExternalKey,
        string title,
        int sortOrder,
        int? previewCount,
        IEnumerable<ProductSpecAttribute> attributes)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        var group = new ProductSpecGroup
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ProductExternalKey = productExternalKey.Trim(),
            Title = title.Trim(),
            SortOrder = sortOrder,
            PreviewCount = previewCount,
        };

        foreach (var attr in attributes)
        {
            group._attributes.Add(attr);
        }

        return group;
    }
}

public sealed class ProductSpecAttribute
{
    private ProductSpecAttribute()
    {
    }

    public Guid Id { get; private set; }
    public string Label { get; private set; } = string.Empty;
    public string ValuesJson { get; private set; } = "[]";
    public int SortOrder { get; private set; }

    public IReadOnlyList<string> GetValues()
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(ValuesJson) ?? [];
        }
        catch
        {
            return [];
        }
    }

    public static ProductSpecAttribute Create(string label, IEnumerable<string> values, int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(label);
        var list = values.Select(v => v.Trim()).Where(v => v.Length > 0).ToList();
        if (list.Count == 0)
        {
            throw new ArgumentException("At least one value is required.", nameof(values));
        }

        return new ProductSpecAttribute
        {
            Id = Guid.NewGuid(),
            Label = label.Trim(),
            ValuesJson = JsonSerializer.Serialize(list),
            SortOrder = sortOrder,
        };
    }
}
