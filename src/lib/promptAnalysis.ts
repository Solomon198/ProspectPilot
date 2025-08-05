import { PersonResponse } from "peopledatalabs";
import { logger } from "../utils/logger";
import {
  ProspectAnalysis,
  SequenceRequestContext,
  TOVConfigMapping,
} from "../types/prompt.analysis";
import { ToneMapper } from "../utils/tone.mapper";

/**
 * Prospect Analysis Engine
 */
export class ProspectAnalyzer {
  /**
   * Analyze prospect profile from PDL response
   */
  static analyzeProspect(profile: PersonResponse): ProspectAnalysis {
    const person = profile;

    // Determine seniority based on job title and experience
    const seniority = this.determineSeniority(person.job_title || "");

    // Determine if they're a decision maker
    const decisionMaker = this.isDecisionMaker(
      person.job_title || "",
      seniority
    );

    // Analyze pain points based on role and industry
    const painPoints = this.identifyPainPoints(
      person.job_title || "",
      person.job_company_industry || ""
    );

    // Identify interests and hooks
    const interests = this.identifyInterests(
      person.skills || [],
      person.experience || []
    );
    const hooks = this.generateHooks(person, painPoints);

    // Determine communication style
    const communicationStyle = this.determineCommunicationStyle(
      person.job_title || "",
      person.job_company_industry || ""
    );

    // Assess buying power
    const buyingPower = this.assessBuyingPower(
      seniority,
      person.job_company_size || ""
    );

    // Assess urgency
    const urgency = this.assessUrgency(
      person.job_title || "",
      person.job_company_industry || ""
    );

    // Identify potential objections
    const objections = this.identifyObjections(person.job_title || "");

    return {
      name:
        person.full_name ||
        `${person.first_name || ""} ${person.last_name || ""}`.trim(),
      jobTitle: person.job_title || "Unknown",
      company: person.job_company_name || "Unknown",
      industry: person.job_company_industry || "Unknown",
      companySize: person.job_company_size || "Unknown",
      location: (person.location_name as string) || "Unknown",
      seniority,
      decisionMaker,
      painPoints,
      interests,
      communicationStyle,
      buyingPower,
      urgency,
      objections,
      hooks,
    };
  }

  private static determineSeniority(
    jobTitle: string
  ): "entry" | "mid" | "senior" | "executive" {
    const title = jobTitle.toLowerCase();

    if (
      title.includes("ceo") ||
      title.includes("cto") ||
      title.includes("cfo") ||
      title.includes("vp") ||
      title.includes("director") ||
      title.includes("head of")
    ) {
      return "executive";
    }

    if (
      title.includes("senior") ||
      title.includes("lead") ||
      title.includes("principal") ||
      title.includes("manager") ||
      title.includes("supervisor")
    ) {
      return "senior";
    }

    if (
      title.includes("junior") ||
      title.includes("associate") ||
      title.includes("entry")
    ) {
      return "entry";
    }

    return "mid";
  }

  private static isDecisionMaker(jobTitle: string, seniority: string): boolean {
    const title = jobTitle.toLowerCase();

    if (seniority === "executive") return true;

    return (
      title.includes("manager") ||
      title.includes("director") ||
      title.includes("head") ||
      title.includes("lead") ||
      title.includes("owner") ||
      title.includes("founder")
    );
  }

  private static identifyPainPoints(
    jobTitle: string,
    industry: string
  ): string[] {
    const painPoints: string[] = [];
    const title = jobTitle.toLowerCase();
    const ind = industry.toLowerCase();

    // Sales-related pain points
    if (title.includes("sales") || title.includes("revenue")) {
      painPoints.push(
        "lead generation",
        "conversion rates",
        "sales cycle length",
        "customer acquisition cost"
      );
    }

    // Marketing-related pain points
    if (title.includes("marketing")) {
      painPoints.push(
        "lead quality",
        "campaign ROI",
        "content creation",
        "brand awareness"
      );
    }

    // Operations-related pain points
    if (title.includes("operations") || title.includes("process")) {
      painPoints.push(
        "efficiency",
        "cost reduction",
        "process optimization",
        "team productivity"
      );
    }

    // Technology-related pain points
    if (
      title.includes("tech") ||
      title.includes("engineering") ||
      title.includes("developer")
    ) {
      painPoints.push(
        "development speed",
        "code quality",
        "technical debt",
        "team collaboration"
      );
    }

    // Industry-specific pain points
    if (ind.includes("saas")) {
      painPoints.push(
        "customer retention",
        "product-market fit",
        "scaling operations"
      );
    }

    return painPoints.slice(0, 3); // Return top 3 most relevant
  }

  private static identifyInterests(
    skills: string[],
    experience: any[]
  ): string[] {
    const interests: string[] = [];

    // Add skills as interests
    interests.push(...skills.slice(0, 5));

    // Add industry interests based on experience
    experience.forEach((exp) => {
      if (exp.company && !interests.includes(exp.company)) {
        interests.push(exp.company);
      }
    });

    return interests.slice(0, 5);
  }

  private static generateHooks(person: any, painPoints: string[]): string[] {
    const hooks: string[] = [];

    // Company-specific hooks
    if (person.company_name) {
      hooks.push(`I noticed ${person.company_name} is growing rapidly`);
      hooks.push(`I've been following ${person.company_name}'s success`);
    }

    // Role-specific hooks
    if (person.job_title) {
      hooks.push(
        `As a ${person.job_title}, you understand the challenges of...`
      );
    }

    // Pain point hooks
    painPoints.forEach((pain) => {
      hooks.push(
        `Many ${person.job_title || "professionals"} struggle with ${pain}`
      );
    });

    return hooks.slice(0, 3);
  }

