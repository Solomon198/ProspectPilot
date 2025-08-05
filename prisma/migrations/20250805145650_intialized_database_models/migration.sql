-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "jobTitle" TEXT,
    "jobCompanyName" TEXT,
    "jobCompanyIndustry" TEXT,
    "jobCompanySize" TEXT,
    "locationName" TEXT,
    "skills" TEXT[],
    "experience" JSONB,
    "education" JSONB,
    "email" TEXT,
    "linkedinUsername" TEXT,
    "seniority" TEXT,
    "decisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "painPoints" TEXT[],
    "interests" TEXT[],
    "communicationStyle" TEXT,
    "buyingPower" TEXT,
    "urgency" TEXT,
    "objections" TEXT[],
    "hooks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tov_configs" (
    "id" TEXT NOT NULL,
    "tov" DOUBLE PRECISION NOT NULL,
    "formality" TEXT NOT NULL,
    "warmth" TEXT NOT NULL,
    "directness" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tov_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "companyContext" TEXT NOT NULL,
    "generatedMessages" JSONB,
    "aiThinkingProcess" JSONB,
    "confidenceScores" JSONB,
    "prospectAnalysis" JSONB,
    "tovConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "costPer1kInput" DOUBLE PRECISION NOT NULL,
    "costPer1kOutput" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospects_linkedinUrl_key" ON "prospects"("linkedinUrl");

-- CreateIndex
CREATE UNIQUE INDEX "tov_configs_tov_key" ON "tov_configs"("tov");

-- CreateIndex
CREATE UNIQUE INDEX "messages_prospectId_key" ON "messages"("prospectId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_generations_messageId_key" ON "ai_generations"("messageId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "prospects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
