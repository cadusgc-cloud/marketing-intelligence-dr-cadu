import type { CampaignPlan, EditorialDay, EditorialPillarId, SafetyGateResult } from "@/lib/monthly-editorial";
import type { DailyExecutionPlan, ExecutionTask, PublishingReadiness } from "@/lib/marketing-ops";
import type { StoryEditorialLine } from "@/lib/storyops";

export type PilotDayDefinition = {
  date: string;
  weekday: string;
  theme: string;
  editorialLine: StoryEditorialLine;
  pillarId: EditorialPillarId;
  objective: string;
  tone: string;
  note: string;
  hasReel: boolean;
  hasPostOrCarousel: boolean;
};

export type PilotDayScenario = {
  definition: PilotDayDefinition;
  editorialDay: EditorialDay;
  execution: DailyExecutionPlan;
  readiness: PublishingReadiness;
  safetyGate: SafetyGateResult;
  tasks: ExecutionTask[];
  exportText: string;
};

export type PilotWeekSummary = {
  campaignName: string;
  period: string;
  totalDays: number;
  totalStories: number;
  totalReels: number;
  totalPostsAndCarousels: number;
  totalTasks: number;
  totalSafetyAlerts: number;
  totalBlockedItems: number;
  averageReadiness: number;
  status: "aprovado" | "revisar" | "bloqueado";
};

export type PilotWeekExportBundle = {
  weeklyMarkdown: string;
  weeklyText: string;
  dailyPackages: string;
  stories: string;
  reels: string;
  postsAndCarousels: string;
  googleSheetsTsv: string;
  googleAgendaText: string;
  etusManual: string;
  videoEditorBrief: string;
  safetyReport: string;
  backupJson: string;
};

export type PilotWeekScenario = {
  id: string;
  campaignPlan: CampaignPlan;
  days: PilotDayScenario[];
  summary: PilotWeekSummary;
  safetyGate: SafetyGateResult;
  exports: PilotWeekExportBundle;
  generatedAt: Date;
};
