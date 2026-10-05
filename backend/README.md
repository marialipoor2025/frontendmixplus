# MixPlus Backend

ASP.NET Core **modular monolith** for the MixPlus marketplace. Built **outside-in**: frontend pages first, then backend bounded contexts derived from what the UI already needs.

Stack: **.NET 8**, **EF Core**, **PostgreSQL** (default; SQL Server supported via config), single deployable host (`MixPlus.Api`).

---

## Outside-in approach

1. Build / stabilize a frontend surface (homepage done).
2. Infer bounded contexts from screens, types, and mock APIs.
3. Scaffold the matching module with DDD layers.
4. Implement persistence + endpoints to match frontend contracts.
5. Point Next.js at the API (`NEXT_PUBLIC_USE_MOCKS=false`).
6. Repeat for the next page / feature.

Today the live frontend contracts are:

| Frontend | Endpoint | Owning module |
|----------|----------|---------------|
| `getHomePageData()` | `GET /api/home` | Merchandising (composes Catalog + Promotions) |
| `getMainNavData()` | `GET /api/nav` | Navigation |

Contracts live in `../src/types/*` on the frontend and are mirrored as DTOs under each module’s `Application/` folder.

---

## Bounded contexts (from homepage)

| Module | Status | Owns | Homepage evidence |
|--------|--------|------|-------------------|
| **Catalog** | Active skeleton | Products, brands, categories | Product cards, category circles, brand showcase |
| **Sellers** | Active skeleton | Seller masters | `sellerId` / `sellerName` on every product |
| **Merchandising** | Active skeleton | Home composition, banners, rails | Hero / mid / bottom banners, product rails, home API |
| **Navigation** | Active skeleton | Mega-menu + quick links | Header / mobile drawer nav API |
| **Promotions** | Active skeleton | Offer campaigns | Amazing offers rail |
| **Identity** | Active | OTP login/register, opaque session tokens, `/me` + logout | Header login + profile gate |
| **Media** | Active | Local disk binaries + ImageSharp variants | Admin/product media uploads |
| **Cart** | Stub | Cart & checkout | Cart popover / `/checkout/cart/` |
| **Search** | Stub | Search & discovery | Search bar / `/search` |
| **Support** | Stub | Chat, enquiry, FAQ | Support chat FAB / top-bar |

---

## Solution layout

```text
backend/
  MixPlus.sln
  Directory.Build.props
  README.md
  docs/
    ARCHITECTURE.md     # modular monolith + DDD rules
    ROADMAP.md          # incremental module completion order
    CONTRACTS.md        # frontend ↔ API mapping
  src/
    Host/
      MixPlus.Api/      # composition root (Program.cs, Swagger, CORS)
    BuildingBlocks/
      MixPlus.BuildingBlocks/   # Entity, AggregateRoot, Money, Result, IModule
    Modules/
      Catalog/          # Domain / Application / Infrastructure / Api
      Sellers/
      Merchandising/
      Navigation/
      Promotions/
      Identity/         # stub
      Cart/             # stub
      Search/           # stub
      Support/          # stub
  tests/
    MixPlus.Modules.Catalog.UnitTests/
```

Each **active** module is one project with internal layers:

| Layer | Responsibility |
|-------|----------------|
| `Domain/` | Aggregates, value objects, domain rules — no EF, no HTTP |
| `Application/` | Queries/commands, DTOs matching frontend, ports (interfaces) |
| `Infrastructure/` | EF Core `DbContext`, SQL schema ownership, adapters |
| `Api/` | `IModule` registration + minimal API endpoints |

---

## Architecture rules

