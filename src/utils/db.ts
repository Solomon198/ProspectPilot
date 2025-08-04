import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export class PrismaClientSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient<
    Prisma.PrismaClientOptions,
    Prisma.LogLevel
  > {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient();
    }
    return PrismaClientSingleton.instance;
  }
}

export const gracefulShutdown = async ({
  signal,
  reason,
  promise,
  error,
  prisma,
}: {
  signal: "SIGINT" | "SIGTERM" | "uncaughtException" | "unhandledRejection";
  reason?: unknown;
  promise?: Promise<unknown>;
  error?: Error;
  prisma: PrismaClient;
}): Promise<void> => {
  const isError = ["uncaughtException", "unhandledRejection"].includes(signal);
  const exitCode = isError ? 1 : 0;
  if (isError) {
    logger.error(`${signal}: `, promise, "reason:", reason, error);
  } else {
    logger.info(`Received ${signal}. Closing database connections...`);
  }

  try {
    await prisma.$disconnect();
    process.exit(exitCode);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};
