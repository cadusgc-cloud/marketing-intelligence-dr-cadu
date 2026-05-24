import { buildDefaultWeeklyReview } from "@/lib/weekly-review";
import { buildContentStudioCheckReport } from "@/lib/content-studio";
import { buildIntelligenceDashboard } from "@/lib/marketing-intelligence";
import type { MarketingWorkspace, WorkspaceHistoryEvent } from "@/lib/marketing-workspace/types";
import { workspaceNotice, workspaceSchemaVersion } from "@/lib/marketing-workspace/schema";
import { buildDefaultWorkspaceSettings } from "@/lib/marketing-workspace/settings";
import { createWorkspaceSnapshot } from "@/lib/marketing-workspace/snapshots";

export function buildDefaultMarketingWorkspace(): MarketingWorkspace {
  const weekly = buildDefaultWeeklyReview();
  const studio = buildContentStudioCheckReport();
  const intelligence = buildIntelligenceDashboard();
  const history: WorkspaceHistoryEvent[] = [
    event("workspace_created", "Workspace local criado", "Estado inicial V8 criado com dados ficticios e agregados.", "workspace", "/workspace", "info"),
    event("weekly_review_completed", "Fechamento semanal V7 disponivel", `Semana ${weekly.period.label} consolidada com ${weekly.currentRecords.length} registros.`, "weekly-review", "/weekly-review", "info"),
    event("strategy_generated", "Estrategia adaptativa disponivel", `Intelligence score ${intelligence.intelligenceScore}/100.`, "marketing-intelligence", "/strategy", "info"),
    event("content_package_generated", "Studio validado", `Studio check ${studio.status}, readiness ${studio.averageReadiness}/100.`, "content-studio", "/studio", "info"),
    event("export_generated", "Exportacoes locais geradas", "Relatorios Markdown, TSV, Agenda e Etus/manual disponiveis sem API.", "exports", "/exports", "info")
  ];
  const workspace: MarketingWorkspace = {
    version: workspaceSchemaVersion,
    metadata: {
      id: "workspace-dr-cadu-local-v8",
      name: "Workspace Marketing OS v8",
      ownerLabel: "Dr. Cadu Gazzinelli",
      createdAt: "2026-05-23T12:00:00.000Z",
      updatedAt: "2026-05-23T12:00:00.000Z",
      schemaVersion: workspaceSchemaVersion,
      notice: workspaceNotice
    },
    settings: buildDefaultWorkspaceSettings(),
    activeCycle: {
      weekId: weekly.period.label,
      periodStart: weekly.period.startDate,
      periodEnd: weekly.period.endDate,
      campaignName: "Semana operacional com importacao manual",
      currentFocus: "Fechar metricas, manter rotina segura e preparar proximo ciclo.",
      lastWeeklyReviewId: "weekly-review-v7-default",
      nextRecommendedCycle: "2026-05-31 a 2026-06-06",
      readinessScore: weekly.quality.score,
      riskStatus: weekly.quality.status === "aprovado" ? "saudavel" : "revisar"
    },
    snapshots: [],
    history,
    auditTrail: history,
    closedWeeks: [
      {
        weekId: weekly.period.label,
        periodStart: weekly.period.startDate,
        periodEnd: weekly.period.endDate,
        summary: "Semana ficticia de validacao local com comparacao e plano seguinte.",
        readinessScore: weekly.quality.score,
        riskStatus: weekly.quality.status === "aprovado" ? "saudavel" : "revisar"
      }
    ]
  };
  const weeklySnapshot = createWorkspaceSnapshot(workspace, "weekly", "Snapshot semanal V8");
  const postReviewSnapshot = createWorkspaceSnapshot({ ...workspace, snapshots: [weeklySnapshot] }, "post_review", "Apos fechamento semanal");
  return { ...workspace, snapshots: [postReviewSnapshot, weeklySnapshot] };
}

function event(type: WorkspaceHistoryEvent["type"], title: string, description: string, sourceModule: string, relatedRoute: string, severity: WorkspaceHistoryEvent["severity"]): WorkspaceHistoryEvent {
  return {
    id: `event-${type}`,
    timestamp: "2026-05-23T12:00:00.000Z",
    type,
    title,
    description,
    severity,
    sourceModule,
    relatedRoute,
    metadata: { local: true },
    safetyStatus: "saudavel"
  };
}
