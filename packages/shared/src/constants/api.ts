export const API_BASE_PATH = "/api";

export const API_ENDPOINTS = {
  health: "/health",
  testDb: "/test-db",
  me: "/me",
  authBase: "/auth",
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me"
  }
} as const;

export const API_PATHS = {
  health: `${API_BASE_PATH}${API_ENDPOINTS.health}`,
  testDb: `${API_BASE_PATH}${API_ENDPOINTS.testDb}`,
  me: `${API_BASE_PATH}${API_ENDPOINTS.me}`,
  auth: {
    login: `${API_BASE_PATH}${API_ENDPOINTS.auth.login}`,
    logout: `${API_BASE_PATH}${API_ENDPOINTS.auth.logout}`,
    refresh: `${API_BASE_PATH}${API_ENDPOINTS.auth.refresh}`,
    me: `${API_BASE_PATH}${API_ENDPOINTS.auth.me}`
  }
} as const;
