import { z } from "zod";

export const generateSequenceSchema = z.object({
  prospect_url: z
    .string()
    .url("Invalid URL format")
    .refine((url) => {
      const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[^\/]+$/;
      return linkedinPattern.test(url);
    }, "URL must be a valid LinkedIn profile URL with a username (e.g., https://linkedin.com/in/username)"),
  tov_config: z.object({
    formality: z.coerce.number().min(0).max(1),
    warmth: z.coerce.number().min(0).max(1),
    directness: z.coerce.number().min(0).max(1),
  }),
  company_context: z.string().min(1, "Company context is required"),
  sequence_length: z.number().int().positive().min(1).default(3),
});

export type GenerateSequenceInput = z.infer<typeof generateSequenceSchema>;
