import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  AUTH_ERROR_MESSAGES,
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_USER_ROLE,
  type AuthenticatedUser,
  type LoginRequest
} from "@bbc-investor-portal/shared";
import { acceptNda as acceptNdaRequest, getCurrentUser, login as loginRequest, logout as logoutRequest } from "../api/auth";
import { clearAuthTokens, getAccessToken, setAuthSessionMessage, setAuthTokens } from "../api/client";

export type DevAuthUser = AuthenticatedUser;

type AuthContextValue = {
  user: DevAuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<DevAuthUser>;
  logout: () => Promise<void>;
  acceptNda: () => Promise<DevAuthUser>;
  loadCurrentUser: () => Promise<DevAuthUser | null>;
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
  status: DEFAULT_ACCOUNT_STATUS,
  ndaStatus: "SIGNED",
  ndaSignedAt: new Date().toISOString()
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setDevAuthUser] = useState<DevAuthUser | null>(devAuthEnabled ? devAuthUser : null);
  const [accessToken, setAccessToken] = useState<string | null>(devAuthEnabled ? "dev-auth-token" : getAccessToken());
  const [isLoading, setIsLoading] = useState(!devAuthEnabled && Boolean(getAccessToken()));

  const loadCurrentUser = useCallback(async () => {
    if (devAuthEnabled) {
      setDevAuthUser(devAuthUser);
      setAccessToken("dev-auth-token");
      return devAuthUser;
    }

    const token = getAccessToken();
    if (!token) {
      setDevAuthUser(null);
      setAccessToken(null);
      return null;
    }

    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setDevAuthUser(currentUser);
      setAccessToken(token);
      return currentUser;
    } catch (_error) {
      clearAuthTokens();
      setAuthSessionMessage(AUTH_ERROR_MESSAGES.expiredSession);
      setDevAuthUser(null);
      setAccessToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    if (devAuthEnabled) {
      setAuthTokens("dev-auth-token");
      setDevAuthUser(devAuthUser);
      setAccessToken("dev-auth-token");
      return devAuthUser;
    }

    const response = await loginRequest(credentials);
    setDevAuthUser(response.user);
    setAccessToken(response.accessToken);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    if (devAuthEnabled) {
      clearAuthTokens();
      setDevAuthUser(null);
      setAccessToken(null);
      return;
    }

    try {
      await logoutRequest();
    } finally {
      setDevAuthUser(null);
      setAccessToken(null);
    }
  }, []);

  const acceptNda = useCallback(async () => {
    if (devAuthEnabled) {
      const acceptedUser = {
        ...devAuthUser,
        ndaStatus: "SIGNED" as const,
        ndaSignedAt: new Date().toISOString()
      };
      setAuthTokens("dev-auth-token");
      setDevAuthUser(acceptedUser);
      setAccessToken("dev-auth-token");
      return acceptedUser;
    }

    const acceptedUser = await acceptNdaRequest();
    setDevAuthUser(acceptedUser);
    return acceptedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      logout,
      acceptNda,
      loadCurrentUser,
      setDevAuthUser
    }),
    [acceptNda, accessToken, isLoading, loadCurrentUser, login, logout, user]
  );

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
