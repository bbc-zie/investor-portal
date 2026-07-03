import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import type { AuthUser } from "@bbc-investor-portal/shared";
import { env, requireJwtSecret } from "../config/env.js";

const getJwtSecret = () => requireJwtSecret();

export const createAuthUser = (user: {
  id: string;
  email: string;
  name: string | null;
  role: AuthUser["role"];
  tier: AuthUser["tier"];
  status: AuthUser["status"];
}): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name ?? user.email,
  role: user.role,
  tier: user.tier,
  status: user.status
});

export const signAccessToken = (userId: string) =>
  jwt.sign({ typ: "access" }, getJwtSecret(), {
    subject: userId,
    expiresIn: env.accessTokenExpiresIn as StringValue
  });

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
  if (payload.typ !== "access" || typeof payload.sub !== "string") {
    throw new Error("Invalid token payload");
  }

  return payload.sub;
};

export const createRefreshToken = () => crypto.randomBytes(48).toString("base64url");

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const isRefreshTokenExpired = (expiresAt: Date) => expiresAt.getTime() <= Date.now();

export const getRefreshTokenExpiresAt = () => {
  const match = /^(\d+)([dhm])$/.exec(env.refreshTokenExpiresIn);
  if (!match) {
    throw new Error("REFRESH_TOKEN_EXPIRES_IN must use d, h, or m format, for example 7d.");
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multiplier = unit === "d" ? 24 * 60 * 60 * 1000 : unit === "h" ? 60 * 60 * 1000 : 60 * 1000;

  return new Date(Date.now() + amount * multiplier);
};
