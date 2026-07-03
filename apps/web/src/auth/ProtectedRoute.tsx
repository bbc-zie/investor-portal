import { Navigate } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import {
  ADMIN_ROLES,
  AUTHENTICATED_ROLES,
  DEFAULT_ACCOUNT_STATUS,
  WEB_ROUTES,
  type UserRole
} from "@bbc-investor-portal/shared";
import { LoadingState } from "../components/states/LoadingState";
import { useAuth } from "./auth-context";

type ProtectedRouteProps = PropsWithChildren<{
  allowedRoles: readonly UserRole[];
}>;

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState label="Loading session" />;
  }

  if (!isAuthenticated || !user || user.status !== DEFAULT_ACCOUNT_STATUS) {
    return <Navigate to={WEB_ROUTES.login} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={WEB_ROUTES.unauthorized} replace />;
  }

  return <>{children}</>;
};

export const InvestorProtectedRoute = ({ children }: PropsWithChildren) => (
  <ProtectedRoute allowedRoles={AUTHENTICATED_ROLES}>{children}</ProtectedRoute>
);

export const AdminProtectedRoute = ({ children }: PropsWithChildren) => (
  <ProtectedRoute allowedRoles={ADMIN_ROLES}>{children}</ProtectedRoute>
);
