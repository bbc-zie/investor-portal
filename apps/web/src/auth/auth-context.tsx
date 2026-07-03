import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import {
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_USER_ROLE,
  type AuthenticatedUser
} from "@bbc-investor-portal/shared";

export type DevAuthUser = AuthenticatedUser;

type AuthContextValue = {
  user: DevAuthUser | null;
  setDevAuthUser: (user: DevAuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const devAuthEnabled = import.meta.env.VITE_DEV_AUTH === "true";

const devAuthUser: DevAuthUser = {
  id: "dev-user",
  email: "dev-user@example.local",
  name: "Development User",
  role: DEFAULT_USER_ROLE,
  tier: "APPROVED_INVESTOR",
  status: DEFAULT_ACCOUNT_STATUS
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
