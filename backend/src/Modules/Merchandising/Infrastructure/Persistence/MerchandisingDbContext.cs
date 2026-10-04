using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Merchandising.Domain;

namespace MixPlus.Modules.Merchandising.Infrastructure.Persistence;

public sealed class MerchandisingDbContext : DbContext
{
    public const string Schema = "merchandising";

    public MerchandisingDbContext(DbContextOptions<MerchandisingDbContext> options)
        : base(options)
    {
    }

    public DbSet<HomePageContent> HomePages => Set<HomePageContent>();
    public DbSet<HomeBanner> HomeBanners => Set<HomeBanner>();
    public DbSet<ProductRail> ProductRails => Set<ProductRail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<HomePageContent>(entity =>
        {
            entity.ToTable("HomePages");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.Key).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.Key).IsUnique();
            entity.Property(x => x.PayloadJson).HasColumnType("jsonb").IsRequired();
        });

        modelBuilder.Entity<HomeBanner>(entity =>
        {
            entity.ToTable("HomeBanners");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.ImageUrl).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Href).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Alt).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<ProductRail>(entity =>
        {
            entity.ToTable("ProductRails");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Subtitle).HasMaxLength(500);
            entity.Property(x => x.Href).HasMaxLength(1000);
            entity.Property(x => x.ProductKeysJson).HasColumnType("jsonb").IsRequired();
        });
    }
}
