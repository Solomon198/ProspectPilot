/**
 * AI Cost Calculator Utilities
 */

// Model pricing configuration (per 1K tokens)
export const MODEL_PRICING = {
  "gpt-4o": {
    input: 0.0025, // $0.0025 per 1K input tokens
    output: 0.01, // $0.01 per 1K output tokens
  },
  "gpt-4o-mini": {
    input: 0.00015, // $0.00015 per 1K input tokens
    output: 0.0006, // $0.0006 per 1K output tokens
  },
  "gpt-3.5-turbo": {
    input: 0.0005, // $0.0005 per 1K input tokens
    output: 0.0015, // $0.0015 per 1K output tokens
  },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

/**
 * Calculate AI generation cost based on tokens and model
 */
export function calculateAICost(
  modelName: string,
  inputTokens: number,
  outputTokens: number
): {
  costPer1kInput: number;
  costPer1kOutput: number;
  totalCost: number;
} {
  // Get pricing for the model, fallback to gpt-3.5-turbo if not found
  const pricing =
    MODEL_PRICING[modelName as ModelName] || MODEL_PRICING["gpt-3.5-turbo"];

  const costPer1kInput = pricing.input;
  const costPer1kOutput = pricing.output;

  // Calculate total cost
  const inputCost = (inputTokens * costPer1kInput) / 1000;
  const outputCost = (outputTokens * costPer1kOutput) / 1000;
  const totalCost = inputCost + outputCost;

  return {
    costPer1kInput,
    costPer1kOutput,
    totalCost: Math.round(totalCost * 1000000) / 1000000, // Round to 6 decimal places
  };
}

/**
 * Get model pricing information
 */
export function getModelPricing(modelName: string) {
  return (
    MODEL_PRICING[modelName as ModelName] || MODEL_PRICING["gpt-3.5-turbo"]
  );
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}
