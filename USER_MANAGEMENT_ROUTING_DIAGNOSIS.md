# User Management Routing Diagnosis

## Root Cause

`/admin/users` and `/admin/users/:userId` are not registered in the TanStack Router route tree.

The router does not import `AdminUsersPage` or `AdminUserDetailPage`, does not create routes for User Management, and does not add User Management routes to `routeTree`.

The current app only has these admin routes registered:

- `/admin/dashboard`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/$projectId`
- `/admin/projects/$projectId/edit`

Therefore, visiting:

- `/admin/users`
- `/admin/users/1`

cannot render User Management because no matching route exists for either URL.

If the browser shows Login for those URLs, that is not because User Management routed correctly and failed inside the page. It means the app is hitting an auth redirect path before any User Management page can render. The relevant auth redirect is configured on the pathless admin route via `beforeLoad: requireAdmin`, and `requireAdmin` redirects unauthenticated users to `/login`.

## Evidence

### 1. Is `AdminUsersPage` actually imported into the router?

No.

`apps/web/src/routes.tsx` imports:

- `AdminDashboardPage`
- `HomePage`
- `InvestorDashboardPage`
- `LoginPage`
- `NdaPage`
- `NotFoundPage`
- Project pages
- `TestDbPage`
- `UnauthorizedPage`

It does not import `AdminUsersPage`.

Search result:

- `rg "AdminUsersPage"` returned no matches.

### 2. Is `AdminUserDetailPage` imported into the router?

No.

`apps/web/src/routes.tsx` does not import `AdminUserDetailPage`.

Search result:

- `rg "AdminUserDetailPage"` returned no matches.

### 3. Is `/admin/users` registered?

No.

`packages/shared/src/constants/routes.ts` does not define an admin users route.

Current admin route constants are:

```ts
adminDashboard: "/admin/dashboard",
adminProjects: "/admin/projects",
adminProjectCreate: "/admin/projects/new",
adminProjectDetail: "/admin/projects/$projectId",
adminProjectEdit: "/admin/projects/$projectId/edit",
```

No `adminUsers` or `/admin/users` route exists.

### 4. Is `/admin/users/:userId` registered?

No.

There is no route constant for `/admin/users/$userId` or `/admin/users/:userId`, and there is no `createRoute` call for a user detail route in `apps/web/src/routes.tsx`.

### 5. Is TanStack Router generating these routes?

No.

This project is using a manually composed route tree in `apps/web/src/routes.tsx`; no generated route tree file exists under `apps/web/src`.

Evidence:

- `apps/web/src/router.tsx` imports `routeTree` from `./routes`.
- `apps/web/src/routes.tsx` manually calls `createRoute`.
- `rg --files apps/web/src | rg "route|router|gen|tree|users|Users|User"` found only:
  - `apps/web/src/routes.tsx`
  - `apps/web/src/router.tsx`

There is no generated route artifact containing User Management routes.

### 6. Is `routes.tsx` actually using these pages?

No.

`routes.tsx` does not reference `AdminUsersPage` or `AdminUserDetailPage` anywhere.

It only registers admin dashboard and project routes:

```ts
adminLayoutRoute.addChildren([
  adminDashboardRoute,
  adminProjectsRoute,
  adminProjectCreateRoute,
  adminProjectDetailRoute,
  adminProjectEditRoute
])
```

### 7. Is the `AdminLayout` rendering an `<Outlet />`?

Yes.

`apps/web/src/layouts/AdminLayout.tsx` imports `Outlet` from `@tanstack/react-router` and renders:

```tsx
<main className="p-4 sm:p-6">
  <Outlet />
