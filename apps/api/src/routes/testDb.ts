import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const testDbRouter = Router();

testDbRouter.get("/", async (_req, res, next) => {
  try {
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;

    res.json({
      status: "ok",
      database: "connected",
      now: result[0]?.now ?? null
    });
  } catch (error) {
    next(error);
  }
});

