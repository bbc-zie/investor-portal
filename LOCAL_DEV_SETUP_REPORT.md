# Local Dev Setup Report

## Summary
Local development setup for the merged Module 1 app was verified. The API and web environment files exist locally, required development flags are enabled, and the app can be started locally.

## Files Created
- `LOCAL_DEV_SETUP_REPORT.md`

## Files Modified
- None. `apps/api/.env` and `apps/web/.env` already existed and matched the required local development values.

## Environment Setup
- `apps/api/.env` exists locally.
- `apps/web/.env` exists locally.
- Both `.env` files are ignored by the root `.gitignore` rule `.env`.
- Secrets are not included in this report.

API local environment:
- `NODE_ENV=development`
- `PORT=4000`
- `DATABASE_URL` is set locally.
- `DEV_AUTH=true`
- `JWT_SECRET` is set locally.
- `ACCESS_TOKEN_EXPIRES_IN=15m`
- `REFRESH_TOKEN_EXPIRES_IN=7d`

Web local environment:
- `VITE_API_URL=/api`
- `VITE_DEV_AUTH=true`

Vite proxy:
- `/api` is proxied to `http://localhost:4000` in `apps/web/vite.config.ts`.

## Commands Run
- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm run dev:api`
- `npm run dev:web`

## Results
- `npm install` completed successfully.
- `npm run typecheck` passed for all workspaces.
- `npm run build` passed. The first sandboxed attempt failed with `spawn EPERM` from Vite/esbuild, then passed when rerun outside the sandbox.
- `npm run dev:api` started successfully and listened on port `4000`.
- The API `DATABASE_URL` error is gone.
- No API environment variable error remained during startup.
- `npm run dev:web` started successfully and listened on port `5173` when run outside the sandbox.
- No web environment variable error remained during startup.
- No long-running dev process was left running after verification.

## Known Issues
- In the Codex restricted sandbox, Vite/esbuild can fail with `spawn EPERM`. Running the Vite build or dev server normally outside that sandbox succeeds.

## How to Run Locally
Terminal 1:
```bash
npm run dev:api
```

Terminal 2:
```bash
npm run dev:web
```

Open:
```text
http://localhost:5173
```
