import dotenv from "dotenv";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

type ApiEnv = {
  port: number;
  databaseUrl?: string;
  nodeEnv: string;
  devAuth: boolean;
  jwtSecret?: string;
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
  jwtSecret: process.env.JWT_SECRET
};

export const requireDatabaseUrl = () => {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required. Set it in apps/api/.env.");
  }

  return env.databaseUrl;
};