  private static determineCommunicationStyle(
    jobTitle: string,
    industry: string
  ): "formal" | "casual" | "technical" | "relationship-focused" {
    const title = jobTitle.toLowerCase();
    const ind = industry.toLowerCase();

    if (
      title.includes("engineer") ||
      title.includes("developer") ||
      title.includes("technical")
    ) {
      return "technical";
    }

    if (title.includes("sales") || title.includes("marketing")) {
      return "relationship-focused";
    }

    if (ind.includes("startup") || ind.includes("tech")) {
      return "casual";
    }

    return "formal";
  }

  private static assessBuyingPower(
    seniority: string,
    companySize: string
  ): "low" | "medium" | "high" {
    if (seniority === "executive") return "high";
    if (seniority === "senior" && companySize !== "1-10") return "medium";
    return "low";
  }

  private static assessUrgency(
    jobTitle: string,
    industry: string
  ): "low" | "medium" | "high" {
    const title = jobTitle.toLowerCase();
    const ind = industry.toLowerCase();

    if (
      title.includes("sales") ||
      title.includes("revenue") ||
      ind.includes("saas")
    ) {
      return "high";
    }

    if (title.includes("marketing") || title.includes("growth")) {
      return "medium";
    }

    return "low";
  }

  private static identifyObjections(jobTitle: string): string[] {
    const objections: string[] = [];
    const title = jobTitle.toLowerCase();

    objections.push(
      "not the right time",
      "budget constraints",
      "need to think about it"
    );

    if (title.includes("sales")) {
      objections.push("already have a solution", "need to consult team");
    }

    if (title.includes("marketing")) {
      objections.push("need to see ROI first", "current campaigns are working");
    }

    return objections;
  }
}

/**
 * Prompt Generation Engine
 */
export class PromptGenerator {
  /**
   * Generate system prompt for sequence generation
   */
  static generateSystemPrompt(companyContext: string): string {
    return `You are an expert that will help company achieve their goals, use the company context to understand the company and the goals they want to achieve.

COMPANY CONTEXT:
${companyContext}

CORE PRINCIPLES:
- Always personalize based on prospect's role, company, and pain points
- Match communication style to prospect's seniority and industry
- Include clear value propositions and calls-to-action
- Handle objections proactively
- Use appropriate timing and channel selection
- Follow the specified tone of voice precisely

OUTPUT FORMAT:
Return a valid JSON object with:
- generatedMessages: Array of message objects with step, subject, body, timing, channel(linkedin), personalization, callToAction, followUpStrategy and thinkingProcess.
- aiThinkingProcess: Your analysis and strategy reasoning including prospectAnalysis, strategy and toneMapping, sequenceLogic
- confidenceScores: Confidence levels (0-1) for prospectAnalysis, valueProposition, personalization, objectionHandling, overallSequence
- prospectAnalysis: Detailed prospect insights

Be specific, actionable, and highly personalized. Ensure all JSON is properly formatted and valid.`;
  }

  /**
   * Generate user prompt for sequence generation
   */
  static generateUserPrompt(
    analysis: ProspectAnalysis,
    context: SequenceRequestContext,
    tovConfig: TOVConfigMapping
  ): string {
    const toneInstructions = ToneMapper.generateToneInstructions(tovConfig);

    return `Generate a ${
      context.sequence_length
    }-step sales sequence for this prospect:

PROSPECT DATA:
Name: ${analysis.name}
Role: ${analysis.jobTitle} at ${analysis.company} (${analysis.industry}, ${
      analysis.companySize
    } employees)
Location: ${analysis.location}
Seniority: ${analysis.seniority} level
Decision Maker: ${analysis.decisionMaker ? "Yes" : "No"}
Communication Style: ${analysis.communicationStyle}
Buying Power: ${analysis.buyingPower}
Urgency: ${analysis.urgency}

Pain Points to Address:
${analysis.painPoints.map((pain) => `- ${pain}`).join("\n")}

Personalization Hooks:
${analysis.hooks.map((hook) => `- ${hook}`).join("\n")}

Potential Objections:
${analysis.objections.map((obj) => `- ${obj}`).join("\n")}

Skills & Interests:
${analysis.interests.map((interest) => `- ${interest}`).join("\n")}


TONE REQUIREMENTS:
${toneInstructions}

Create a sequence that addresses their specific challenges, uses personalized hooks, and drives action while following the specified tone.`;
  }

  /**
   * Generate complete prompt pair for sequence generation
   */
  static generatePromptPair(
    profile: PersonResponse,
    context: SequenceRequestContext,
    companyContext: string,
    tovConfig: TOVConfigMapping
  ): { systemPrompt: string; userPrompt: string } {
    const analysis = ProspectAnalyzer.analyzeProspect(profile);

    logger.info("Generated prospect analysis", {
      name: analysis.name,
      seniority: analysis.seniority,
      decisionMaker: analysis.decisionMaker,
      painPoints: analysis.painPoints.length,
    });

    return {
      systemPrompt: this.generateSystemPrompt(companyContext),
      userPrompt: this.generateUserPrompt(analysis, context, tovConfig),
    };
  }
}
