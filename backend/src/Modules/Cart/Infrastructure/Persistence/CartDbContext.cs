using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Cart.Domain;

namespace MixPlus.Modules.Cart.Infrastructure.Persistence;

public sealed class CartDbContext : DbContext
{
    public const string Schema = "cart";

    public CartDbContext(DbContextOptions<CartDbContext> options)
        : base(options)
    {
    }

    public DbSet<ShopOrder> Orders => Set<ShopOrder>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    public DbSet<ShoppingCart> Carts => Set<ShoppingCart>();
    public DbSet<CartLine> CartLines => Set<CartLine>();
    public DbSet<CustomerAddress> Addresses => Set<CustomerAddress>();
    public DbSet<WalletAccount> Wallets => Set<WalletAccount>();
    public DbSet<GiftCardLedger> GiftCards => Set<GiftCardLedger>();
    public DbSet<PaymentIntent> Payments => Set<PaymentIntent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<ShopOrder>(entity =>
        {
            entity.ToTable("Orders");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedNever();
            entity.Ignore(x => x.DomainEvents);
            entity.Ignore(x => x.Lines);
            entity.Property(x => x.ExternalKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.CustomerName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.SubtotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.ShippingAmount).HasPrecision(18, 2);
            entity.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            entity.Property(x => x.GiftCardAmount).HasPrecision(18, 2);
            entity.Property(x => x.WalletAmount).HasPrecision(18, 2);
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.Currency).HasMaxLength(8).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.CouponCode).HasMaxLength(64);
            entity.Property(x => x.ShippingMethod).HasMaxLength(64);
            entity.Property(x => x.ShippingLabel).HasMaxLength(200);
            entity.Property(x => x.PickupBranchId).HasMaxLength(64);
            entity.Property(x => x.PickupBranchLabel).HasMaxLength(200);
            entity.Property(x => x.AddressSnapshotJson).HasColumnType("text");
            entity.Property(x => x.PaymentMethod).HasMaxLength(32);
            entity.HasIndex(x => x.UserId);
            entity.HasMany<OrderLine>("_lines")
                .WithOne()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Navigation("_lines").UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<OrderLine>(entity =>
        {
            entity.ToTable("OrderLines");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedNever();
            entity.Property(x => x.ProductSlug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.OfferExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SkuExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SellerName).HasMaxLength(200);
            entity.Property(x => x.Title).HasMaxLength(500).IsRequired();
            entity.Property(x => x.ImageUrl).HasMaxLength(1000);
            entity.Property(x => x.VariantLabel).HasMaxLength(200);
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.Currency).HasMaxLength(8);
        });

        modelBuilder.Entity<ShoppingCart>(entity =>
        {
            entity.ToTable("Carts");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedNever();
            entity.Ignore(x => x.DomainEvents);
            entity.Ignore(x => x.Lines);
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.Property(x => x.CouponCode).HasMaxLength(64);
            entity.Property(x => x.GiftCardCode).HasMaxLength(64);
            entity.Property(x => x.WalletAmountApplied).HasPrecision(18, 2);
            entity.HasMany<CartLine>("_lines")
                .WithOne()
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Navigation("_lines").UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<CartLine>(entity =>
        {
            entity.ToTable("CartLines");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedNever();
            entity.Property(x => x.ProductSlug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.OfferExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SkuExternalKey).HasMaxLength(100).IsRequired();
            entity.Property(x => x.SellerExternalKey).HasMaxLength(100);
            entity.Property(x => x.SellerName).HasMaxLength(200);
            entity.Property(x => x.Title).HasMaxLength(500).IsRequired();
            entity.Property(x => x.ImageUrl).HasMaxLength(1000);
            entity.Property(x => x.VariantLabel).HasMaxLength(200);
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.OriginalPrice).HasPrecision(18, 2);
            entity.Property(x => x.Currency).HasMaxLength(8);
            entity.HasIndex(x => new { x.CartId, x.OfferExternalKey, x.SkuExternalKey });
        });

        modelBuilder.Entity<CustomerAddress>(entity =>
        {
            entity.ToTable("Addresses");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.HasIndex(x => x.UserId);
            entity.Property(x => x.Title).HasMaxLength(100);
            entity.Property(x => x.ReceiverName).HasMaxLength(200);
            entity.Property(x => x.Phone).HasMaxLength(32);
            entity.Property(x => x.Province).HasMaxLength(100);
            entity.Property(x => x.City).HasMaxLength(100);
            entity.Property(x => x.PostalCode).HasMaxLength(20);
            entity.Property(x => x.AddressLine).HasMaxLength(1000);
        });

        modelBuilder.Entity<WalletAccount>(entity =>
        {
            entity.ToTable("Wallets");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.Property(x => x.Balance).HasPrecision(18, 2);
            entity.Property(x => x.Currency).HasMaxLength(8);
        });

        modelBuilder.Entity<GiftCardLedger>(entity =>
        {
            entity.ToTable("GiftCards");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.Code).HasMaxLength(64).IsRequired();
            entity.HasIndex(x => x.Code).IsUnique();
            entity.Property(x => x.Balance).HasPrecision(18, 2);
            entity.Property(x => x.Status).HasMaxLength(16);
        });

        modelBuilder.Entity<PaymentIntent>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(64).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Amount).HasPrecision(18, 2);
            entity.Property(x => x.Currency).HasMaxLength(8);
            entity.Property(x => x.Status).HasMaxLength(32);
            entity.Property(x => x.Gateway).HasMaxLength(64);
            entity.Property(x => x.FailureReason).HasMaxLength(500);
            entity.Property(x => x.CheckoutPayloadJson).HasColumnType("text");
            entity.HasIndex(x => x.UserId);
        });
    }
}
