import { Request, Response, NextFunction } from "express";
import { PrismaClientSingleton } from "../utils/db";
import { logger } from "../utils/logger";
import { SequenceGenerationResponse } from "../types/sequenceResponse";

const prisma = PrismaClientSingleton.getInstance();

interface RequestWithProspect extends Request {
  existingProspect?: any;
  existingMessage?: any;
}

/**
 * Middleware to check if a LinkedIn profile already exists and return previous message generation
 */
export const checkExistingProspect = async (
  req: RequestWithProspect,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prospect_url } = req.body;

    if (!prospect_url) {
      return next();
    }

    logger.info("Checking for existing prospect", {
      prospectUrl: prospect_url,
    });

    // Check if prospect exists with their message and AI generation
    const existingProspect = await prisma.prospect.findUnique({
      where: { linkedinUrl: prospect_url },
      include: {
        message: {
          include: {
            aiGeneration: true,
          },
        },
      },
    });

    if (!existingProspect) {
      logger.info("No existing prospect found, proceeding with generation");
      return next();
    }

    logger.info("Existing prospect found", {
      prospectId: existingProspect.id,
      hasMessage: !!existingProspect.message,
    });

    // If prospect exists and has a message, return it
    if (existingProspect.message) {
      const response = {
        success: true,
        message: "Sequence generated successfully",
        data: {
          generatedMessages: existingProspect.message.generatedMessages || [],
          aiThinkingProcess: existingProspect.message.aiThinkingProcess || {},
          confidenceScores: existingProspect.message.confidenceScores || {},
          prospectAnalysis: existingProspect.message.prospectAnalysis || {},
          model_used:
            existingProspect.message.aiGeneration?.modelName || "unknown",
          usage: existingProspect.message.aiGeneration
            ? {
                inputTokens: existingProspect.message.aiGeneration.inputTokens,
                outputTokens:
                  existingProspect.message.aiGeneration.outputTokens,
                totalTokens: existingProspect.message.aiGeneration.totalTokens,
              }
            : undefined,
          pdlProfile: {
            name: existingProspect.fullName,
            company: existingProspect.jobCompanyName,
            jobTitle: existingProspect.jobTitle,
            industry: existingProspect.jobCompanyIndustry,
            location: existingProspect.locationName,
            skills: existingProspect.skills || [],
          },
        },
        cached: true,
      } as SequenceGenerationResponse;

      logger.info("Returning existing prospect message", {
        prospectId: existingProspect.id,
        messageId: existingProspect.message.id,
        hasAiGeneration: !!existingProspect.message.aiGeneration,
      });

      res.status(200).json(response);
      return;
    }

    // If prospect exists but no message, store it for later use
    req.existingProspect = existingProspect;
    logger.info("Prospect exists but no message, proceeding with generation");
    next();
  } catch (error) {
    logger.error("Error checking existing prospect", {
      error: error instanceof Error ? error.message : String(error),
      prospectUrl: req.body.prospect_url,
    });

    // Continue with generation if there's an error checking
    next();
  }
};
