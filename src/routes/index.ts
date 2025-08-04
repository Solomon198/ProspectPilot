import { Router } from "express";
import { sequenceRoutes } from "./sequenceRoutes";
import { appInfo } from "../controllers/appInfo";

const router = Router();

// API routes
router.use("/sequences", sequenceRoutes);

// API info endpoint
router.get("/", appInfo);

export { router as routes };
