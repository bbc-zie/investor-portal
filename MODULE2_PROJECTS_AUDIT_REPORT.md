# Module 2 Projects Audit Report

## Executive Summary

Developer B's Module 2 Projects implementation is partially complete and has the core Projects CRUD shape in place: Project list, detail, create, edit, soft delete, filters, sorting, pagination, status badges, shared types/constants, REST routes, and Prisma model/migration changes are present.

The implementation is not ready for PR. The working tree is not clean, the branch has a large uncommitted auth/NDA implementation mixed with Projects changes, local Prisma verification fails from the repo root, production build fails in the web Vite build step with `spawn EPERM`, authenticated runtime access to `/api/projects` returns `500` because Prisma cannot open the configured TLS connection, and investor read access does not enforce Project visibility. The frontend also contains out-of-scope Documents/Gallery placeholder UI in the Project detail view.

## Final Verdict

NOT READY FOR PR

## Overall Score

68 / 100

## Scope Compliance

FAIL

In scope and implemented:

- Project List: present in `apps/web/src/pages/projects/ProjectsPage.tsx`.
- Project Detail: present in `apps/web/src/pages/projects/ProjectDetailPage.tsx`.
- Create Project: present in `ProjectCreatePage.tsx` and `ProjectForm.tsx`.
- Edit Project: present in `ProjectEditPage.tsx` and `ProjectForm.tsx`.
- Soft Delete Project: present in `DELETE /api/projects/:id`, sets `deletedAt`.
- Project filters: status, location, investment type, and search are present.
- Project sorting: newest, oldest, target raise, alphabetical are present.
- Project pagination: page/pageSize response and Previous/Next controls are present.
- Project status badge: present in `ProjectStatusBadge.tsx`.
- Admin CRUD permissions: mutations use `requireRole(...adminRoles)`.
- Investor read-only access: frontend hides mutation controls for investors, and API mutations reject non-admin roles.
- Projects REST API: expected endpoints exist.
- Projects Prisma schema/migration: Project fields, ProjectStatus, ProjectVisibility, indexes, and migration exist.

Out of scope or scope-risk items found:

- Large auth/NDA implementation is staged in the working tree: `apps/api/src/routes/auth.ts`, auth middleware/lib files, login/NDA pages, auth shared constants/types, auth migration, reports.
- `apps/web/src/pages/projects/ProjectDetailPage.tsx:107` and `:112` include Gallery and Documents placeholder panels. Documents are explicitly out of Module 2 scope.
- Project schema still carries relations to Opportunities, Investments, Distributions, Documents, and AuditLogs because the foundation schema already models them; Module 2 did not implement their workflows.

## Architecture Review

Score: 74 / 100

Findings:

- API route structure is straightforward: `apps/api/src/routes/projects.ts` is mounted from `apps/api/src/routes/index.ts`.
- Validation is isolated in `apps/api/src/lib/projectValidation.ts`, which is appropriate for this module.
- Prisma access stays in the API route and uses transactions for list/count/filter metadata.
- Frontend API client is isolated in `apps/web/src/api/projects.ts` and uses shared endpoint constants.
- Components are reasonably organized under `apps/web/src/components/projects/`.
- TanStack Router definitions for the required admin and investor project routes are present in `apps/web/src/routes.tsx:95-140`.
- Layout impact is limited to adding Projects nav items in Admin and Investor layouts.
- Weakness: authorization and visibility policy are not separated from query construction. Investor reads use the same unrestricted `where: { deletedAt: null }` query as admins.
- Weakness: route params use `useParams({ strict: false })`, which weakens type safety.

## Database Review

Score: 70 / 100

Findings:

