namespace MixPlus.Modules.Catalog.Application.Variants;

public sealed record VariantOptionValueDto(
    string Id,
    string Label,
    string? SwatchHex,
    bool Available);

public sealed record VariantOptionGroupDto(
    string Id,
    string Code,
    string Name,
    string Ui,
    IReadOnlyList<VariantOptionValueDto> Values);

public sealed record VariantSkuDto(
    string Id,
    string Sku,
    IReadOnlyList<string> OptionValueIds,
    decimal Price,
    decimal? OriginalPrice,
    int? DiscountPercent,
    bool InStock,
    int Stock);

/// <summary>Matches frontend <c>ProductVariantInfoData</c> option/sku portion.</summary>
public sealed record ProductVariantsDto(
    IReadOnlyList<VariantOptionGroupDto> OptionGroups,
    IReadOnlyDictionary<string, string> SelectedOptionValueIds,
    IReadOnlyList<VariantSkuDto> Skus);

public sealed record UpsertOptionGroupRequest(
    string Code,
    string Name,
    string Ui,
    int SortOrder,
    IReadOnlyList<UpsertOptionValueRequest> Values);

public sealed record UpsertOptionValueRequest(
    string? Id,
    string Label,
    string? SwatchHex,
    bool Available,
    int SortOrder);

public sealed record UpsertSkuRequest(
    string Sku,
    IReadOnlyList<string> OptionValueIds,
    decimal Price,
    decimal? OriginalPrice,
    int? DiscountPercent,
    int Stock);

public sealed record AdminVariantListItemDto(
    string Id,
    string ProductId,
    string ProductTitle,
    string Sku,
    string Attributes,
    decimal Price,
    int Stock,
    bool InStock);
