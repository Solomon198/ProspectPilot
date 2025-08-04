import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { logger } from "./utils/logger";
import { routes } from "./routes";
import {
  serverConfig,
  securityConfig,
  loggingConfig,
  isDevelopment,
} from "./config/env";
import { gracefulShutdown } from "./utils/db";
import { appHealth } from "./controllers/appHealth";
import { prisma } from "./lib/prisma";

const app = express();
const port = serverConfig.port;
const bodyLimit = serverConfig.bodyLimit;

app.use(helmet());

app.use(
  cors({
    origin: securityConfig.corsOrigin,
    credentials: true,
  })
);

app.use(compression());

app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => {
        if (isDevelopment() || loggingConfig.enableHttpLogs) {
          logger.info(message.trim());
        }
      },
    },
  })
);
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// health check endpoint
app.get("/health", appHealth);

// API routes
app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = () => {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    logger.info(`Environment: ${serverConfig.nodeEnv}`);
  });
};

process.on("uncaughtException", (error) => {
  gracefulShutdown({ signal: "uncaughtException", error, prisma });
});

process.on("unhandledRejection", (reason, promise) => {
  gracefulShutdown({ signal: "unhandledRejection", reason, promise, prisma });
});

process.on("SIGINT", () => gracefulShutdown({ signal: "SIGINT", prisma }));
process.on("SIGTERM", () => gracefulShutdown({ signal: "SIGTERM", prisma }));

startServer();
