using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Digi;

/// <summary>
/// Reverse-engineered Digikala product-creation field schema for a leaf category
/// (validation bind + attribute labels observed on create / live PDP).
/// </summary>
public sealed class DigiCategoryFormSchema : AggregateRoot
{
    private DigiCategoryFormSchema()
    {
    }

    public long DigikalaCategoryId { get; private set; }
    public string ExternalKey { get; private set; } = string.Empty;
    public string LeafTitle { get; private set; } = string.Empty;
    public string? CategoryPathJson { get; private set; }
    public string SchemaJson { get; private set; } = "{}";
    public DateTimeOffset ScrapedAt { get; private set; }

    public static DigiCategoryFormSchema Create(
        long digikalaCategoryId,
        string leafTitle,
        string schemaJson,
        DateTimeOffset scrapedAt,
        string? categoryPathJson = null)
    {
        var key = $"digi-cat-form-{digikalaCategoryId}";
        return new DigiCategoryFormSchema
        {
            Id = StableGuid.From(key),
            DigikalaCategoryId = digikalaCategoryId,
            ExternalKey = key,
            LeafTitle = leafTitle.Trim(),
            CategoryPathJson = categoryPathJson,
            SchemaJson = string.IsNullOrWhiteSpace(schemaJson) ? "{}" : schemaJson,
            ScrapedAt = scrapedAt,
        };
    }

    public void Replace(string leafTitle, string schemaJson, DateTimeOffset scrapedAt, string? categoryPathJson)
    {
        LeafTitle = leafTitle.Trim();
        SchemaJson = string.IsNullOrWhiteSpace(schemaJson) ? "{}" : schemaJson;
        CategoryPathJson = categoryPathJson;
        ScrapedAt = scrapedAt;
    }
}