- `ProjectStatus` is expanded to `DRAFT`, `COMING_SOON`, `OPEN`, `FUNDED`, `CLOSED`, `ARCHIVED` in `apps/api/prisma/schema.prisma:49`.
- `ProjectVisibility` is added in `apps/api/prisma/schema.prisma:58`.
- `Project` model includes operational fields required by the UI and API in `apps/api/prisma/schema.prisma:192-224`.
- Soft delete is modeled with nullable `deletedAt` and indexed at `apps/api/prisma/schema.prisma:211` and `:224`.
- Migration adds required columns using temporary defaults, then drops defaults for several fields. This is generally safer for existing rows.
- Migration renames and recreates `ProjectStatus`, maps `ACTIVE` to `OPEN`, maps `COMPLETED` to `FUNDED`, and drops the old enum.
- Migration lacks an index on `createdAt`, although list sorting defaults to `createdAt desc`.
- Migration lacks a composite index for common list predicates such as `(deletedAt, status)` or `(deletedAt, visibility)`.
- Migration safety could not be fully verified because `prisma migrate status` failed due missing root-level `DATABASE_URL`.

## API Review

Score: 72 / 100

Expected endpoints:

- `GET /api/projects`: implemented at `apps/api/src/routes/projects.ts:82`.
- `GET /api/projects/:id`: implemented at `apps/api/src/routes/projects.ts:150`.
- `POST /api/projects`: implemented at `apps/api/src/routes/projects.ts:167`.
- `PUT /api/projects/:id`: implemented at `apps/api/src/routes/projects.ts:185`.
- `DELETE /api/projects/:id`: implemented at `apps/api/src/routes/projects.ts:214`.

Findings:

- All Projects routes require authentication via `projectsRouter.use(requireAuthenticated)` at `apps/api/src/routes/projects.ts:80`.
- Admin-only mutations are protected by `requireRole(...adminRoles)`.
- Validation is present for create/update in `validateProjectMutation`.
- Query parsing validates status/sort, clamps page to positive integers, and clamps pageSize to 1-100.
- Soft delete behavior is implemented by updating `deletedAt`.
- Missing: investor read visibility filtering. Investors can list and fetch `PRIVATE`, `DRAFT`, and otherwise non-investor-visible projects if authenticated.
- Missing: duplicate slug handling is not translated into a user-friendly `409 Conflict`; Prisma unique constraint errors will fall to the global error handler.
- Missing: no ID format validation for `:id`.

## Frontend Review

Score: 76 / 100

Findings:

- Required admin routes exist: `/admin/projects`, `/admin/projects/new`, `/admin/projects/$projectId`, `/admin/projects/$projectId/edit`.
- Required investor routes exist: `/investor/projects`, `/investor/projects/$projectId`.
- List page includes loading, error, empty, filters, sorting, pagination, and admin delete controls.
- Investor UI is read-only because `canManage={false}` hides create/edit/delete controls.
- Form covers core project fields and gives basic client-side required-field validation.
- Detail page includes status, visibility, financial fields, timeline, and description.
- Out-of-scope placeholders exist for Gallery and Documents at `apps/web/src/pages/projects/ProjectDetailPage.tsx:107` and `:112`.
- Project list page description says "Manage investment project records and visibility" even for investor users, which is misleading for read-only access.
- Delete mutation errors are not surfaced to the user on list/detail pages.
- Form error handling uses a generic save error and does not display field-specific server validation or unique slug errors.

## Environment Review

Score: 55 / 100

Findings:

- `apps/api/.env.example` includes `DATABASE_URL`, `DEV_AUTH`, JWT, and token expiry values.
- `apps/web/.env.example` includes `VITE_API_URL` and `VITE_DEV_AUTH`.
- `apps/api/src/config/env.ts` loads `apps/api/.env`, parses `PORT`, exposes database/JWT/dev-auth config, and provides required-value helpers.
- `apps/api/.env` exists locally.
- `DATABASE_URL` exists locally.
- `DATABASE_URL` appears placeholder-shaped.
- `DATABASE_URL` starts with `postgresql://`.
- `DATABASE_URL` appears remote or unspecified, not localhost.
- Required env var names exist locally.
- The requested root-level Prisma commands do not load `apps/api/.env`, so Prisma validation/status fail unless `DATABASE_URL` is also present in the shell environment or command execution is changed to run from `apps/api`.