1. **One deployable** — `MixPlus.Api` hosts all modules.
2. **No cross-module DbContext writes** — each module owns its DB schema (`catalog`, `sellers`, `merchandising`, …).
3. **No project references between modules** — communicate via application ports / in-process events registered in the host.
4. **DDD per module** — aggregates enforce invariants; application services orchestrate use cases.
5. **Frontend is the contract source** — DTOs stay aligned with `src/types` until a versioned OpenAPI contract is published.
6. **Stubs stay thin** until their frontend page exists (outside-in).

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- **PostgreSQL** 14+ (EF Core via [Npgsql](https://www.npgsql.org/efcore/))
- (Optional) EF Core tools: `dotnet tool install -g dotnet-ef`

---

## Database: PostgreSQL now, SQL Server later

Yes — EF Core works with PostgreSQL. The host selects the provider from config:

```json
"Database": {
  "Provider": "PostgreSQL"
},
"ConnectionStrings": {
  "MixPlus": "Host=localhost;Port=5432;Database=mixplus;Username=mixplus;Password=mixplus_dev"
}
```

Local bootstrap (already done on this machine): database `mixplus`, role `mixplus` / password `mixplus_dev`. Change the password for any shared/non-dev environment.

To switch to SQL Server later (no module code changes):

```json
"Database": {
  "Provider": "SqlServer"
},
"ConnectionStrings": {
  "MixPlus": "Server=localhost;Database=MixPlus;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

Provider wiring lives in `BuildingBlocks/Infrastructure/DatabaseExtensions.cs` (`UseMixPlusDatabase`).  
**Caveat:** EF migrations are provider-sensitive — regenerate or maintain separate migrations when you swap. Domain/application code stays the same.

---

## Quick start

```bash
cd backend

# restore & build
dotnet restore MixPlus.sln
dotnet build MixPlus.sln

# run API (Swagger at http://localhost:5080/swagger)
dotnet run --project src/Host/MixPlus.Api

# unit tests
dotnet test MixPlus.sln
```

### Wire the Next.js frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
NEXT_PUBLIC_USE_MOCKS=false
```

---

## Seeded homepage / nav data

On startup the host:

1. Creates module schemas/tables in PostgreSQL  
2. Loads `Seed/data/home.json` + `nav.json` (exported from frontend mocks)  
3. Stores them in `merchandising."HomePages"` and `navigation."NavContents"`  
4. Serves them from `GET /api/home` and `GET /api/nav`

Re-export mocks after frontend data changes:

```bash
npx tsx -e "import { writeFileSync } from 'fs'; import { mockHomePageData } from '../../frontend/src/lib/mocks/home.ts'; import { mockMainNavData } from '../../frontend/src/lib/mocks/nav.ts'; writeFileSync('src/Host/MixPlus.Api/Seed/data/home.json', JSON.stringify(mockHomePageData, null, 2)); writeFileSync('src/Host/MixPlus.Api/Seed/data/nav.json', JSON.stringify(mockMainNavData, null, 2));"
```

(from the `backend/` folder, adjust relative paths as needed)

Connect the Next.js app: [docs/FRONTEND_CONNECT.md](docs/FRONTEND_CONNECT.md).

### EF Core migrations

Each module owns its schema and migration history. Startup runs `MigrateAsync()` automatically.

See [docs/MIGRATIONS.md](docs/MIGRATIONS.md). Quick add:

```powershell
.\scripts\add-migration.ps1 -Module Catalog -Name AddSomething
```

## Incremental completion order

See [docs/ROADMAP.md](docs/ROADMAP.md). Short version:

1. **Catalog** — persist products/brands/categories; seed from frontend mocks  
2. **Sellers** — seller masters referenced by catalog  
3. **Promotions** — amazing-offers campaign membership  
4. **Merchandising** — real `GET /api/home` composition  
5. **Navigation** — real `GET /api/nav` tree  
6. Later stubs as their frontend pages land: Identity → Cart → Search → Support  

---

## Health checks

| URL | Meaning |
|-----|---------|
| `GET /health` | Host + registered module names |
| `GET /api/catalog/health` | Catalog module |
| `GET /api/home` | Homepage DTO (empty shell until Merchandising is implemented) |
| `GET /api/nav` | Nav DTO (minimal shell until Navigation is implemented) |

---

## Related

- Frontend architecture: [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- Frontend types: `../src/types/`
- Frontend mocks: `../frontend/src/lib/mocks/`
