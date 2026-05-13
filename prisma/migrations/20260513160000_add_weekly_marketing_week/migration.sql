-- CreateTable
CREATE TABLE "WeeklyMarketingWeek" (
    "id" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "metaSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metaWhatsappConversations" INTEGER NOT NULL DEFAULT 0,
    "metaProfileVisits" INTEGER NOT NULL DEFAULT 0,
    "googleSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "googleClicks" INTEGER NOT NULL DEFAULT 0,
    "googleConversions" INTEGER NOT NULL DEFAULT 0,
    "instagramStories" INTEGER NOT NULL DEFAULT 0,
    "instagramReels" INTEGER NOT NULL DEFAULT 0,
    "instagramPosts" INTEGER NOT NULL DEFAULT 0,
    "instagramProfileVisits" INTEGER NOT NULL DEFAULT 0,
    "whatsappTotal" INTEGER NOT NULL DEFAULT 0,
    "qualifiedConversations" INTEGER NOT NULL DEFAULT 0,
    "consultationsScheduled" INTEGER,
    "consultationsAttended" INTEGER,
    "surgeriesClosed" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WeeklyMarketingWeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyMarketingWeek_endDate_updatedAt_idx" ON "WeeklyMarketingWeek"("endDate", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMarketingWeek_startDate_endDate_key" ON "WeeklyMarketingWeek"("startDate", "endDate");
