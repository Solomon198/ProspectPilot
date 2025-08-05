import { PrismaClientSingleton } from "./db";
import { calculateAICost } from "./aiCostCalculator";
import { logger } from "./logger";

const prisma = PrismaClientSingleton.getInstance();

/**
 * Database transaction parameters
 */
export interface SequenceGenerationData {
  prospectUrl: string;
  pdlResponse: any;
  parsedResponse: any;
  companyContext: string;
  tovConfig: any;
  openaiResponse: any;
  responseTime: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  prospectId?: string;
  messageId?: string;
  aiGenerationId?: string;
  error?: string;
}

/**
 * Store sequence generation data in database transaction
 */
export async function storeSequenceGeneration(
  data: SequenceGenerationData
): Promise<TransactionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create prospect
      const prospect = await tx.prospect.create({
        data: {
          linkedinUrl: data.prospectUrl,
          fullName: data.pdlResponse.full_name || null,
          firstName: data.pdlResponse.first_name || null,
          lastName: data.pdlResponse.last_name || null,
          jobTitle: data.pdlResponse.job_title || null,
          jobCompanyName: data.pdlResponse.job_company_name || null,
          jobCompanyIndustry: data.pdlResponse.job_company_industry || null,
          jobCompanySize: data.pdlResponse.job_company_size || null,
          locationName: data.pdlResponse.location_name as string,
          skills: data.pdlResponse.skills || [],
          experience: data.pdlResponse.experience
            ? JSON.parse(JSON.stringify(data.pdlResponse.experience))
            : undefined,
          education: data.pdlResponse.education
            ? JSON.parse(JSON.stringify(data.pdlResponse.education))
            : undefined,
          email: Array.isArray(data.pdlResponse.emails)
            ? data.pdlResponse.emails[0]?.address || null
            : null,
          linkedinUsername: data.pdlResponse.linkedin_username || null,
          // Analysis fields from AI
          seniority: data.parsedResponse.prospectAnalysis?.seniority,
          decisionMaker:
            data.parsedResponse.prospectAnalysis?.decisionMaker || false,
          painPoints: data.parsedResponse.prospectAnalysis?.painPoints || [],
          interests: data.parsedResponse.prospectAnalysis?.interests || [],
          communicationStyle:
            data.parsedResponse.prospectAnalysis?.communicationStyle,
          buyingPower: data.parsedResponse.prospectAnalysis?.buyingPower,
          urgency: data.parsedResponse.prospectAnalysis?.urgency,
          objections: data.parsedResponse.prospectAnalysis?.objections || [],
          hooks: data.parsedResponse.prospectAnalysis?.hooks || [],
        },
      });

      // Create message
      const message = await tx.message.create({
        data: {
          prospectId: prospect.id,
          companyContext: data.companyContext,
          generatedMessages: data.parsedResponse.generatedMessages || [],
          aiThinkingProcess: data.parsedResponse.aiThinkingProcess || {},
          confidenceScores: data.parsedResponse.confidenceScores || {},
          prospectAnalysis: data.parsedResponse.prospectAnalysis || {},
          tovConfig: data.tovConfig,
        },
      });

      // Calculate AI cost
      const aiCost = calculateAICost(
        data.openaiResponse.model,
        data.openaiResponse.usage?.prompt_tokens || 0,
        data.openaiResponse.usage?.completion_tokens || 0
      );

      // Create AI generation record
      const aiGeneration = await tx.aIGeneration.create({
        data: {
          messageId: message.id,
          modelName: data.openaiResponse.model,
          operationType: "chat_completion",
          inputTokens: data.openaiResponse.usage?.prompt_tokens || 0,
          outputTokens: data.openaiResponse.usage?.completion_tokens || 0,
          totalTokens: data.openaiResponse.usage?.total_tokens || 0,
          costPer1kInput: aiCost.costPer1kInput,
          costPer1kOutput: aiCost.costPer1kOutput,
          totalCost: aiCost.totalCost,
          responseTime: data.responseTime,
          temperature: 0.7,
        },
      });

      return {
        prospectId: prospect.id,
        messageId: message.id,
        aiGenerationId: aiGeneration.id,
      };
    });

    logger.info("Database transaction completed successfully", {
      prospectId: result.prospectId,
      messageId: result.messageId,
      aiGenerationId: result.aiGenerationId,
    });

    return {
      success: true,
      prospectId: result.prospectId,
      messageId: result.messageId,
      aiGenerationId: result.aiGenerationId,
    };
  } catch (error) {
    logger.error("Database transaction failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
