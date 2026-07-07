export const API_BASE_PATH = "/api";

export const API_ENDPOINTS = {
  health: "/health",
  testDb: "/test-db",
  me: "/me",
  users: "/users",
  user: (userId: string) => `/users/${userId}`,
  userStatus: (userId: string) => `/users/${userId}/status`,
  userRoleTier: (userId: string) => `/users/${userId}/role-tier`,
  userKyc: (userId: string) => `/users/${userId}/kyc`
} as const;

export const API_PATHS = {
  health: `${API_BASE_PATH}${API_ENDPOINTS.health}`,
  testDb: `${API_BASE_PATH}${API_ENDPOINTS.testDb}`,
  me: `${API_BASE_PATH}${API_ENDPOINTS.me}`,
  users: `${API_BASE_PATH}${API_ENDPOINTS.users}`,
  user: (userId: string) => `${API_BASE_PATH}${API_ENDPOINTS.user(userId)}`,
  userStatus: (userId: string) => `${API_BASE_PATH}${API_ENDPOINTS.userStatus(userId)}`,
  userRoleTier: (userId: string) => `${API_BASE_PATH}${API_ENDPOINTS.userRoleTier(userId)}`,
  userKyc: (userId: string) => `${API_BASE_PATH}${API_ENDPOINTS.userKyc(userId)}`
} as const;
