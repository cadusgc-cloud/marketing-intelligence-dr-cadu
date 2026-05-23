import type { MarketingQualityReport } from "@/lib/marketing-quality";
import type { PilotWeekScenario } from "@/lib/marketing-scenarios";

export type DogfoodingStatus = "aprovado" | "revisar" | "bloqueado";

export type DogfoodingFailure = {
  id: string;
  severity: "warning" | "blocking";
  message: string;
  source: string;
};

export type DogfoodingReport = {
  id: string;
  scenario: PilotWeekScenario;
  quality: MarketingQualityReport;
  totalDays: number;
  totalStories: number;
  totalReels: number;
  totalPostsAndCarousels: number;
  totalTasks: number;
  totalAlerts: number;
  totalBlocks: number;
  dailyReadiness: Array<{ date: string; score: number; status: string; risk: string }>;
  weeklyReadiness: number;
  blockedContent: string[];
  sensitiveTermsDetected: string[];
  exportsGenerated: string[];
  failures: DogfoodingFailure[];
  finalStatus: DogfoodingStatus;
  generatedAt: Date;
};

export type DogfoodingOptions = {
  injectBlockedContent?: boolean;
};
