-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "sourceLabel" TEXT,
    "isOperationalAnomaly" BOOLEAN NOT NULL DEFAULT false,
    "anomalyReason" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelSummary" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "investment" DOUBLE PRECISION,
    "reach" INTEGER,
    "impressions" INTEGER,
    "frequency" DOUBLE PRECISION,
    "clicks" INTEGER,
    "profileVisits" INTEGER,
    "newFollowers" INTEGER,
    "followersTotal" INTEGER,
    "conversations" INTEGER,
    "conversions" INTEGER,
    "opportunities" INTEGER,
    "cpl" DOUBLE PRECISION,
    "cpa" DOUBLE PRECISION,
    "cps" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "ctr" DOUBLE PRECISION,
    "engagementRate" DOUBLE PRECISION,
    "storyCount" INTEGER,
    "storyViews" INTEGER,
    "storyRetention" DOUBLE PRECISION,
    "reelCount" INTEGER,
    "postCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativePerformance" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'unknown',
    "funnelStage" TEXT NOT NULL DEFAULT 'unknown',
    "investment" DOUBLE PRECISION,
    "conversations" INTEGER,
    "conversions" INTEGER,
    "leads" INTEGER,
    "cpl" DOUBLE PRECISION,
    "cpa" DOUBLE PRECISION,
    "profileVisits" INTEGER,
    "reach" INTEGER,
    "impressions" INTEGER,
    "interactions" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "diagnosis" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreativePerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordPerformance" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "investment" DOUBLE PRECISION,
    "clicks" INTEGER,
    "conversions" INTEGER,
    "cpa" DOUBLE PRECISION,
    "diagnosis" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KeywordPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataIssue" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fieldName" TEXT,
    "expectedValue" TEXT,
    "foundValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DataIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "BenchmarkSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "diagnosisJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelSummary_reportId_idx" ON "ChannelSummary"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelSummary_reportId_channel_key" ON "ChannelSummary"("reportId", "channel");

-- CreateIndex
CREATE INDEX "CreativePerformance_reportId_idx" ON "CreativePerformance"("reportId");

-- CreateIndex
CREATE INDEX "KeywordPerformance_reportId_idx" ON "KeywordPerformance"("reportId");

-- CreateIndex
CREATE INDEX "Recommendation_reportId_idx" ON "Recommendation"("reportId");

-- CreateIndex
CREATE INDEX "DataIssue_reportId_idx" ON "DataIssue"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "BenchmarkSetting_key_key" ON "BenchmarkSetting"("key");

-- CreateIndex
CREATE INDEX "AgentRun_reportId_idx" ON "AgentRun"("reportId");

-- AddForeignKey
ALTER TABLE "ChannelSummary" ADD CONSTRAINT "ChannelSummary_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativePerformance" ADD CONSTRAINT "CreativePerformance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordPerformance" ADD CONSTRAINT "KeywordPerformance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataIssue" ADD CONSTRAINT "DataIssue_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
