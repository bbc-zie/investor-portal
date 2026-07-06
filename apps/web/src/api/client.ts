import axios from "axios";
import { API_BASE_PATH, API_ENDPOINTS, AUTH_ERROR_MESSAGES } from "@bbc-investor-portal/shared";

const accessTokenKey = "bbc_access_token";
const refreshTokenKey = "bbc_refresh_token";
const authSessionMessageKey = "bbc_auth_session_message";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? API_BASE_PATH,
  headers: {
    "Content-Type": "application/json"
  }
});

// TODO: Replace localStorage token persistence with HttpOnly Secure Cookies for production hardening.
export const getAccessToken = () => localStorage.getItem(accessTokenKey);
export const getRefreshToken = () => localStorage.getItem(refreshTokenKey);

export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem(accessTokenKey, accessToken);
  if (refreshToken) {
    localStorage.setItem(refreshTokenKey, refreshToken);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
};

export const setAuthSessionMessage = (message: string) => {
  sessionStorage.setItem(authSessionMessageKey, message);
};

export const consumeAuthSessionMessage = () => {
  const message = sessionStorage.getItem(authSessionMessageKey);
  sessionStorage.removeItem(authSessionMessageKey);
  return message;
};

let refreshRequest: Promise<string | null> | null = null;

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const requestUrl = originalRequest.url ?? "";
    const isAuthRefresh = requestUrl.includes(API_ENDPOINTS.auth.refresh);
    const isAuthLogin = requestUrl.includes(API_ENDPOINTS.auth.login);
    const hasRetried = Boolean((originalRequest as { _authRetry?: boolean })._authRetry);

    if (isAuthRefresh || isAuthLogin || hasRetried || !getRefreshToken()) {
      clearAuthTokens();
      setAuthSessionMessage(AUTH_ERROR_MESSAGES.expiredSession);
      return Promise.reject(error);
    }

    (originalRequest as { _authRetry?: boolean })._authRetry = true;

    refreshRequest ??= apiClient
      .post<{ accessToken: string; refreshToken: string }>(API_ENDPOINTS.auth.refresh, {
        refreshToken: getRefreshToken()
      })
      .then(({ data }) => {
        setAuthTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      })
      .catch((refreshError) => {
        clearAuthTokens();
        setAuthSessionMessage(AUTH_ERROR_MESSAGES.expiredSession);
        throw refreshError;
      })
      .finally(() => {
        refreshRequest = null;
      });

    const accessToken = await refreshRequest;
    if (accessToken) {
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    }

    return apiClient(originalRequest);
  }
);
