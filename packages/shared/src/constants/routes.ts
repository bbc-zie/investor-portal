export const WEB_ROUTES = {
  home: "/",
  login: "/login",
  testDb: "/test-db",
  investorDashboard: "/investor/dashboard",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminUserDetail: "/admin/users/$userId",
  adminUserDetailPath: (userId: string) => `/admin/users/${userId}`,
  unauthorized: "/unauthorized",
  notFound: "/not-found"
} as const;
