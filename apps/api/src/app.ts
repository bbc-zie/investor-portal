import cors from "cors";
import express from "express";
import { API_BASE_PATH } from "@bbc-investor-portal/shared";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(authMiddleware);

  app.use(API_BASE_PATH, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
