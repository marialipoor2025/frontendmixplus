using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Sellers.Domain;

namespace MixPlus.Modules.Sellers.Infrastructure.Persistence;

public sealed class SellersDbContext : DbContext
{
    public const string Schema = "sellers";

    public SellersDbContext(DbContextOptions<SellersDbContext> options)
        : base(options)
    {
    }

    public DbSet<Seller> Sellers => Set<Seller>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<Seller>(entity =>
        {
            entity.ToTable("Sellers");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.HasIndex(x => x.Slug).IsUnique();
        });
    }
}