## Build Verification

- `npm run typecheck`: PASS.
  - Shared, API, and web TypeScript typechecks completed successfully.
- `npm run build`: FAIL.
  - Shared build passed.
  - API build passed.
  - Web `tsc` passed, but `vite build` failed while loading `apps/web/vite.config.ts`.
  - Exact failure: `Error: spawn EPERM` from Vite/esbuild service startup.
  - Classification: environment/tooling failure, not an observed TypeScript code failure.
- `npx prisma validate --schema apps/api/prisma/schema.prisma`: FAIL.
  - Exact failure: `P1012 Environment variable not found: DATABASE_URL` at `schema.prisma:7`.
  - Classification: environment/tooling configuration failure from repo root.
- `npx prisma generate --schema apps/api/prisma/schema.prisma`: FAIL.
  - Exact failure: `Error: spawn EPERM`.
  - Classification: environment/tooling failure.
- `npx prisma migrate status --schema apps/api/prisma/schema.prisma`: FAIL.
  - Exact failure: `P1012 Environment variable not found: DATABASE_URL` at `schema.prisma:7`.
  - Classification: environment/tooling configuration failure from repo root.

## Runtime Verification

- API startup result: PASS for basic startup.
  - Started built API briefly with `node apps/api/dist/server.js` on a temporary port and stopped it.
- Projects endpoint result without auth: PASS route reachability.
  - `GET /api/projects` returned `401`, confirming the route is mounted and auth guard runs.
- Projects endpoint result with dev auth: FAIL.
  - `GET /api/projects` with dev auth headers returned `500`.
  - Prisma logged `Error opening a TLS connection: No credentials are available in the security package (os error -2146893042)`.
  - Classification: local database/TLS connection blocker.
- No long-running API process was left alive.

## Security Review

Score: 62 / 100

Findings:

- Admin-only create/update/delete is enforced at the API layer.
- Investor mutation attempts should return `403`.
- Delete is a soft delete, not a hard delete.
- No committed `.env` file was shown in `git status`; local `.env` is present but not staged.
- No secret values were printed during this audit.
- Major gap: investor read endpoints do not enforce Project visibility. Any authenticated investor can retrieve all non-deleted projects, including `PRIVATE` or draft/admin-only records.
- Auth/NDA changes are present in the working tree and should not be bundled with Module 2 unless explicitly required as route compatibility.

## Code Quality Review

Score: 71 / 100

Findings:

- Code is readable and mostly follows existing local patterns.
- Shared constants/types are used consistently.
- No fake project data or hardcoded project arrays found.
- Loading and empty states exist for list/detail/edit.
- TODO/FIXME search found unrelated auth/client TODOs and project detail placeholders.
- Duplicate status/visibility definitions exist across Prisma/shared/API validation; acceptable at this stage but should remain synchronized.
- Query strings are parsed conservatively.
- Error handling is too generic for create/update/delete failures.
- Delete UX uses `window.confirm`, which is acceptable for a basic CRUD module but not polished.
- Currency validation error says "positive numbers" but accepts zero.
- The working tree includes untracked generated/log/report files: `LOCAL_DEV_SETUP_REPORT.md`, `PROJECTS_IMPLEMENTATION_REPORT.md`, `api-startup.err.log`, `api-startup.out.log`, and Projects files.

## Out-of-Scope Changes

Found in current working tree:

