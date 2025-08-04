import winston from "winston";
import { loggingConfig, isDevelopment } from "../config/env";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const winstonLogger = winston.createLogger({
  level: loggingConfig.level.toLowerCase(),
  levels,
  format: isDevelopment() ? consoleFormat : fileFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: loggingConfig.level.toLowerCase(),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export const logger = {
  error: (message: string, ...meta: any[]) => {
    winstonLogger.error(message, ...meta);
  },

  warn: (message: string, ...meta: any[]) => {
    winstonLogger.warn(message, ...meta);
  },

  info: (message: string, ...meta: any[]) => {
    winstonLogger.info(message, ...meta);
  },

  debug: (message: string, ...meta: any[]) => {
    winstonLogger.debug(message, ...meta);
  },
  winston: winstonLogger,
};