</main>
```

The layout is capable of rendering child admin routes. The problem is that User Management child routes are not registered.

### 8. Is the auth guard redirecting to `/login`?

Yes, when the admin route guard runs and no valid authenticated admin user is available.

Evidence in `apps/web/src/auth/guards.tsx`:

```ts
if (!user || user.status !== DEFAULT_ACCOUNT_STATUS) {
  throw redirect({ to: WEB_ROUTES.login });
}
```

`requireAdmin()` calls `requireAuth()`, so unauthenticated admin-route access redirects to `/login`.

There is also a component-level guard in `apps/web/src/auth/ProtectedRoute.tsx`:

```tsx
if (!isAuthenticated || !user || user.status !== DEFAULT_ACCOUNT_STATUS) {
  return <Navigate to={WEB_ROUTES.login} replace />;
}
```

### 9. Is the router falling back to Login because the routes do not exist?

Not exactly.

The router is not falling back to Login as a not-found route. The configured not-found component is `NotFoundPage`, not `LoginPage`.

Evidence in `apps/web/src/routes.tsx`:

```ts
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  ...
});
```

Login appears only through auth redirects:

- `requireAuth()` throws `redirect({ to: WEB_ROUTES.login })`.
- `ProtectedRoute` returns `<Navigate to={WEB_ROUTES.login} replace />`.

So Login is caused by authentication guard behavior, not by TanStack Router generating or resolving `/admin/users`.

### 10. Exactly why `/admin/users` renders Login instead of User Management

`/admin/users` renders Login instead of User Management because:

1. No `AdminUsersPage` implementation was found.
2. `AdminUsersPage` is not imported by `apps/web/src/routes.tsx`.
3. No `WEB_ROUTES.adminUsers` constant exists.
4. No `createRoute` call registers `/admin/users`.
5. No `/admin/users` route is added to `routeTree`.
6. If the admin auth guard runs while the user is unauthenticated or invalid, it redirects to `/login`.

The missing route is the primary routing defect. The Login screen is the auth guard outcome, not the User Management page.

### 11. Exactly why `/admin/users/1` renders Login instead of User Management

`/admin/users/1` renders Login instead of User Management because:

1. No `AdminUserDetailPage` implementation was found.
2. `AdminUserDetailPage` is not imported by `apps/web/src/routes.tsx`.
3. No `WEB_ROUTES.adminUserDetail` constant exists.
4. No `createRoute` call registers `/admin/users/$userId`.
5. No `/admin/users/$userId` route is added to `routeTree`.
6. If the admin auth guard runs while the user is unauthenticated or invalid, it redirects to `/login`.

The URL cannot render a user detail page because no matching user detail route exists.

## Files Inspected

- `apps/web/src/routes.tsx`
- `apps/web/src/router.tsx`
- `apps/web/src/layouts/AdminLayout.tsx`
- `apps/web/src/auth/guards.tsx`
- `apps/web/src/auth/ProtectedRoute.tsx`
- `apps/web/src/auth/auth-context.tsx`
- `apps/web/src/pages/`
- `apps/web/src/pages/admin/AdminDashboardPage.tsx`
- `apps/web/src/pages/NotFoundPage.tsx`
- `packages/shared/src/constants/routes.ts`

## Whether Implementation Exists

No User Management page implementation was found.

Evidence:

- `apps/web/src/pages/admin/` contains `AdminDashboardPage.tsx`.
- No `AdminUsersPage.tsx` file was found.
- No `AdminUserDetailPage.tsx` file was found.
- `rg "AdminUsersPage|AdminUserDetailPage|User Management"` returned no page implementation matches.

## Whether Routing Exists

No.

Missing routing pieces:

- No `WEB_ROUTES.adminUsers`.
- No `WEB_ROUTES.adminUserDetail`.
- No `AdminUsersPage` import in `routes.tsx`.
- No `AdminUserDetailPage` import in `routes.tsx`.
- No `adminUsersRoute`.
- No `adminUserDetailRoute`.
- No user routes added to `adminLayoutRoute.addChildren(...)`.

## Whether Auth Is Causing Redirect

Yes, Login is produced by auth redirect behavior when the admin guard runs without a valid admin session.

However, auth is not the root cause of User Management failing to render. Even with valid auth, the User Management routes still do not exist in the route tree.

Expected behavior by scenario:

- Unauthenticated access: redirects to `/login`.
- Authenticated non-admin access: redirects to `/unauthorized`.
- Authenticated admin access: would still fail to render User Management because `/admin/users` and `/admin/users/$userId` are not registered.

## Exact Fix Recommendation

Do not change auth behavior.

The exact routing fix is:

1. Add route constants:
   - `adminUsers: "/admin/users"`
   - `adminUserDetail: "/admin/users/$userId"`
2. Create or confirm page implementations:
   - `AdminUsersPage`
   - `AdminUserDetailPage`
3. Import both pages into `apps/web/src/routes.tsx`.
4. Add TanStack routes:
   - `adminUsersRoute`
   - `adminUserDetailRoute`
5. Add both routes to:
   - `adminLayoutRoute.addChildren([...])`
6. Optionally add an Admin sidebar nav item for Users.

## Estimated Fix Time

Routing-only fix, assuming page components already exist elsewhere:

- 15-30 minutes.

Routing plus creating minimal missing page shells:

- 45-90 minutes.

Routing plus complete User Management implementation:

- Not estimated here because this audit is routing-only and feature implementation is out of scope.
