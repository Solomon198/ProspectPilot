import { Router } from "express";
import { validate } from "../middleware/validation";
import { generateSequenceSchema } from "../schemas/generateSequenceSchema";
import { generateSequence } from "../controllers/generateSequence";
import { checkExistingProspect } from "../middleware/existingProspectCheck";
import expressAsyncHandler from "express-async-handler";

const router = Router();

// Generate sequence route
router.post(
  "/",
  expressAsyncHandler(validate(generateSequenceSchema)),
  expressAsyncHandler(checkExistingProspect),
  expressAsyncHandler(generateSequence)
);

export { router as sequenceRoutes };
