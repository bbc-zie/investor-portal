export const WEB_ROUTES = {
  home: "/",
  login: "/login",
  nda: "/nda",
  testDb: "/test-db",
  investorDashboard: "/investor/dashboard",
  investorProjects: "/investor/projects",
  investorProjectDetail: "/investor/projects/$projectId",
  adminDashboard: "/admin/dashboard",
  adminProjects: "/admin/projects",
  adminProjectCreate: "/admin/projects/new",
  adminProjectDetail: "/admin/projects/$projectId",
  adminProjectEdit: "/admin/projects/$projectId/edit",
  unauthorized: "/unauthorized",
  notFound: "/not-found"
} as const;
