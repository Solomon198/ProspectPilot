import { Request, Response } from "express";
import { GenerateSequenceInput } from "../schemas/generateSequenceSchema";

// Create user
export const generateSequence = async (req: Request, _res: Response) => {
  const userData: GenerateSequenceInput = req.body;
  console.log(userData);
};
