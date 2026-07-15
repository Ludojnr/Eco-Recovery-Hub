# Eco Recovery Hub — Backend API

Standalone backend service for the Eco Recovery Hub frontend. It persists the
application state as a JSONB document in Postgres (Neon) and is deployed
independently from the frontend (e.g. on Render).

## Stack

- Node.js (ESM) + Express
- PostgreSQL via `pg` (works with Neon)
- No build step — runs directly with `node`

## Endpoints

| Method | Path           | Description                                           |
| ------ | -------------- | ----------------------------------------------------- |
| GET    | `/api/health`  | Health check (used by Render).                        |
| GET    | `/api/state`   | Load the app-state document for the calling workspace. |
| PUT    | `/api/state`   | Save the app-state document for the calling workspace. |

Every request must include an `x-workspace-id` header. The frontend generates
and stores this id per browser so each client keeps its own data.

Request body for `PUT /api/state`:

```json
{ "data": { "...full app state..." } }
```

## Local development

```bash
cd server
cp .env.example .env   # then fill in DATABASE_URL
npm install
npm run dev            # starts on http://localhost:8080
```

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. Set **Root Directory** to `server`.
4. Build command: `npm install` — Start command: `npm start`.
5. Add environment variables:
   - `DATABASE_URL` — your Neon connection string (`...?sslmode=require`).
   - `CORS_ORIGIN` — your deployed frontend URL (e.g. `https://your-frontend.vercel.app`).
6. Health check path: `/api/health`.

A `render.yaml` blueprint is included, so you can also use Render's
**Blueprint** flow to provision the service automatically.

## Frontend configuration

The frontend reads the API base URL from the `VITE_API_URL` environment
variable. Set it to this service's public URL (e.g.
`https://eco-recovery-hub-api.onrender.com`). If it is not set, the frontend
falls back to local-only storage so it still works offline.
