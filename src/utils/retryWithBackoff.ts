import { logger } from "./logger";

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  factor?: number;
  maxDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
  operationName?: string;
}

interface RetryResult<T> {
  data: T;
  attempts: number;
  totalTimeMs: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// implementing custom retry with backoff custom function with proper logging and error handling
async function retryWithBackoff<T>(
  fn: (attempts: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 5,
    initialDelayMs = 1000,
    factor = 2,
    maxDelayMs = 30000,
    isRetryable = () => true,
    onRetry,
    operationName = "operation",
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;
  const startTime = Date.now();
  let lastError: unknown;

  do {
    try {
      const data = await fn(attempt);
      const totalTimeMs = Date.now() - startTime;

      if (attempt > 0) {
        logger.info(
          `${operationName} succeeded after ${attempt} retries in ${totalTimeMs}ms`
        );
      }
      return { data, attempts: attempt + 1, totalTimeMs };
    } catch (error) {
      lastError = error;
      attempt++;

      if (!isRetryable(error)) {
        logger.warn(`${operationName} failed with non-retryable error:`, error);
        break;
      }

      if (attempt <= maxRetries) {
        //jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        const actualDelay = Math.min(delay + jitter, maxDelayMs);

        logger.warn(
          `${operationName} failed (attempt ${attempt}/${
            maxRetries + 1
          }), retrying in ${actualDelay}ms:`,
          error
        );

        onRetry?.(attempt, error, actualDelay);
        await sleep(actualDelay);
        delay = Math.min(delay * factor, maxDelayMs);
      }
    }
  } while (attempt <= maxRetries);

  const totalTimeMs = Date.now() - startTime;
  logger.error(
    `${operationName} failed after ${attempt} attempts in ${totalTimeMs}ms:`,
    lastError
  );

  throw new Error(
    `${operationName} failed after ${attempt} attempts: ${lastError}`
  );
}

export const retryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  factor: 2,
  maxDelayMs: 10000,
  isRetryable: (error: unknown) => {
    // Retry on rate limits, server errors, and network issues
    if (error instanceof Error) {
      return (
        error.message.includes("429") || // Rate limit
        error.message.includes("500") || // Server error
        error.message.includes("502") || // Bad gateway
        error.message.includes("503") || // Service unavailable
        error.message.includes("504") || // Gateway timeout
        error.message.includes("timeout") ||
        error.message.includes("network")
      );
    }
    return false;
  },
};

export default retryWithBackoff;
