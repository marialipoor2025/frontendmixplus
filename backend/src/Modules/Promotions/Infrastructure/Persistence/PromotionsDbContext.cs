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
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<OfferNomination> OfferNominations => Set<OfferNomination>();

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

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.ToTable("Coupons");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Code).HasMaxLength(64).IsRequired();
            entity.HasIndex(x => x.Code).IsUnique();
            entity.Property(x => x.DiscountLabel).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<OfferNomination>(entity =>
        {
            entity.ToTable("OfferNominations");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.ProductExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SellerExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.RejectionReason).HasMaxLength(500);
            entity.Property(x => x.Status).HasConversion<int>();
            entity.Property(x => x.SalePrice).HasPrecision(18, 2);
            entity.Property(x => x.ListPrice).HasPrecision(18, 2);
            entity.Property(x => x.ProductRating).HasPrecision(4, 2);
            entity.HasIndex(x => new { x.SellerId, x.ProductExternalKey }).IsUnique();
            entity.HasIndex(x => x.Status);
        });
    }
}
