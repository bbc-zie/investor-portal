import { redirect } from "@tanstack/react-router";
import {
  ADMIN_ROLES,
  AUTHENTICATED_ROLES,
  DEFAULT_ACCOUNT_STATUS,
  WEB_ROUTES
} from "@bbc-investor-portal/shared";
import { getAccessToken } from "../api/client";
import { getDevAuthUser } from "./auth-context";

export const requireAuth = () => {
  const user = getDevAuthUser();

  if (!user && getAccessToken()) {
    return null;
  }

  if (!user || user.status !== DEFAULT_ACCOUNT_STATUS) {
    throw redirect({ to: WEB_ROUTES.login });
  }

  return user;
};

export const requireInvestor = () => {
  const user = requireAuth();

  if (!user) return null;

  if (!AUTHENTICATED_ROLES.includes(user.role)) {
    throw redirect({ to: WEB_ROUTES.unauthorized });
  }

  return user;
};

export const requireAdmin = () => {
  const user = requireAuth();

  if (!user) return null;

  if (!ADMIN_ROLES.includes(user.role)) {
    throw redirect({ to: WEB_ROUTES.unauthorized });
  }

  return user;
};
