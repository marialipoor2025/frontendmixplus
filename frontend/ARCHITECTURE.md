# MixPlus Frontend Architecture

Household-appliances marketplace inspired by Digikala. Frontend and backend are developed separately, then plugged together.

## Stack

- **Frontend:** React + Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** ASP.NET Core modular monolith in [`../backend/`](../backend/README.md) (.NET 8 + EF Core + PostgreSQL; SQL Server swappable via config)
- **Data:** live API via `src/lib/api` (mocks still available with `NEXT_PUBLIC_USE_MOCKS=true`)

## Outside-in homepage plan

Build the homepage from the outside in — shell first, then each Digikala-like section as its design is provided:

1. TopBanner
2. ~~Header / Search / Auth / Cart~~ → `SiteHeader` (+ `HeaderSearch`, `HeaderUserActions`)
3. MainNav / CategoryMenu
4. HeroSlider
5. CategoryGrid
6. AmazingOffers
7. MidBanners
8. BrandShowcase
9. ProductRails
10. BottomBanners / Footer

## Folder map

```text
src/
  app/                 # Next.js routes
  components/
    layout/            # Header, Footer, shared chrome
    home/              # Homepage sections (one folder/file per section)
    ui/                # Reusable primitives (ProductCard, etc.)
  config/              # Site + env-driven settings
  lib/
    api/               # API client + feature fetchers
    mocks/             # Mock responses until ASP.NET Core is ready
  types/               # Shared domain types
```

## Mock → real API switch

1. Keep UI components consuming only `src/lib/api/*` functions.
2. Implement matching endpoints in `backend/` modules (see `backend/docs/CONTRACTS.md`).
3. Set in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
NEXT_PUBLIC_USE_MOCKS=false
```

Homepage-driven modules: Catalog, Sellers, Merchandising, Navigation, Promotions. Incremental order: `../backend/docs/ROADMAP.md`.

## How we will build each component

For every Digikala homepage section you share:

1. Inspect the reference (screenshot / URL / node).
2. Create `src/components/home/<SectionName>/`.
3. Wire mock data through `getHomePageData()`.
4. Replace the matching `SectionPlaceholder` in `HomePage.tsx`.
