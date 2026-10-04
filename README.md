# MixPlus

Household-appliances marketplace (RTL). Monorepo layout:

| Folder | Stack |
|--------|--------|
| [`frontend/`](./frontend) | Next.js 16 + React 19 + Tailwind |
| [`backend/`](./backend) | ASP.NET Core modular monolith + PostgreSQL |

## Run locally

Terminal 1 — API:

```bash
cd backend/src/Host/MixPlus.Api
dotnet run --urls http://127.0.0.1:5080
```

Terminal 2 — site:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Frontend env (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5080
NEXT_PUBLIC_USE_MOCKS=false
```
