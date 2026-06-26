import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { testDbRouter } from "./routes/testDb.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ success: true });
});

app.use("/api", testDbRouter);
