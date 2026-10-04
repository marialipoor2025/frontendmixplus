using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Promotions.Domain;

namespace MixPlus.Modules.Promotions.Infrastructure.Persistence;

public sealed class PromotionsDbContext : DbContext
{
    public const string Schema = "promotions";

    public PromotionsDbContext(DbContextOptions<PromotionsDbContext> options)
        : base(options)
    {
    }

    public DbSet<OfferCampaign> OfferCampaigns => Set<OfferCampaign>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<OfferCampaign>(entity =>
        {
            entity.ToTable("OfferCampaigns");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.ProductKeysJson).HasColumnType("jsonb").IsRequired();
        });
    }
}
