using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Media.Domain;

namespace MixPlus.Modules.Media.Infrastructure.Persistence;

public sealed class MediaDbContext : DbContext
{
    public const string Schema = "media";

    public MediaDbContext(DbContextOptions<MediaDbContext> options)
        : base(options)
    {
    }

    public DbSet<MediaAsset> Assets => Set<MediaAsset>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<MediaAsset>(entity =>
        {
            entity.ToTable("Assets");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.OriginalFileName).HasMaxLength(260).IsRequired();
            entity.Property(x => x.ContentType).HasMaxLength(120).IsRequired();
            entity.Property(x => x.RelativeFolder).HasMaxLength(400).IsRequired();
            entity.HasIndex(x => x.CreatedAtUtc);

            entity.OwnsMany(x => x.Variants, variants =>
            {
                variants.ToTable("AssetVariants");
                variants.WithOwner().HasForeignKey("AssetId");
                variants.Property<int>("Id");
                variants.HasKey("Id");
                variants.Property(x => x.Key).HasMaxLength(40).IsRequired();
                variants.Property(x => x.FileName).HasMaxLength(120).IsRequired();
                variants.HasIndex("AssetId", nameof(MediaVariant.Key)).IsUnique();
            });

            entity.Navigation(x => x.Variants)
                .HasField("_variants")
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        });
    }
}
