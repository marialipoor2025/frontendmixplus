# Incremental module roadmap

Order follows **outside-in**: complete modules that unblock the homepage API, then modules for the next frontend pages.

## Phase 0 — Scaffold (done)

- [x] Solution + host + building blocks
- [x] Module projects for homepage contexts + later stubs
- [x] Placeholder `GET /api/home` and `GET /api/nav`
- [x] Catalog domain seeds (Product / Brand / Category aggregates)
- [x] README + architecture docs

## Phase 1 — Catalog

Goal: durable product/brand/category data matching homepage cards.

- [x] EF migrations for schema `catalog`
- [x] Seed from `home.json` products / brands / categories
- [x] Endpoints: `GET /api/catalog/products`, `/brands`, `/categories`
- [x] Public read port for other modules (`IProductCardReadPort`)
- [x] Compose `/api/home` sections from Catalog (replace JSON blob gradually)

## Phase 2 — Sellers

Goal: seller masters for denormalized names on product cards + future seller pages.

- [x] EF migrations for schema `sellers`
- [x] Seed sellers referenced by mock products
- [ ] Sync/denormalize seller name into Catalog on write (application policy)

## Phase 3 — Promotions

Goal: amazing-offers membership + optional campaign windows.

- [x] EF migrations for schema `promotions`
- [x] Offer campaign aggregate + product key list
- [x] Query: active amazing-offer product keys for Merchandising (`IOfferCampaignReadPort`)

## Phase 4 — Merchandising (homepage complete)

Goal: real `GET /api/home` identical in shape to frontend `HomePageData`.

- [x] Persist banners + product rails
- [x] Compose home DTO via Catalog + Promotions ports
- [x] Seed homepage layout from mocks
- [x] Frontend switch: `NEXT_PUBLIC_USE_MOCKS=false`

## Phase 5 — Navigation

Goal: real `GET /api/nav` matching `MainNavData`.

- [x] Persist mega-menu tree + quick links
- [x] Seed from `nav.json` (frontend mock export)
- [x] Wire layout to live API (`NEXT_PUBLIC_USE_MOCKS=false`)

## Phase 6+ — Next frontend surfaces

Implement when the corresponding UI is built:

| When frontend lands | Backend module |
|---------------------|----------------|
| Login / profile / wishlist | Identity |
| Cart drawer with lines | Cart |
| Search results page | Search |
| Support chat backend | Support |
| Product detail page | Catalog (extend) |
| Category PLP | Catalog (extend) |
| Seller join / seller shop | Sellers (extend) |

## Working agreement

- One module (or one vertical slice) per increment
- Keep DTOs aligned with `src/types` until OpenAPI is the source of truth
- Prefer finishing homepage APIs before starting Identity/Cart
