import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";

async function startServer() {
  try {
    await prisma.$connect();

    const server = app.listen(env.port, () => {
      console.log(`✓ Server started on http://localhost:${env.port}`);
      console.log("✓ Connected to PostgreSQL");
      console.log("✓ API ready");
    });

    const shutdown = async () => {
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown startup error";

    console.error("Failed to start API server");
    console.error(message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void startServer();
