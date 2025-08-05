import { Request, Response } from "express";
import { GenerateSequenceInput } from "../schemas/generateSequenceSchema";
import { openaiWithRetry, extractContent } from "../lib/openai";
import { pdlWithRetry } from "../lib/pdl";
import { PromptGenerator } from "../lib/promptAnalysis";
import { logger } from "../utils/logger";
import {
  SequenceRequestContext,
  TOVConfigMapping,
} from "../types/prompt.analysis";
import { PrismaClientSingleton } from "../utils/db";
import { storeSequenceGeneration } from "../utils/databaseOperations";
import { SequenceGenerationResponse } from "../types/sequenceResponse";

// Generate sequence using OpenAI with PDL profile enrichment
export const generateSequence = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input: GenerateSequenceInput = req.body;

  try {
    logger.info("Starting sequence generation", {
      prospectUrl: input.prospect_url,
      sequenceLength: input.sequence_length,
    });

    // Step 1: Enrich prospect profile using PDL
    logger.info("Enriching prospect profile with PDL");
    const pdlResponse = await pdlWithRetry.enrichProfile(input.prospect_url);

    if (!pdlResponse) {
      throw new Error("No profile data returned from PDL");
    }

    logger.info("Profile enrichment successful", {
      name: pdlResponse.full_name,
      company: pdlResponse.job_company_name,
      jobTitle: pdlResponse.job_title,
    });

    // Step 2: Create request context
    const context: SequenceRequestContext = {
      prospect_url: input.prospect_url,
      tov_config: input.tov_config,
      company_context: input.company_context,
      sequence_length: input.sequence_length,
    };

    // Step 3: Get TOV config from database and generate prompts
    logger.info("Fetching TOV config from database");
    const prisma = PrismaClientSingleton.getInstance();

    const tovValues = [
      input.tov_config.formality,
      input.tov_config.warmth,
      input.tov_config.directness,
    ];

    const tovConfigs = await prisma.tOVConfig.findMany({
      where: { tov: { in: tovValues } },
    });

    // Create a map for easy lookup
    const tovConfigMap = new Map(
      tovConfigs.map((config) => [config.tov, config])
    );

    // Build TOV config object with proper field mapping
    const tovConfig: TOVConfigMapping = {
      formality: tovConfigMap.get(input.tov_config.formality)?.formality || "",
      warmth: tovConfigMap.get(input.tov_config.warmth)?.warmth || "",
      directness:
        tovConfigMap.get(input.tov_config.directness)?.directness || "",
    };

    // Validate that we found all required configs
    if (!tovConfig.formality || !tovConfig.warmth || !tovConfig.directness) {
      throw new Error(
        `Missing TOV configs for values: ${tovValues.join(", ")}`
      );
    }

    logger.info("Generating AI prompts with database TOV config");
    const { systemPrompt, userPrompt } = PromptGenerator.generatePromptPair(
      pdlResponse,
      context,
      input.company_context,
      tovConfig
    );

    // Step 4: Generate sequence using OpenAI
    logger.info("Generating sequence with OpenAI");
    const startTime = Date.now();
    const response = await openaiWithRetry.createChatCompletion({
      userPrompt,
      systemPrompt,
    });

    const responseTime = Date.now() - startTime;

    const content = extractContent(response);

    // Step 5: Parse the JSON response
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      logger.error("Failed to parse OpenAI response as JSON", {
        content: content.substring(0, 200) + "...",
        error: parseError,
      });

      // Fallback: return failed response if JSON parsing fails
      res.status(500).json({
        success: false,
        message: "Failed to generate sequence",
        error: "Unable to process AI response",
      });
    }

    logger.info("Sequence generation completed successfully", {
      model: response.model,
      usage: response.usage,
      messageCount: parsedResponse.generatedMessages?.length || 0,
    });

    // Step 6: Store data in database transaction
    const dbResult = await storeSequenceGeneration({
      prospectUrl: input.prospect_url,
      pdlResponse,
      parsedResponse,
      companyContext: input.company_context,
      tovConfig: input.tov_config,
      openaiResponse: response,
      responseTime,
    });

    if (!dbResult.success) {
      logger.warn("Database transaction failed, continuing with response", {
        error: dbResult.error,
      });
    }

    // Step 7: Return structured response
    res.status(200).json({
      success: true,
      message: "Sequence generated successfully",
      cached: false,
      data: {
        generatedMessages: parsedResponse.generatedMessages || [],
        aiThinkingProcess: parsedResponse.aiThinkingProcess || {},
        confidenceScores: parsedResponse.confidenceScores || {},
        prospectAnalysis: parsedResponse.prospectAnalysis || {},
        model_used: response.model,
        usage: response.usage,
        pdlProfile: {
          name: pdlResponse.full_name,
          company: pdlResponse.job_company_name,
          jobTitle: pdlResponse.job_title,
          industry: pdlResponse.job_company_industry,
          location: pdlResponse.location_name,
          skills: pdlResponse.skills || [],
        },
      },
    } as SequenceGenerationResponse);
  } catch (error) {
    logger.error("Failed to generate sequence", {
      error: error instanceof Error ? error.message : String(error),
      input: input,
    });

    res.status(500).json({
      success: false,
      message: "Failed to generate sequence",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
