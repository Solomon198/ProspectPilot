import { Request, Response } from "express";
import { GenerateSequenceInput } from "../schemas/generateSequenceSchema";
import { openaiWithRetry, extractContent } from "../lib/openai";
import { pdlWithRetry } from "../lib/pdl";
import { PromptGenerator } from "../lib/promptAnalysis";
import { logger } from "../utils/logger";
import { SequenceRequestContext } from "../types/prompt.analysis";
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

    // Step 3: Generate prompts using the analysis system
    logger.info("Generating AI prompts");
    const { systemPrompt, userPrompt } = PromptGenerator.generatePromptPair(
      pdlResponse,
      context,
      input.company_context
    );

    // Step 4: Generate sequence using OpenAI
    logger.info("Generating sequence with OpenAI");
    const response = await openaiWithRetry.createChatCompletion({
      userPrompt,
      systemPrompt,
    });

    const content = extractContent(response);

    // Step 5: Parse the JSON response
    let parsedResponse;
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

    // Step 6: Return structured response
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
