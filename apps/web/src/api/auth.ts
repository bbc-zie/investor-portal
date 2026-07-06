import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse
} from "@bbc-investor-portal/shared";
import { API_ENDPOINTS } from "@bbc-investor-portal/shared";
import { apiClient, clearAuthTokens, getRefreshToken, setAuthTokens } from "./client";

export const login = async (credentials: LoginRequest) => {
  clearAuthTokens();
  const { data } = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials);
  setAuthTokens(data.accessToken, data.refreshToken);
  return data;
};

export const logout = async () => {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiClient.post(API_ENDPOINTS.auth.logout, { refreshToken });
    }
  } finally {
    clearAuthTokens();
  }
};

export const refreshTokens = async () => {
  const refreshToken = getRefreshToken();
  const { data } = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.auth.refresh, { refreshToken });
  setAuthTokens(data.accessToken, data.refreshToken);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get<CurrentUserResponse>(API_ENDPOINTS.auth.me);
  return data.user;
};

export const acceptNda = async () => {
  const { data } = await apiClient.post<CurrentUserResponse>(API_ENDPOINTS.auth.ndaAccept);
  return data.user;
};
