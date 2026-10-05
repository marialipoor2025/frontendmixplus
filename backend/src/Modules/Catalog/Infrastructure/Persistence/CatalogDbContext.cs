using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Application.Abstractions;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Products;
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
            entity.Property(x => x.BadgesJson).HasColumnType("jsonb");
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
    }
}
