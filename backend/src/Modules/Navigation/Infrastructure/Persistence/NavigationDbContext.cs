using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Navigation.Domain;

namespace MixPlus.Modules.Navigation.Infrastructure.Persistence;

public sealed class NavigationDbContext : DbContext
{
    public const string Schema = "navigation";

    public NavigationDbContext(DbContextOptions<NavigationDbContext> options)
        : base(options)
    {
    }

    public DbSet<NavContent> NavContents => Set<NavContent>();
    public DbSet<NavSettings> NavSettings => Set<NavSettings>();
    public DbSet<NavQuickLink> QuickLinks => Set<NavQuickLink>();
    public DbSet<NavMegaCategory> MegaCategories => Set<NavMegaCategory>();
    public DbSet<NavMegaColumn> MegaColumns => Set<NavMegaColumn>();
    public DbSet<NavMegaLink> MegaLinks => Set<NavMegaLink>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<NavContent>(entity =>
        {
            entity.ToTable("NavContents");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.Key).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.Key).IsUnique();
            entity.Property(x => x.PayloadJson).HasColumnType("jsonb").IsRequired();
        });

        modelBuilder.Entity<NavSettings>(entity =>
        {
            entity.ToTable("NavSettings");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.Key).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.Key).IsUnique();
            entity.Property(x => x.CategoryTriggerLabel).HasMaxLength(200).IsRequired();
            entity.Property(x => x.SellerCtaTitle).HasMaxLength(200).IsRequired();
            entity.Property(x => x.SellerCtaHref).HasMaxLength(1000).IsRequired();
        });

        modelBuilder.Entity<NavQuickLink>(entity =>
        {
            entity.ToTable("QuickLinks");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Href).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Icon).HasMaxLength(100);
            entity.Property(x => x.Badge).HasMaxLength(100);
        });

        modelBuilder.Entity<NavMegaCategory>(entity =>
        {
            entity.ToTable("MegaCategories");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Href).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Icon).HasMaxLength(100).IsRequired();
            entity.Property(x => x.AllProductsLabel).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<NavMegaColumn>(entity =>
        {
            entity.ToTable("MegaColumns");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.CategoryExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.CategoryExternalKey);
        });

        modelBuilder.Entity<NavMegaLink>(entity =>
        {
            entity.ToTable("MegaLinks");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.ColumnExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ColumnExternalKey);
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Href).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Kind).HasConversion<int>();
        });
    }
}
