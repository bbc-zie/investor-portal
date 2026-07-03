export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Invalid email or password.",
  invalidRefreshToken: "Invalid refresh token.",
  missingRefreshToken: "Refresh token is required.",
  tooManyLoginAttempts: "Too many failed login attempts. Please try again later.",
  unexpectedLoginError: "Unable to sign in. Please try again.",
  networkLoginError: "Network error. Please check your connection and try again.",
  expiredSession: "Your session has expired. Please sign in again."
} as const;

export const AUTH_RATE_LIMIT = {
  loginFailedAttempts: 5,
  loginWindowMs: 15 * 60 * 1000
} as const;

export const PASSWORD_POLICY = {
  minLength: 12
} as const;
