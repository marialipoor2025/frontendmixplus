using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MixPlus.BuildingBlocks.Infrastructure;

/// <summary>
/// Provider-agnostic EF Core registration. Default is PostgreSQL; set
/// <c>Database:Provider</c> to <c>SqlServer</c> to swap without changing module code.
/// Each module passes its schema so migration history stays isolated.
/// </summary>
public static class DatabaseExtensions
{
    public const string ProviderPostgreSql = "PostgreSQL";
    public const string ProviderSqlServer = "SqlServer";

    public static DbContextOptionsBuilder UseMixPlusDatabase(
        this DbContextOptionsBuilder options,
        IConfiguration configuration,
        string schema,
        string? migrationsAssembly = null,
        string connectionStringName = "MixPlus")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(schema);

        var connectionString = configuration.GetConnectionString(connectionStringName)
            ?? throw new InvalidOperationException(
                $"Connection string '{connectionStringName}' is missing.");

        var provider = configuration["Database:Provider"] ?? ProviderPostgreSql;
        var assembly = migrationsAssembly;

        return provider switch
        {
            ProviderSqlServer => options.UseSqlServer(connectionString, sql =>
            {
                sql.MigrationsHistoryTable("__EFMigrationsHistory", schema);
                if (!string.IsNullOrWhiteSpace(assembly))
                {
                    sql.MigrationsAssembly(assembly);
                }
            }),
            ProviderPostgreSql => options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", schema);
                if (!string.IsNullOrWhiteSpace(assembly))
                {
                    npgsql.MigrationsAssembly(assembly);
                }
            }),
            _ => throw new InvalidOperationException(
                $"Unsupported Database:Provider '{provider}'. Use '{ProviderPostgreSql}' or '{ProviderSqlServer}'."),
        };
    }
}
