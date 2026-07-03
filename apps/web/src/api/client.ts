import axios from "axios";
import { API_BASE_PATH } from "@bbc-investor-portal/shared";

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

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