- Authentication implementation report: `AUTH_IMPLEMENTATION_REPORT.md`.
- Auth migration: `apps/api/prisma/migrations/20260703210000_auth_foundation/migration.sql`.
- Auth API route and libraries: `apps/api/src/routes/auth.ts`, `apps/api/src/lib/auth.ts`, `authAudit.ts`, `authRateLimit.ts`, `authValidation.ts`.
- Auth middleware changes: `apps/api/src/middleware/auth.ts`.
- Auth scripts: `apps/api/src/scripts/seedDevUser.ts`.
- Web auth client and protected routes: `apps/web/src/api/auth.ts`, `apps/web/src/auth/*`.
- Login/NDA page changes: `apps/web/src/pages/LoginPage.tsx`, `apps/web/src/pages/NdaPage.tsx`.
- Auth shared constants/types/password utilities.
- Auth hardening report: `docs/reports/AUTH_HARDENING_REPORT.md`.
- Project detail includes Documents placeholder UI, which is explicitly out of Module 2 scope.

## Local Run Blockers

1. Root Prisma commands cannot find `DATABASE_URL`.
   - Root cause: requested commands run from repo root with `--schema apps/api/prisma/schema.prisma`; Prisma does not load `apps/api/.env` in that invocation.
   - Severity: High.
   - Exact fix needed: document/run Prisma commands from `apps/api`, or set `DATABASE_URL` in the shell environment before root-level Prisma commands, or adjust npm scripts so env loading is consistent.
   - Estimated time to fix: 15-30 minutes.

2. Local `DATABASE_URL` appears placeholder-shaped and remote/unspecified.
   - Root cause: `apps/api/.env` has the required key but not a usable local database connection.
   - Severity: High.
   - Exact fix needed: replace local `DATABASE_URL` with a valid PostgreSQL connection string, preferably a local development database unless remote access is intentionally required.
   - Estimated time to fix: 15-45 minutes, excluding database provisioning.

3. Authenticated `/api/projects` returns `500`.
   - Root cause: Prisma cannot open a TLS connection with the configured database target: `No credentials are available in the security package`.
   - Severity: High.
   - Exact fix needed: correct local database URL/TLS parameters or use a local PostgreSQL database without incompatible TLS settings.
   - Estimated time to fix: 30-60 minutes.

4. Production web build fails with `spawn EPERM`.
   - Root cause: Vite/esbuild child process startup is blocked by local OS/security/sandbox permissions.
   - Severity: High for PR readiness because `npm run build` is required verification.
   - Exact fix needed: unblock esbuild process execution in the local environment, reinstall dependencies if needed, and rerun `npm run build`.
   - Estimated time to fix: 30-90 minutes depending on workstation policy.

5. `prisma generate` fails with `spawn EPERM`.
   - Root cause: local process execution permission issue.
   - Severity: Medium to High.
   - Exact fix needed: unblock Prisma engine/client generation process execution and rerun generation.
   - Estimated time to fix: 30-90 minutes depending on workstation policy.

## Merge Blockers

- Working tree is not clean; Module 2 Projects is mixed with large staged auth/NDA changes and untracked files.
- Investor read endpoints do not enforce Project visibility or status restrictions.
- `npm run build` fails.
- Prisma validation/status/generation checks fail in the requested command form.
- Authenticated runtime access to `/api/projects` fails with Prisma TLS connection error.
- Out-of-scope Documents/Gallery placeholder UI exists in Project detail.
- Migration status could not be verified against a live local database.

## Non-Blocking Technical Debt

- Add better API error mapping for unique slug conflicts.
- Add route-param validation for project IDs.
- Add database indexes for common list queries and default sorting.
- Improve delete error feedback in the UI.
- Replace generic form save error with server validation messages.
- Replace `window.confirm` with app-native confirmation UI later.
- Improve investor-facing copy on the Projects page.

## Recommended Fix Order

1. Split or clean the working tree so Module 2 Projects is isolated from auth/NDA work.
2. Remove out-of-scope Documents/Gallery placeholder UI from Project detail.
3. Enforce investor read visibility/status rules in `GET /api/projects` and `GET /api/projects/:id`.
4. Fix local database environment so Prisma commands and authenticated Projects requests can run.
5. Resolve `spawn EPERM` for Prisma generate and Vite/esbuild.
6. Rerun `npx prisma validate --schema apps/api/prisma/schema.prisma`, `npx prisma generate --schema apps/api/prisma/schema.prisma`, and `npx prisma migrate status --schema apps/api/prisma/schema.prisma`.
7. Rerun `npm run typecheck` and `npm run build`.
8. Re-probe API startup and `/api/projects` with dev auth.
9. Re-audit scope and status before PR.

