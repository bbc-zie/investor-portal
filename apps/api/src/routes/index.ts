import { Router } from "express";
import { API_ENDPOINTS } from "@bbc-investor-portal/shared";
import { requireAuthenticated } from "../middleware/auth.js";
import { healthRouter } from "./health.js";
import { testDbRouter } from "./testDb.js";

export const apiRouter = Router();

apiRouter.use(API_ENDPOINTS.health, healthRouter);
apiRouter.use(API_ENDPOINTS.testDb, testDbRouter);

apiRouter.get(API_ENDPOINTS.me, requireAuthenticated, (req, res) => {
  res.json({ user: req.user });
});
