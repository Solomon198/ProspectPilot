import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = null;

  // Log the error
  logger.error("Error occurred:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    details = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));
  }

  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Foreign key constraint failed";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
    }
  }

  // Handle custom errors
  else if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Handle other known errors
  else if (error instanceof Error) {
    if (error.name === "CastError") {
      statusCode = 400;
      message = "Invalid ID format";
    } else if (error.name === "ValidationError") {
      statusCode = 400;
      message = "Validation Error";
    } else if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    } else if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired";
    } else if (error.statusCode) {
      statusCode = error.statusCode;
      message = error.message;
    }
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    message,
    ...(details && { details }),
  };

  res.status(statusCode).json(errorResponse);
};
