import { PrismaClient } from "@prisma/client";
import "../config/env.js";

const redactDatabaseHost = (databaseUrl: string | undefined) => {
  if (!databaseUrl) return "unavailable";

  try {
    return new URL(databaseUrl).host;
  } catch {
    const match = databaseUrl.match(/^(?:postgresql|postgres):\/\/[^@]*@([^/?#]+)/);
    return match?.[1] ?? "unavailable";
  }
};

const getErrorDetail = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return {
      code: "unknown",
      message: String(error)
    };
  }

  const errorRecord = error as { code?: unknown; errorCode?: unknown; message?: unknown };
  const code = errorRecord.code ?? errorRecord.errorCode;

  return {
    code: typeof code === "string" ? code : "unknown",
    message:
      typeof errorRecord.message === "string" ? errorRecord.message : "Unknown Prisma error"
  };
};

const prisma = new PrismaClient();

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  console.log(`DATABASE_URL exists: ${Boolean(databaseUrl)}`);
  console.log(`database host: ${redactDatabaseHost(databaseUrl)}`);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("query succeeded: true");
  } catch (error) {
    const { code, message } = getErrorDetail(error);

    console.log("query succeeded: false");
    console.log(`Prisma error code: ${code}`);
    console.log(`Prisma error message: ${message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

void main();
