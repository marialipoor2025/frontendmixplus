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

## Production deploy (Windows server)

From the repo root:

| Script | When to use |
|--------|-------------|
| `powershell -File scripts/deploy/full-deploy.ps1` | After code changes — rebuilds backend (Release) and frontend, restarts both |
| `powershell -File scripts/deploy/fast-deploy.ps1` | Restart only — uses existing builds (config/env changes, crash recovery) |

Options: `-BackendOnly` or `-FrontendOnly` on either script.

Services: frontend `0.0.0.0:3000`, API `0.0.0.0:5080`. Logs under `frontend/logs/` and `backend/logs/`.
