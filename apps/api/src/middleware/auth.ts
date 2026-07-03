import type { NextFunction, Request, Response } from "express";
import {
  ACCOUNT_STATUSES,
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_INVESTOR_TIER,
  DEFAULT_USER_ROLE,
  INVESTOR_TIERS,
  USER_ROLES,
  type AccountStatus,
  type InvestorTier,
  type UserRole
} from "@bbc-investor-portal/shared";
import { env } from "../config/env.js";

const readHeader = (req: Request, name: string) => {
  const value = req.header(name);
  return Array.isArray(value) ? value[0] : value;
};

const parseMockUser = (req: Request) => {
  if (!env.devAuth) return undefined;

  const enabled = readHeader(req, "x-dev-auth-user");
  if (!enabled) return undefined;

  const authorization = readHeader(req, "authorization");
  if (!authorization?.startsWith("Bearer ")) return undefined;

  const roleHeader = readHeader(req, "x-dev-auth-role") as UserRole | undefined;
  const tierHeader = readHeader(req, "x-dev-auth-tier") as InvestorTier | undefined;
  const statusHeader = readHeader(req, "x-dev-auth-status") as AccountStatus | undefined;

  return {
    id: readHeader(req, "x-dev-auth-id") ?? "dev-user",
    email: readHeader(req, "x-dev-auth-email") ?? "dev-user@example.local",
    name: readHeader(req, "x-dev-auth-name") ?? "Development User",
    role: roleHeader && USER_ROLES.includes(roleHeader) ? roleHeader : DEFAULT_USER_ROLE,
    tier: tierHeader && INVESTOR_TIERS.includes(tierHeader) ? tierHeader : DEFAULT_INVESTOR_TIER,
    status: statusHeader && ACCOUNT_STATUSES.includes(statusHeader) ? statusHeader : DEFAULT_ACCOUNT_STATUS
  };
};

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.user = parseMockUser(req);
  next();
};

export const requireAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.status !== DEFAULT_ACCOUNT_STATUS) {
    res.status(403).json({ error: "Forbidden", message: "Account is not active" });
    return;
  }

  next();
};
