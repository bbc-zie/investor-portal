import type { AccountStatus, InvestorTier, UserRole } from "./platform.js";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: InvestorTier;
  status: AccountStatus;
};

export type AuthenticatedUser = AuthUser;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
} & AuthTokens;

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = AuthTokens;

export type CurrentUserResponse = {
  user: AuthUser;
};
