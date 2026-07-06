import {
  ADMIN_ROLES,
  NDA_REQUIRED_TIERS,
  WEB_ROUTES,
  type AuthenticatedUser
} from "@bbc-investor-portal/shared";

export const isNdaAccepted = (user: AuthenticatedUser) =>
  user.ndaStatus === "SIGNED" || user.ndaStatus === "NOT_REQUIRED";

export const requiresNdaAcceptance = (user: AuthenticatedUser) =>
  !ADMIN_ROLES.includes(user.role) &&
  (NDA_REQUIRED_TIERS as readonly string[]).includes(user.tier) &&
  !isNdaAccepted(user);

export const getDefaultAuthenticatedRoute = (user: AuthenticatedUser) =>
  ADMIN_ROLES.includes(user.role) ? WEB_ROUTES.adminDashboard : WEB_ROUTES.investorDashboard;

export const getPostAuthRoute = (user: AuthenticatedUser, fallback?: string | null) => {
  const destination = fallback || getDefaultAuthenticatedRoute(user);
  if (requiresNdaAcceptance(user)) {
    return `${WEB_ROUTES.nda}?redirect=${encodeURIComponent(destination)}`;
  }

  return destination;
};
