namespace MixPlus.Modules.Navigation.Application;

/// <summary>
/// API contract matching frontend <c>MainNavData</c> / <c>GET /api/nav</c>.
/// </summary>
public sealed record MainNavDto(
    string CategoryTriggerLabel,
    IReadOnlyList<MegaMenuCategoryDto> Categories,
    IReadOnlyList<NavQuickLinkDto> QuickLinks,
    SellerCtaDto SellerCta);

public sealed record SellerCtaDto(string Title, string Href);

public sealed record NavQuickLinkDto(
    string Id,
    string Title,
    string Href,
    string? Icon,
    bool? External,
    string? Badge);

public sealed record MegaMenuCategoryDto(
    string Id,
    string Title,
    string Href,
    string Icon,
    string AllProductsLabel,
    IReadOnlyList<MegaMenuColumnDto> Columns);

public sealed record MegaMenuColumnDto(
    string Id,
    IReadOnlyList<MegaMenuLinkDto> Links);

public sealed record MegaMenuLinkDto(
    string Id,
    string Title,
    string Href,
    string Kind);
