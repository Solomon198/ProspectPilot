import OpenAI from "openai";
import { logger } from "../utils/logger";
import retryWithBackoff, { retryConfig } from "../utils/retryWithBackoff";
import { openaiConfig } from "../config/env";
import { ChatCompletionMessageParam } from "openai/resources/index";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  maxRetries: 0, // We'll handle retries ourselves with our custom retry logic
});

const { fallbackModel, mainModel } = openaiConfig;

/**
 * Wrapper for OpenAI API calls with retry logic
 */
export const openaiWithRetry = {
  /**
   * Create a chat completion with retry logic
   */
  async createChatCompletion({
    userPrompt,
    systemPrompt,
  }: {
    userPrompt: string;
    systemPrompt: string;
  }): Promise<OpenAI.Chat.ChatCompletion> {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const result = await retryWithBackoff(
      async (attempts: number) => {
        const model = attempts >= 2 ? fallbackModel : mainModel;
        logger.debug("Making OpenAI API call", { model });
        const response = (await openai.chat.completions.create({
          messages,
          model,
        })) as OpenAI.Chat.ChatCompletion;
        logger.debug("OpenAI API call successful", {
          model,
          usage: "usage" in response ? response.usage : undefined,
        });
        return response;
      },
      {
        ...retryConfig,
        operationName: "openai-chat-completion",
      }
    );
    return result.data;
  },
};

/**
 * Helper function to extract content from chat completion
 */
export const extractContent = (response: OpenAI.Chat.ChatCompletion) => {
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }
  return content;
};

/**
 * Helper function to check if response was successful
 */
export const isSuccessfulResponse = (response: OpenAI.Chat.ChatCompletion) => {
  return response.choices[0]?.finish_reason === "stop";
};
