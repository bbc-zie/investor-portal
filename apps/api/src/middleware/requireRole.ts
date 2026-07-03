import type { NextFunction, Request, Response } from "express";
import type { InvestorTier, UserRole } from "@bbc-investor-portal/shared";

export const requireRole =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };

export const requireTier =
  (...allowedTiers: InvestorTier[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!allowedTiers.includes(req.user.tier)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };

