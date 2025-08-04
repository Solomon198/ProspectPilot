import { Router } from "express";
import { validate } from "../middleware/validation";
import { generateSequenceSchema } from "../schemas/generateSequenceSchema";
import { generateSequence } from "../controllers/generateSequence";
import expressAsyncHandler from "express-async-handler";

const router = Router();

// Generate sequence route
router.post(
  "/generate",
  expressAsyncHandler(validate(generateSequenceSchema)),
  expressAsyncHandler(generateSequence)
);

export { router as sequenceRoutes };
