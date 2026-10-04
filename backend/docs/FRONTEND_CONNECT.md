# Task list: connect MixPlus frontend → backend

API base (local): `http://localhost:5080`  
Contracts: `GET /api/home`, `GET /api/nav` (seeded from frontend mocks into PostgreSQL).

---

## Phase A — Point Next.js at the API (done)

| # | Task | Status |
|---|------|--------|
| A1 | Create `.env.local` with API base + `USE_MOCKS=false` | Done |
| A2 | `siteConfig` reads those vars | Done |
| A3 | API running on `:5080` | Done |
| A4 | Rebuild + restart Next (`npm run build` + `start-mixplus.ps1`) | Done — routes are dynamic `ƒ` |
| A5 | Verified HTML reflects DB/API payload (marker test) | Done |

---

## Phase B — CORS / SSR fetch correctness

| # | Task | Done when |
|---|------|-----------|
| B1 | Confirm backend CORS allows `http://localhost:3000` and public IP origin if used | No CORS errors in browser |
| B2 | If homepage is a Server Component, ensure `apiClient` fetch works from Node (absolute URL via `apiBaseUrl`) | No `Failed to parse URL` on server |
| B3 | Handle API down gracefully (optional): fallback message or keep mocks only in explicit offline mode | Clear error instead of blank page |

---

## Phase C — Contract alignment checks

| # | Task | Done when |
|---|------|-----------|
| C1 | Diff `GET /api/home` JSON vs `src/types/home.ts` / mock shape | Types assign without casts |
| C2 | Diff `GET /api/nav` JSON vs `src/types/nav.ts` | Mega-menu + quick links render |
| C3 | Confirm relative image URLs (`/images/...`) still resolve on the Next origin | Hero/categories/brands images visible |
| D4 | Persian strings render correctly (UTF-8) | No mojibake in UI |

---

## Phase D — Ops / daily workflow

| # | Task | Done when |
|---|------|-----------|
| D1 | Document two terminals: API on `:5080`, frontend on `:3000` | Team can start both |
| D2 | Re-seed: set `Seed:Overwrite=true` once, restart API | DB payload refreshed from `Seed/data/*.json` |
| D3 | Keep `Seed:Overwrite=false` and `Seed:ResetDatabase=false` | API restarts do not wipe DB |
| D4 | Production: never use `ResetDatabase`; ship migrations later | Safe deploys |

---

## Phase E — Next backend increments (after front is live)

| # | Task | Module |
|---|------|--------|
| E1 | Normalize Catalog products/brands/categories from seed JSON into tables | Catalog |
| E2 | Compose `/api/home` from Catalog + Promotions + Merchandising (replace JSON blob) | Merchandising |
| E3 | Normalize nav tree tables (replace nav JSON blob) | Navigation |
| E4 | Wire Identity / Cart / Search when their UI pages exist | stubs |

---

## Quick commands

```bash
# Backend
cd backend
dotnet run --project src/Host/MixPlus.Api

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
NEXT_PUBLIC_USE_MOCKS=false

# Smoke test
curl http://127.0.0.1:5080/api/home
curl http://127.0.0.1:5080/api/nav
```
