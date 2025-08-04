import { Request, Response } from "express";

export const appInfo = (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "ProspectPilot API",
    version: "1.0.0",
    endpoints: {
      sequences: "/sequences",
      health: "/health",
    },
  });
};
