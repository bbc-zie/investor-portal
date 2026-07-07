import dotenv from "dotenv";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

type ApiEnv = {
  port: number;
  databaseUrl?: string;
  nodeEnv: string;
  devAuth: boolean;
  jwtSecret?: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
};

const parsePort = (value: string | undefined) => {
  if (!value) return 4000;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 4000;
};

export const env: ApiEnv = {
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV ?? "development",
  devAuth: process.env.DEV_AUTH === "true",
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d"
};

export const requireDatabaseUrl = () => {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required. Set it in apps/api/.env.");
  }

  return env.databaseUrl;
};

export const requireJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is required for authentication.");
  }

  return env.jwtSecret;
};
