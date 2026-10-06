using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Application.Abstractions;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Offers;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Domain.Reviews;
using MixPlus.Modules.Catalog.Domain.Specs;
using MixPlus.Modules.Catalog.Domain.Variants;

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence;

/// <summary>
/// Catalog schema owner. Tables live in SQL schema <c>catalog</c>.
/// </summary>
public sealed class CatalogDbContext : DbContext, ICatalogDbContext
{
    public const string Schema = "catalog";

    public CatalogDbContext(DbContextOptions<CatalogDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ProductOptionGroup> OptionGroups => Set<ProductOptionGroup>();
    public DbSet<ProductSku> Skus => Set<ProductSku>();
    public DbSet<ProductSpecGroup> SpecGroups => Set<ProductSpecGroup>();
    public DbSet<SpecDefinition> SpecDefinitions => Set<SpecDefinition>();
    public DbSet<ProductReview> Reviews => Set<ProductReview>();
    public DbSet<ProductOffer> Offers => Set<ProductOffer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(500).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(300).IsRequired();
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.BrandExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.BrandName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.SellerExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SellerName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CategoryExternalKey).HasMaxLength(100);
            entity.Property(x => x.CategoryName).HasMaxLength(200);
            entity.HasIndex(x => x.CategoryId);
            entity.HasIndex(x => x.CategoryExternalKey);
            entity.Property(x => x.BadgesJson).HasColumnType("jsonb");
            entity.Property(x => x.PdpContentJson).HasColumnType("jsonb");
            entity.OwnsOne(x => x.Price, money =>
            {
                money.Property(m => m.Amount).HasColumnName("PriceAmount").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("PriceCurrency").HasMaxLength(8);
            });
            entity.OwnsOne(x => x.OriginalPrice, money =>
            {
                money.Property(m => m.Amount).HasColumnName("OriginalPriceAmount").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("OriginalPriceCurrency").HasMaxLength(8);
            });

            entity.OwnsMany(x => x.MediaItems, media =>
            {
                media.ToTable("ProductMedia");
                media.WithOwner().HasForeignKey("ProductId");
                media.HasKey(x => x.Id);
                media.Property(x => x.MediaAssetId).IsRequired();
                media.HasIndex("ProductId", nameof(ProductMediaItem.MediaAssetId)).IsUnique();
                media.HasIndex(x => x.MediaAssetId);
            });

            entity.Navigation(x => x.MediaItems)
                .HasField("_mediaItems")
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<Brand>(entity =>
        {
            entity.ToTable("Brands");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Href).HasMaxLength(500).IsRequired();
            entity.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<ProductOptionGroup>(entity =>
        {
            entity.ToTable("OptionGroups");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ProductExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Code).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Name).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Ui).HasMaxLength(20).IsRequired();
            entity.HasIndex(x => new { x.ProductId, x.Code }).IsUnique();

            entity.OwnsMany(x => x.Values, values =>
            {
                values.ToTable("OptionValues");
                values.WithOwner().HasForeignKey("OptionGroupId");
                values.HasKey(x => x.Id);
                values.Property(x => x.Label).HasMaxLength(120).IsRequired();
                values.Property(x => x.SwatchHex).HasMaxLength(40);
            });

            entity.Navigation(x => x.Values)
                .HasField("_values")
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<ProductSku>(entity =>
        {
            entity.ToTable("Skus");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ProductExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SkuCode).HasMaxLength(80).IsRequired();
            entity.HasIndex(x => x.SkuCode).IsUnique();
            entity.Property(x => x.OptionValueIdsJson).HasColumnType("jsonb").IsRequired();
            entity.HasIndex(x => x.ProductId);
            entity.OwnsOne(x => x.Price, money =>
            {
                money.Property(m => m.Amount).HasColumnName("PriceAmount").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("PriceCurrency").HasMaxLength(8);
            });
            entity.OwnsOne(x => x.OriginalPrice, money =>
            {
                money.Property(m => m.Amount).HasColumnName("OriginalPriceAmount").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("OriginalPriceCurrency").HasMaxLength(8);
            });
        });

        modelBuilder.Entity<ProductSpecGroup>(entity =>
        {
            entity.ToTable("SpecGroups");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ProductExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.HasIndex(x => x.ProductId);

            entity.OwnsMany(x => x.Attributes, attrs =>
            {
                attrs.ToTable("SpecAttributes");
                attrs.WithOwner().HasForeignKey("SpecGroupId");
                attrs.HasKey(x => x.Id);
                attrs.Property(x => x.Label).HasMaxLength(200).IsRequired();
                attrs.Property(x => x.ValuesJson).HasColumnType("jsonb").IsRequired();
            });

            entity.Navigation(x => x.Attributes)
                .HasField("_attributes")
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<SpecDefinition>(entity =>
        {
            entity.ToTable("SpecDefinitions");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Group).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Unit).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(120).IsRequired();
        });

        modelBuilder.Entity<ProductReview>(entity =>
        {
            entity.ToTable("ProductReviews");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.ProductSlug).HasMaxLength(200).IsRequired();
            entity.HasIndex(x => x.ProductSlug);
            entity.Property(x => x.ProductTitle).HasMaxLength(300).IsRequired();
            entity.Property(x => x.IsAnonymous).IsRequired();
            entity.Property(x => x.CustomerName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Excerpt).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
        });

        modelBuilder.Entity<ProductOffer>(entity =>
        {
            entity.ToTable("ProductOffers");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.ProductSlug).HasMaxLength(300).IsRequired();
            entity.HasIndex(x => x.ProductSlug);
            entity.HasIndex(x => x.ProductId);
            entity.Property(x => x.SellerExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SellerName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.PerformanceLabel).HasMaxLength(80).IsRequired();
            entity.Property(x => x.DeliveryLabel).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Warranty).HasMaxLength(300).IsRequired();
            entity.Property(x => x.MemberSinceLabel).HasMaxLength(120);
            entity.OwnsOne(x => x.Price, money =>
            {
                money.Property(m => m.Amount).HasColumnName("PriceAmount").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("PriceCurrency").HasMaxLength(8);
            });
            entity.OwnsOne(x => x.OriginalPrice, money =>
            {
                money.Property(m => m.Amount).HasColumnName("OriginalPriceAmount").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("OriginalPriceCurrency").HasMaxLength(8);
            });
        });
    }
}
