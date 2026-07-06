import { createRootRoute, createRoute } from "@tanstack/react-router";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { requireAdmin, requireInvestor } from "./auth/guards";
import { AdminLayout } from "./layouts/AdminLayout";
import { InvestorLayout } from "./layouts/InvestorLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { RootLayout } from "./layouts/RootLayout";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { HomePage } from "./pages/HomePage";
import { InvestorDashboardPage } from "./pages/investor/InvestorDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NdaPage } from "./pages/NdaPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TestDbPage } from "./pages/TestDbPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error.message}
      </div>
    </PublicLayout>
  )
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout
});

const investorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "investor",
  beforeLoad: requireInvestor,
  component: InvestorLayout
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  beforeLoad: requireAdmin,
  component: AdminLayout
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: WEB_ROUTES.home,
  component: HomePage
});

const loginRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: WEB_ROUTES.login,
  component: LoginPage
});

const ndaRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: WEB_ROUTES.nda,
  component: NdaPage
});

const testDbRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: WEB_ROUTES.testDb,
  component: TestDbPage
});

const unauthorizedRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: WEB_ROUTES.unauthorized,
  component: UnauthorizedPage
});

const notFoundRoutePage = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: WEB_ROUTES.notFound,
  component: NotFoundPage
});

const investorDashboardRoute = createRoute({
  getParentRoute: () => investorLayoutRoute,
  path: WEB_ROUTES.investorDashboard,
  component: InvestorDashboardPage
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: WEB_ROUTES.adminDashboard,
  component: AdminDashboardPage
});

export const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([homeRoute, loginRoute, ndaRoute, testDbRoute, unauthorizedRoute, notFoundRoutePage]),
  investorLayoutRoute.addChildren([investorDashboardRoute]),
  adminLayoutRoute.addChildren([adminDashboardRoute])
]);