## Suggested Next Prompt

```
You are Developer B on branch feature/projects. Fix only the Module 2 Projects merge blockers from MODULE2_PROJECTS_AUDIT_REPORT.md. Do not start Module 3. Do not implement Investments, Capital Calls, Payments, Distributions, Reports, Audit Logs, Opportunities, Documents, Profile, or new auth/NDA behavior. Keep changes scoped to Projects. Specifically: isolate/remove out-of-scope Project detail Documents/Gallery placeholders, enforce investor read visibility/status restrictions on Projects API list/detail while preserving admin access, improve Projects API error handling for duplicate slugs if needed, and make local verification commands pass without altering schema beyond the existing Projects migration. Then run the allowed Prisma checks, npm run typecheck, npm run build, and a short API /api/projects runtime probe. Do not commit or push.
```

## Files Audited

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/`
- `apps/api/prisma/migrations/20260706160000_projects_foundation/migration.sql`
- `apps/api/src/routes/projects.ts`
- `apps/api/src/routes/index.ts`
- `apps/api/src/lib/projectValidation.ts`
- `apps/api/src/config/env.ts`
- `apps/api/.env.example`
- `apps/api/.env` metadata only; secrets not printed
- `apps/web/.env.example`
- `apps/web/src/api/projects.ts`
- `apps/web/src/components/projects/`
- `apps/web/src/pages/projects/`
- `apps/web/src/routes.tsx`
- `apps/web/src/layouts/AdminLayout.tsx`
- `apps/web/src/layouts/InvestorLayout.tsx`
- `packages/shared/src/constants/api.ts`
- `packages/shared/src/constants/routes.ts`
- `packages/shared/src/constants/statuses.ts`
- `packages/shared/src/types/api.ts`
- `packages/shared/src/types/platform.ts`
- Supporting files inspected for runtime/auth behavior: `apps/api/src/server.ts`, `apps/api/src/app.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/middleware/requireRole.ts`, root and API `package.json`.

## Commands Run

- `git branch --show-current`: PASS, current branch `feature/projects`.
- `git status --short`: PASS, many staged/modified/untracked files present.
- `git log --oneline -5`: PASS, latest commits:
  - `d54bff8 Add project documentation structure`
  - `1c44530 Freeze project foundation after cleanup and standardization`
  - `40a22e3 Remove all files`
  - `0d623e8 Initial commit - Investor Portal foundation`
- `git branch -vv`: PASS, `feature/projects` points to `d54bff8` and tracks `origin/feature/projects`; local `develop` and `origin/develop` also point to `d54bff8`.
- `Get-Content` and `Get-ChildItem` inspections over requested files/directories: PASS.
- `rg -n "TODO|FIXME|placeholder|fake|mock|hardcoded..." ...`: PASS, found Project detail Gallery/Documents placeholders and unrelated auth/client TODOs.
- Sanitized `apps/api/.env` metadata check: PASS, `.env` exists and required names exist; values not printed.
- `npx prisma validate --schema apps/api/prisma/schema.prisma`: FAIL, missing `DATABASE_URL` in root command environment.
- `npx prisma generate --schema apps/api/prisma/schema.prisma`: FAIL, `spawn EPERM`.
- `npx prisma migrate status --schema apps/api/prisma/schema.prisma`: FAIL, missing `DATABASE_URL` in root command environment.
- `npm run typecheck`: PASS.
- `npm run build`: FAIL, Vite/esbuild `spawn EPERM`.
- Short API startup probe with no auth: PASS, server started and `GET /api/projects` returned `401`; process stopped.
- Short API startup probe with dev auth: FAIL, `GET /api/projects` returned `500` due Prisma TLS connection error; process stopped.
