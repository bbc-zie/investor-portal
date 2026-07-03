export const API_BASE_PATH = "/api";

export const API_ENDPOINTS = {
  health: "/health",
  testDb: "/test-db",
  me: "/me"
} as const;

export const API_PATHS = {
  health: `${API_BASE_PATH}${API_ENDPOINTS.health}`,
  testDb: `${API_BASE_PATH}${API_ENDPOINTS.testDb}`,
  me: `${API_BASE_PATH}${API_ENDPOINTS.me}`
} as const;
