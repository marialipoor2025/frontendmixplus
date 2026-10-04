using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Identity.Domain;

namespace MixPlus.Modules.Identity.Infrastructure.Persistence;

public sealed class IdentityDbContext : DbContext
{
    public const string Schema = "identity";

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<OtpChallenge> OtpChallenges => Set<OtpChallenge>();
    public DbSet<UserSession> Sessions => Set<UserSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.ExternalKey).HasMaxLength(200).IsRequired();
            entity.HasIndex(x => x.ExternalKey).IsUnique();
            entity.Property(x => x.Phone).HasMaxLength(20);
            entity.Property(x => x.Email).HasMaxLength(320);
            entity.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<OtpChallenge>(entity =>
        {
            entity.ToTable("OtpChallenges");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.Destination).HasMaxLength(320).IsRequired();
            entity.HasIndex(x => x.Destination);
            entity.Property(x => x.Kind).HasConversion<int>();
            entity.Property(x => x.CodeHash).HasMaxLength(128).IsRequired();
        });

        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.ToTable("Sessions");
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.DomainEvents);
            entity.Property(x => x.Token).HasMaxLength(128).IsRequired();
            entity.HasIndex(x => x.Token).IsUnique();
            entity.HasIndex(x => x.UserId);
        });
    }
}
