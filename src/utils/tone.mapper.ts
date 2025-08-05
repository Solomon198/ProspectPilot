import { TOVConfig } from "../types/prompt.analysis";

/**
 * Tone Mapping Utilities
 */
export class ToneMapper {
  /**
   * Map formality score to descriptive level (0-1 with 0.1 increments)
   */
  static mapFormality(score: number): string {
    if (score <= 0.1) return "extremely casual";
    if (score <= 0.2) return "very casual";
    if (score <= 0.3) return "casual";
    if (score <= 0.4) return "slightly casual";
    if (score <= 0.5) return "neutral";
    if (score <= 0.6) return "slightly formal";
    if (score <= 0.7) return "formal";
    if (score <= 0.8) return "very formal";
    if (score <= 0.9) return "highly formal";
    return "extremely formal";
  }

  /**
   * Map warmth score to descriptive level (0-1 with 0.1 increments)
   */
  static mapWarmth(score: number): string {
    if (score <= 0.1) return "cold and impersonal";
    if (score <= 0.2) return "very professional and direct";
    if (score <= 0.3) return "professional and direct";
    if (score <= 0.4) return "business-focused";
    if (score <= 0.5) return "neutral";
    if (score <= 0.6) return "friendly";
    if (score <= 0.7) return "warm and personal";
    if (score <= 0.8) return "very warm and personal";
    if (score <= 0.9) return "highly warm and relationship-focused";
    return "extremely warm and relationship-focused";
  }

  /**
   * Map directness score to descriptive level (0-1 with 0.1 increments)
   */
  static mapDirectness(score: number): string {
    if (score <= 0.1) return "extremely indirect and suggestive";
    if (score <= 0.2) return "very indirect and suggestive";
    if (score <= 0.3) return "indirect and suggestive";
    if (score <= 0.4) return "soft approach";
    if (score <= 0.5) return "balanced";
    if (score <= 0.6) return "direct";
    if (score <= 0.7) return "very direct";
    if (score <= 0.8) return "highly direct";
    if (score <= 0.9) return "extremely direct";
    return "very direct and straightforward";
  }

  /**
   * Generate tone instructions for AI
   */
  static generateToneInstructions(tov: TOVConfig): string {
    const formality = this.mapFormality(tov.formality);
    const warmth = this.mapWarmth(tov.warmth);
    const directness = this.mapDirectness(tov.directness);

    return `Write in a ${formality} tone that is ${warmth} and ${directness}. 
      ${
        tov.formality > 0.7
          ? "Use professional language and industry terminology."
          : ""
      }
      ${
        tov.warmth > 0.7
          ? "Include personal touches and relationship-building elements."
          : ""
      }
      ${
        tov.directness > 0.7
          ? "Be clear about the value proposition and call-to-action."
          : ""
      }`;
  }
}
