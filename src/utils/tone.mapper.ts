import { TOVConfigMapping } from "../types/prompt.analysis";

export class ToneMapper {
  static generateToneInstructions(tovConfig: TOVConfigMapping): string {
    const formality = tovConfig.formality;
    const warmth = tovConfig.warmth;
    const directness = tovConfig.directness;

    return `Write in a ${formality} tone that is ${warmth} and ${directness}. 
      ${
        formality.includes("formal")
          ? "Use professional language and industry terminology."
          : ""
      }
      ${
        warmth.includes("warm")
          ? "Include personal touches and relationship-building elements."
          : ""
      }
      ${
        directness.includes("direct")
          ? "Be clear about the value proposition and call-to-action."
          : ""
      }`;
  }
}
