import { Router } from "express";
import { prisma } from "../db/prisma.js";

type TestRow = {
  id: string | number | bigint;
};

export const testDbRouter = Router();

testDbRouter.get("/test-db", async (_request, response) => {
  try {
    const rows = await prisma.$queryRaw<TestRow[]>`
      SELECT id FROM tbl.test LIMIT 1;
    `;

    if (rows.length === 0) {
      return response.json({
        success: false,
        message: "No records found",
      });
    }

    return response.json({
      success: true,
      data: {
        id: rows[0].id.toString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return response.status(500).json({
      success: false,
      message,
    });
  }
});
