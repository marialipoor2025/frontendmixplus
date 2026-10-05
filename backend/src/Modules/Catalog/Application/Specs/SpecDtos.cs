namespace MixPlus.Modules.Catalog.Application.Specs;

public sealed record ProductSpecAttributeDto(
    string Id,
    string Label,
    IReadOnlyList<string> Values);

public sealed record ProductSpecGroupDto(
    string Id,
    string Title,
    int? PreviewCount,
    IReadOnlyList<ProductSpecAttributeDto> Attributes);

public sealed record ProductSpecsDto(IReadOnlyList<ProductSpecGroupDto> Groups);

public sealed record UpsertProductSpecsRequest(IReadOnlyList<UpsertSpecGroupRequest> Groups);

public sealed record UpsertSpecGroupRequest(
    string? Id,
    string Title,
    int? PreviewCount,
    IReadOnlyList<UpsertSpecAttributeRequest> Attributes);

public sealed record UpsertSpecAttributeRequest(
    string? Id,
    string Label,
    IReadOnlyList<string> Values);

public sealed record SpecDefinitionDto(
    string Id,
    string Name,
    string Group,
    string Unit,
    string Category);

public sealed record UpsertSpecDefinitionRequest(
    string? Id,
    string Name,
    string Group,
    string Unit,
    string Category);
