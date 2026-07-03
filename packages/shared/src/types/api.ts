import type { AuthenticatedUser } from "./auth.js";

export type ApiErrorResponse = {
  error: string;
  message?: string;
};

export type HealthResponse = {
  status: "ok";
  service: string;
  timestamp: string;
};

export type TestDbResponse = {
  status: string;
  database: string;
  now: string | null;
};

export type MeResponse = {
  user: AuthenticatedUser;
};
