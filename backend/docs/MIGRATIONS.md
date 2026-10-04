# EF Core migrations (per module)

Yes — we use **EF Core migrations**, one history per bounded context.

| Module | DbContext | Schema | History table |
|--------|-----------|--------|---------------|
| Catalog | `CatalogDbContext` | `catalog` | `catalog.__EFMigrationsHistory` |
| Sellers | `SellersDbContext` | `sellers` | `sellers.__EFMigrationsHistory` |
| Merchandising | `MerchandisingDbContext` | `merchandising` | `merchandising.__EFMigrationsHistory` |
| Navigation | `NavigationDbContext` | `navigation` | `navigation.__EFMigrationsHistory` |
| Promotions | `PromotionsDbContext` | `promotions` | `promotions.__EFMigrationsHistory` |

On API startup, `DatabaseInitializer` runs `Database.MigrateAsync()` for each module, then seeds home/nav if empty.

---

## Add a migration (after model change)

From `backend/`:

```bash
dotnet ef migrations add <Name> ^
  --project src/Modules/<Module>/MixPlus.Modules.<Module>.csproj ^
  --startup-project src/Host/MixPlus.Api/MixPlus.Api.csproj ^
  --context <XxxDbContext> ^
  --output-dir Infrastructure/Persistence/Migrations
```

Examples:

```bash
# Catalog
dotnet ef migrations add AddProductBadges ^
  --project src/Modules/Catalog/MixPlus.Modules.Catalog.csproj ^
  --startup-project src/Host/MixPlus.Api/MixPlus.Api.csproj ^
  --context CatalogDbContext ^
  --output-dir Infrastructure/Persistence/Migrations

# Merchandising
dotnet ef migrations add AddHomeBannerAlt ^
  --project src/Modules/Merchandising/MixPlus.Modules.Merchandising.csproj ^
  --startup-project src/Host/MixPlus.Api/MixPlus.Api.csproj ^
  --context MerchandisingDbContext ^
  --output-dir Infrastructure/Persistence/Migrations
```

Or use the helper:

```powershell
.\scripts\add-migration.ps1 -Module Catalog -Name AddProductBadges
```

---

## Apply migrations

**Automatic (recommended):** restart the API — pending migrations apply on startup.

**Manual:**

```bash
dotnet ef database update ^
  --project src/Modules/Catalog/MixPlus.Modules.Catalog.csproj ^
  --startup-project src/Host/MixPlus.Api/MixPlus.Api.csproj ^
  --context CatalogDbContext
```

---

## Incremental workflow

1. Change domain / EF mapping in the module  
2. `dotnet ef migrations add <Name> ...` for that module only  
3. Review the generated `Up`/`Down`  
4. Run / restart API → `MigrateAsync` applies it  
5. Commit migration files with the feature  

Do **not** edit applied migrations; add a new one instead.

---

## Reset module schemas (dev only)

`Seed:ResetDatabase=true` drops module schemas (not the whole DB), then migrations recreate tables and seed runs if empty.

Keep `Seed:Overwrite=false` so restarts do not wipe seeded JSON.
