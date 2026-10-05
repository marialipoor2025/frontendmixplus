using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Catalog.Domain.Brands;

public sealed class Brand : AggregateRoot
{
    private Brand()
    {
    }

    public string ExternalKey { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string LogoUrl { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;

    public static Brand Create(string externalKey, string name, string slug, string logoUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);

        return new Brand
        {
            Id = StableGuid.From(externalKey),
            ExternalKey = externalKey.Trim(),
            Name = name.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            LogoUrl = logoUrl,
            IsActive = true,
        };
    }

    public void Update(string name, string slug, string logoUrl)
    {
        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        LogoUrl = logoUrl;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}
