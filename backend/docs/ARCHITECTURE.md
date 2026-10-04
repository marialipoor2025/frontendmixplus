# MixPlus Modular Monolith Architecture

## Goals

- Single deployable API for the marketplace
- Clear bounded contexts that can later be extracted if needed
- Domain-driven design **inside** each module
- Outside-in delivery driven by frontend contracts

## Composition root

`MixPlus.Api` is the only runnable host. It:

1. Loads configuration (SQL connection, CORS origins)
2. Instantiates each `IModule`
3. Calls `RegisterServices` then `MapEndpoints`
4. Exposes Swagger in Development

Modules must not start their own hosts.

## Module internal architecture (DDD)

```text
Module
├── Domain/           # Aggregates, entities, value objects, domain events
├── Application/      # Use cases, DTOs, ports (interfaces)
├── Infrastructure/   # EF Core, SQL, external adapters
└── Api/              # IModule + HTTP endpoints
```

### Dependency direction

```text
Api → Application → Domain
 Infrastructure → Application + Domain
Host → Api (all modules) + BuildingBlocks
```

Modules **never** reference another module’s project. Cross-module needs use:

- **Read ports** in Application (e.g. Merchandising needs product cards → `IProductCardReadPort` implemented by a Catalog adapter registered in the host), or
- **In-process domain/integration events** published after `SaveChanges` and handled by other modules

## Database strategy

- **One database**: `MixPlus`
- **Default provider: PostgreSQL** via `Npgsql.EntityFrameworkCore.PostgreSQL`
- **Optional provider: SQL Server** — set `Database:Provider` to `SqlServer` (see `UseMixPlusDatabase`)
- **Schema per module**: `catalog`, `sellers`, `merchandising`, `navigation`, `promotions`, …
- Each module has its own `DbContext` and owns EF Core migrations for its schema (see [MIGRATIONS.md](MIGRATIONS.md))
- No foreign keys across schemas in v1 (reference by `Guid` only)
- Prefer portable EF mappings (avoid raw SQL / provider-specific types) so a later SQL Server swap stays cheap

## Building blocks

Shared, non-domain-specific primitives only:

- `Entity`, `AggregateRoot`, `ValueObject`, `IDomainEvent`
- `Money` (matches frontend money shape)
- `Result` / `Result<T>`
- `IModule`

Do **not** put Catalog/Seller business types in BuildingBlocks.

## API style

- ASP.NET Core **minimal APIs** grouped per module
- JSON **camelCase** to match Next.js types
- Versioning: path prefix `/api/...` now; introduce `/api/v1` when contracts stabilize
- OpenAPI via Swashbuckle

## Testing

| Level | Where |
|-------|--------|
| Unit | Domain rules in `tests/MixPlus.Modules.*.UnitTests` |
| Application | Query/command tests with fakes |
| Integration | WebApplicationFactory against SQL (later) |

## What “done” means for a module

1. Domain aggregates cover UI fields for that context  
2. EF mapping + migration for the module schema  
3. Application queries/commands used by endpoints  
4. Endpoints match frontend types (see CONTRACTS.md)  
5. Seed or import path from current frontend mocks  
6. Unit tests for critical invariants  
