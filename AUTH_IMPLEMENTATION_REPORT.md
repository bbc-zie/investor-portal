# Authentication Implementation Report

## Summary

Implemented Task 1: authentication foundation. The API now supports real JWT access-token authentication with bcrypt password verification, refresh-token persistence structure, authenticated `/api/auth/*` endpoints, and explicit `DEV_AUTH=true` fallback behavior. The web app now has an Axios auth client, auth context, login form, token attachment, and protected investor/admin route wrappers.

NDA workflow, user management CRUD, opportunities, documents, dashboards beyond route protection, profile, admin modules, capital calls, payments, distributions, audit logs, and reports were not implemented.

## Files Added

- `apps/api/prisma/migrations/20260703210000_auth_foundation/migration.sql`
- `apps/api/prisma/migrations/migration_lock.toml`
- `apps/api/src/lib/auth.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/src/scripts/seedDevUser.ts`
- `apps/web/src/api/auth.ts`
- `apps/web/src/auth/ProtectedRoute.tsx`

## Files Modified

- `apps/api/.env.example`
- `apps/api/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/config/env.ts`
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/routes/index.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/auth/auth-context.tsx`
- `apps/web/src/auth/guards.tsx`
- `apps/web/src/layouts/AdminLayout.tsx`
- `apps/web/src/layouts/InvestorLayout.tsx`
- `apps/web/src/pages/LoginPage.tsx`
- `package-lock.json`
- `packages/shared/src/constants/api.ts`
- `packages/shared/src/types/auth.ts`

## Prisma Changes

- Added nullable `User.passwordHash`.
- Added nullable `User.lastLoginAt`.
- Added `User.refreshTokens` relation.
- Added `RefreshToken` model with:
  - `id`
  - `userId`
  - `tokenHash`
  - `expiresAt`
  - `revokedAt`
  - `createdAt`
  - `updatedAt`
- Added indexes for `RefreshToken.userId`, `tokenHash`, `expiresAt`, and `revokedAt`.
- Created migration SQL at `apps/api/prisma/migrations/20260703210000_auth_foundation/migration.sql`.

## API Endpoints Added

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

The legacy `GET /api/me` remains in place and uses the same authenticated request user.

## Frontend Changes

- Added shared auth API client functions:
  - `login()`
  - `logout()`
  - `getCurrentUser()`
- Axios now attaches `Authorization: Bearer <accessToken>` when an access token is present.
- MVP token persistence uses `localStorage` with a TODO to move to a hardened session strategy.
- Auth context now exposes:
  - `user`
  - `accessToken`
  - `isAuthenticated`
  - `isLoading`
  - `login()`
  - `logout()`
  - `loadCurrentUser()`
- `/login` now submits email/password to the real auth API and redirects:
  - `INVESTOR` to `/investor/dashboard`
  - `ADMIN` and `SUPER_ADMIN` to `/admin/dashboard`
- Investor routes allow `INVESTOR`, `ADMIN`, and `SUPER_ADMIN`.
- Admin routes allow only `ADMIN` and `SUPER_ADMIN`.

## Env Vars Added

Added to `apps/api/.env.example`:

```env
JWT_SECRET=change-me-in-local-env
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

`JWT_SECRET` is required by API auth code when verifying or signing JWTs. No hardcoded production user or JWT secret was added.

## Development User Helper

Added explicit, non-automatic script:

```bash
npm run seed:dev-user --workspace @bbc-investor-portal/api -- --email=dev@example.local --password=replace-with-12-plus-chars
```

Optional flags:

```bash
--name="Development User" --role=INVESTOR --tier=APPROVED_INVESTOR --status=ACTIVE
```

The script refuses to run when `NODE_ENV=production`, requires an explicit email/password or `DEV_USER_EMAIL` and `DEV_USER_PASSWORD`, enforces a minimum 12-character password, and stores only a bcrypt hash.

## Security Notes

- Passwords are verified with bcrypt.
- Refresh tokens are generated as random tokens and stored as SHA-256 hashes.
- JWT secret is read from environment only.
- Middleware authenticates bearer JWTs by default and only accepts development header users when `DEV_AUTH=true`.
- Invalid bearer tokens are rejected with `401`.
- Credentials and plaintext passwords are not logged.
- No production credentials were added to the repository.

## Commands Run and Results

- `npm install bcrypt jsonwebtoken --workspace @bbc-investor-portal/api`
  - First attempt failed due sandbox cache-only registry access.
  - Approved rerun passed.
- `npm install -D @types/jsonwebtoken --workspace @bbc-investor-portal/api`
  - First attempt failed due sandbox cache-only registry access.
  - Approved rerun passed.
- `npm install -D @types/bcrypt --workspace @bbc-investor-portal/api`
  - First attempt failed due sandbox cache-only registry access.
  - Approved rerun passed.
- `npm run typecheck`
  - Initial run failed before Prisma Client regeneration and before `@types/bcrypt`.
  - Final rerun passed for shared, API, and web workspaces.
- `npx prisma validate --schema apps/api/prisma/schema.prisma`
  - Initial run failed because `DATABASE_URL` was not set in the shell.
  - Rerun with a placeholder `DATABASE_URL` passed.
- `npx prisma generate --schema apps/api/prisma/schema.prisma`
  - Initial run with placeholder `DATABASE_URL` failed with sandbox `EPERM`.
  - Approved rerun passed and generated Prisma Client.
- `npm run build`
  - Initial run failed at Vite/esbuild spawn with sandbox `EPERM`.
  - Approved rerun passed for shared, API, and web workspaces.

## Known Issues

- Refresh-token rotation/refresh endpoint is not implemented yet; this task only adds the persistence structure and logout revocation support.
- MVP frontend token storage uses `localStorage`; this should be replaced with a hardened session strategy before production.
- The migration SQL was created but not applied to any database in this task.

## Next Recommended Task

NDA Flow.
