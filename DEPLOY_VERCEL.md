# Deploying the full app (frontend + API) on Vercel

The whole application now runs in a **single Vercel project** served from
`kastbhanjan.vercel.app`:

```
kastbhanjan.vercel.app
├── /            -> static Vite frontend            (app/src -> app/dist)
└── /api/*       -> FastAPI Python serverless fn     (app/api/index.py -> app/server)
                                                      |
                                                      v
                                                  Neon Postgres (pooled)
```

Render is no longer needed. The database stays on Neon, unchanged.

## Repository layout (relevant parts)

```
app/                      <- Vercel "Root Directory"
├── api/
│   └── index.py          <- serverless entrypoint, exposes FastAPI `app`
├── server/               <- the FastAPI backend (moved from kastbhanjan-backend/)
│   ├── main.py           <- app + routers (no more import-time seeding)
│   ├── database.py       <- NullPool engine for serverless + Neon pooler
│   ├── init_db.py        <- run once to create tables / seed admin (manual)
│   └── routers/ ...
├── requirements.txt      <- Python deps Vercel installs (slim, no pandas)
├── vercel.json           <- /api routing + includeFiles + PWA headers
├── vite.config.ts        <- dev proxy /api -> localhost:8000
├── src/lib/api.ts        <- baseURL defaults to "/api" (same-origin)
└── .env                  <- VITE_API_URL=/api (local; gitignored)
```

## Vercel project settings

1. **Root Directory:** `app`
2. **Framework Preset:** Vite (auto-detected)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `dist` (default)
5. Python functions under `app/api/` are auto-detected; deps come from
   `app/requirements.txt`.

## Environment variables (Vercel -> Project -> Settings -> Environment Variables)

Set these for **Production** (and Preview if you use it):

| Name           | Value                                                         | Notes |
|----------------|--------------------------------------------------------------|-------|
| `DATABASE_URL` | Neon **pooled** connection string                            | Use the host containing `-pooler`, e.g. `postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require`. Get it from Neon -> Connection Details -> "Pooled connection". |
| `SECRET_KEY`   | A long random string                                         | JWT signing key. **Reuse the same value currently set on Render** so existing logins stay valid; otherwise everyone is logged out. |
| `VITE_API_URL` | `/api`                                                        | Build-time. Frontend then calls the API same-origin. Redeploy after changing (Vite inlines env at build). |

> Why the pooled Neon string? Each serverless invocation can open its own
> Postgres connection. Neon's pooler (the `-pooler` host) multiplexes them so you
> don't exhaust connections. The engine uses `NullPool` to cooperate with it.

## First deploy / cutover steps

1. Commit and push this branch.
2. In Vercel, confirm Root Directory = `app` and add the env vars above.
3. Trigger a deploy (push or "Redeploy").
4. **Test:**
   - `https://kastbhanjan.vercel.app/api/health` -> `{"status":"healthy"}`
   - `https://kastbhanjan.vercel.app/api/docs` -> FastAPI Swagger UI
   - Log in through the app UI (admin@kastbhanjan.com); confirm data loads and
     the Network tab shows calls to `/api/...` returning 200.
5. Once verified, **decommission Render** (suspend/delete the
   `kastbhanjan-backend` service). Nothing points to it anymore.

## Local development

Run the backend and frontend in two terminals:

```bash
# Terminal 1 - API
cd app/server
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r ../requirements.txt
# DATABASE_URL via app/server/.env or your shell; defaults to local Postgres
uvicorn main:app --reload --port 8000

# Terminal 2 - frontend
cd app
npm install
npm run dev        # Vite proxies /api -> http://localhost:8000
```

## Initializing a fresh database (only if needed)

The live Neon DB already has tables and the admin user, so you normally skip
this. For a brand-new database:

```bash
cd app/server
# ensure DATABASE_URL points at the target DB
python init_db.py     # creates tables + seeds product types + admin user
```

## Notes / trade-offs (Hobby plan)

- **Cold starts:** first request after idle takes ~1-2s (still far better than
  Render free, which slept for 30-60s).
- **Function timeout:** ~10s default on Hobby. Current endpoints are simple SQL
  aggregations and finish well within that.
- **No always-on process / background jobs / websockets** — not used by this app.
