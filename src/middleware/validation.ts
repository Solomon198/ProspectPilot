import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  };
};
 