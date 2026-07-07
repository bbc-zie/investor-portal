import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import {
  ACCOUNT_STATUSES,
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_INVESTOR_TIER,
  DEFAULT_USER_ROLE,
  INVESTOR_TIERS,
  USER_ROLES,
  type AccountStatus,
  type AuthenticatedUser,
  type InvestorTier,
  type UserRole
} from "@bbc-investor-portal/shared";

export type DevAuthUser = AuthenticatedUser;

type AuthContextValue = {
  user: DevAuthUser | null;
  setDevAuthUser: (user: DevAuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const devAuthEnabled = import.meta.env.VITE_DEV_AUTH === "true";

const readDevAuthValue = <T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]) =>
  typeof value === "string" && allowed.includes(value as T[number]) ? (value as T[number]) : fallback;

const devAuthUser: DevAuthUser = {
  id: import.meta.env.VITE_DEV_AUTH_ID ?? "dev-user",
  email: import.meta.env.VITE_DEV_AUTH_EMAIL ?? "dev-user@example.local",
  name: import.meta.env.VITE_DEV_AUTH_NAME ?? "Development User",
  role: readDevAuthValue(import.meta.env.VITE_DEV_AUTH_ROLE, USER_ROLES, DEFAULT_USER_ROLE) as UserRole,
  tier: readDevAuthValue(import.meta.env.VITE_DEV_AUTH_TIER, INVESTOR_TIERS, DEFAULT_INVESTOR_TIER) as InvestorTier,
  status: readDevAuthValue(
    import.meta.env.VITE_DEV_AUTH_STATUS,
    ACCOUNT_STATUSES,
    DEFAULT_ACCOUNT_STATUS
  ) as AccountStatus
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setDevAuthUser] = useState<DevAuthUser | null>(devAuthEnabled ? devAuthUser : null);
  const value = useMemo(() => ({ user, setDevAuthUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export const getDevAuthUser = () => (devAuthEnabled ? devAuthUser : null);
