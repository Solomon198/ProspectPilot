/**
 * Sequence Generation Response Interface
 * Matches the response structure from generateSequence controller
 */

export interface PDLProfile {
  name: string;
  company: string;
  jobTitle: string;
  industry: string;
  location: string;
  skills: string[];
}

export interface SequenceGenerationData {
  generatedMessages: any[];
  aiThinkingProcess: any;
  confidenceScores: any;
  prospectAnalysis: any;
  model_used: string;
  usage: any;
  pdlProfile: PDLProfile;
}

export interface SequenceGenerationResponse {
  success: true;
  message: "Sequence generated successfully";
  data: SequenceGenerationData;
  cached?: boolean;
}

export interface SequenceGenerationErrorResponse {
  success: false;
  message: "Failed to generate sequence";
  error: string;
}

export type SequenceGenerationApiResponse =
  | SequenceGenerationResponse
  | SequenceGenerationErrorResponse;
