import PDLJS, { PersonResponse } from "peopledatalabs";
import { logger } from "../utils/logger";
import retryWithBackoff, { retryConfig } from "../utils/retryWithBackoff";
import { env } from "../config/env";

// Initialize PDL client
export const pdl = new PDLJS({
  apiKey: env.PDL_API_KEY,
});

export const pdlWithRetry = {
  async enrichProfile(linkedinUrl: string): Promise<PersonResponse> {
    logger.info("Enriching profile with PDL", {
      linkedinUrl,
    });

    const result = await retryWithBackoff(
      async (_attemps: number) => {
        logger.debug("Making PDL API call", { linkedinUrl });

        const response = await pdl.person.enrichment({
          profile: linkedinUrl,
        });

        logger.debug("PDL API call successful", {
          linkedinUrl,
          status: response.status,
        });

        return response;
      },
      {
        ...retryConfig,
        operationName: "pdl-profile-enrichment",
      }
    );

    if (!result.data?.data) {
      throw new Error("No profile data returned from PDL");
    }

    logger.info("Profile enrichment successful", {
      fullName: result.data.data.full_name,
      jobTitle: result.data.data.job_title,
    });

    return result.data.data;
  },
};
