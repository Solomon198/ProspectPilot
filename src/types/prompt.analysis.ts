/**
 * Tone of Voice Configuration Mapping
 */
export interface TOVConfig {
  formality: number; // 0-1: Casual to Formal
  warmth: number; // 0-1: Cold to Warm
  directness: number; // 0-1: Indirect to Direct
}

/**
 * Request Context for Sequence Generation
 */
export interface SequenceRequestContext {
  prospect_url: string;
  tov_config: TOVConfig;
  company_context: string;
  sequence_length: number;
}

/**
 * Prospect Analysis Result
 */
export interface ProspectAnalysis {
  name: string;
  jobTitle: string;
  company: string;
  industry: string;
  companySize: string;
  location: string;
  seniority: "entry" | "mid" | "senior" | "executive";
  decisionMaker: boolean;
  painPoints: string[];
  interests: string[];
  communicationStyle:
    | "formal"
    | "casual"
    | "technical"
    | "relationship-focused";
  buyingPower: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  objections: string[];
  hooks: string[];
}

/**
 * Generated Message Structure
 */
export interface GeneratedMessage {
  step: number;
  subject: string;
  body: string;
  timing: string; // e.g., "Day 1", "Day 3", "Day 7"
  channel: "email" | "linkedin" | "phone";
  personalization: string[];
  callToAction: string;
  followUpStrategy: string;
}

/**
 * AI Thinking Process
 */
export interface AIThinkingProcess {
  prospectAnalysis: ProspectAnalysis;
  strategy: {
    approach: string;
    valueProposition: string;
    objectionHandling: string;
    relationshipBuilding: string;
  };
  toneMapping: {
    formalityLevel: string;
    warmthLevel: string;
    directnessLevel: string;
    reasoning: string;
  };
  sequenceLogic: {
    progression: string;
    timing: string;
    channelSelection: string;
  };
}

/**
 * Confidence Scores
 */
export interface ConfidenceScores {
  prospectAnalysis: number; // 0-1
  valueProposition: number; // 0-1
  personalization: number; // 0-1
  objectionHandling: number; // 0-1
  overallSequence: number; // 0-1
}

/**
 * Final Output Structure
 */
export interface SequenceGenerationOutput {
  generatedMessages: GeneratedMessage[];
  aiThinkingProcess: AIThinkingProcess;
  confidenceScores: ConfidenceScores;
  prospectAnalysis: ProspectAnalysis;
}

/**
 * Database TOV Config type for prompt generation
 */
export interface TOVConfigMapping {
  formality: string;
  warmth: string;
  directness: string;
}
