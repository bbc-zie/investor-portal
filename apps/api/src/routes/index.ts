import { Router } from "express";
import { API_ENDPOINTS } from "@bbc-investor-portal/shared";
import { requireAuthenticated } from "../middleware/auth.js";
import { authRouter } from "./auth.js";
import { healthRouter } from "./health.js";
import { projectsRouter } from "./projects.js";
import { testDbRouter } from "./testDb.js";

export const apiRouter = Router();

apiRouter.use(API_ENDPOINTS.health, healthRouter);
apiRouter.use(API_ENDPOINTS.testDb, testDbRouter);
apiRouter.use(API_ENDPOINTS.authBase, authRouter);
apiRouter.use(API_ENDPOINTS.projectsBase, projectsRouter);

apiRouter.get(API_ENDPOINTS.me, requireAuthenticated, (req, res) => {
  res.json({ user: req.user });
});
