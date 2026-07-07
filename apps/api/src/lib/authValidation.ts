import type { LoginRequest, RefreshTokenRequest } from "@bbc-investor-portal/shared";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateLoginRequest = (body: unknown): ValidationResult<LoginRequest> => {
  if (!isRecord(body)) {
    return { ok: false, status: 400, message: "Request body must be an object." };
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return { ok: false, status: 400, message: "Email and password are required." };
  }

  if (!emailPattern.test(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address." };
  }

  return { ok: true, value: { email, password } };
};

export const validateRefreshTokenRequest = (body: unknown): ValidationResult<RefreshTokenRequest> => {
  if (!isRecord(body)) {
    return { ok: false, status: 400, message: "Request body must be an object." };
  }

  const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken.trim() : "";
  if (!refreshToken) {
    return { ok: false, status: 400, message: "Refresh token is required." };
  }

  return { ok: true, value: { refreshToken } };
};
