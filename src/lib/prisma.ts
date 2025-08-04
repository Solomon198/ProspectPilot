import { logger } from "../utils/logger";
import { PrismaClientSingleton } from "../utils/db";

export const prisma = PrismaClientSingleton.getInstance();

prisma.$on("query", (e) => {
  logger.debug(`Query: ${e.query}`);
  logger.debug(`Params: ${e.params}`);
  logger.debug(`Duration: ${e.duration}ms`);
});

prisma.$on("error", (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on("info", (e) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on("warn", (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});
