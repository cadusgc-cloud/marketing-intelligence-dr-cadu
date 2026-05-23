import { generateMonthlyEditorialPlan, type CampaignInput } from "@/lib/monthly-editorial";
import { MARKETING_OPS_BASE_DATE } from "@/lib/marketing-ops/constants";
import { buildContentBacklog, buildRepurposingPlans } from "@/lib/marketing-ops/backlog";
import { buildDailyExecutionPlan } from "@/lib/marketing-ops/daily";
import { buildExportPackages, buildManualPublishingChecklist } from "@/lib/marketing-ops/exports";
import { buildEditorialAssetNeeds, buildMediaCaptureTasks, detectBlockedMediaTerms, detectMediaOpsGaps } from "@/lib/marketing-ops/media";
import { aggregateReadiness } from "@/lib/marketing-ops/scoring";
import { buildEditorialRiskSummary } from "@/lib/marketing-ops/safety";
import { buildProductionQueue } from "@/lib/marketing-ops/tasks";
import { buildWeeklyExecutionPlans } from "@/lib/marketing-ops/weekly";
import type {
  EditorialOperation,
  ExecutionDashboard,
  MarketingOpsBuildOptions,
  MarketingOpsState,
  MonthlyCampaignReference,
  OpsHealthCheck,
  OpsRecommendation
} from "@/lib/marketing-ops/types";

export function buildMarketingOpsState(options: MarketingOpsBuildOptions = {}): MarketingOpsState {
  const campaignInput: CampaignInput = {
    startDate: MARKETING_OPS_BASE_DATE,
    durationDays: 30,
    ...(options.campaignInput ?? {})
  };
  const campaignPlan = generateMonthlyEditorialPlan(campaignInput);
  const dashboard = buildExecutionDashboard(campaignPlan, options.todayDate ?? campaignPlan.days[0]?.date ?? MARKETING_OPS_BASE_DATE);

  return {
    id: `marketing-ops-${campaignPlan.id}`,
    campaignInput,
    campaignPlan,
    dashboard,
    generatedAt: new Date("2026-05-23T12:00:00.000Z")
  };
}

export function buildExecutionDashboard(campaignPlan = generateMonthlyEditorialPlan(), todayDate = MARKETING_OPS_BASE_DATE): ExecutionDashboard {
  const days = campaignPlan.days.map(buildDailyExecutionPlan);
  const today = days.find((day) => day.date === todayDate) ?? days[0];
  const weeks = buildWeeklyExecutionPlans(days);
  const week = weeks.find((weekItem) => weekItem.weekNumber === today.sourceDay.weekNumber) ?? weeks[0];
  const month: MonthlyCampaignReference = {
    id: campaignPlan.id,
    name: campaignPlan.name,
    startDate: campaignPlan.startDate,
    endDate: campaignPlan.endDate,
    durationDays: campaignPlan.durationDays,
    objective: campaignPlan.objective,
    intensity: campaignPlan.intensity
  };
  const tasks = buildProductionQueue(days);
  const backlog = buildContentBacklog();
  const repurposing = buildRepurposingPlans(backlog);
  const mediaText = days.flatMap((day) => day.sourceDay.mediaSuggestions.map((media) => `${media.label} ${media.description} ${media.privacyNote}`)).join(" ");
  const safety = buildEditorialRiskSummary(days);
  const checklist = buildManualPublishingChecklist();
  const weekReadiness = week.readiness;
  const monthReadiness = aggregateReadiness(days);
  const dashboardCore: Omit<ExecutionDashboard, "exports"> = {
    today,
    week,
    month,
    days,
    tasks,
    backlog,
    repurposing,
    media: {
      assetNeeds: buildEditorialAssetNeeds(days),
      captureTasks: buildMediaCaptureTasks(days),
      gaps: detectMediaOpsGaps(days),
      blockedTerms: detectBlockedMediaTerms(mediaText)
    },
    safety,
    checklist,
    healthChecks: buildHealthChecks(days, tasks.blockedTasks.length),
    recommendations: buildOpsRecommendations(days, tasks.blockedTasks.length),
    operations: buildEditorialOperations(today, weekReadiness, monthReadiness),
    readiness: {
      today: today.readiness,
      week: weekReadiness,
      month: monthReadiness,
      bottlenecks: buildBottlenecks(today.readiness.blockers.concat(weekReadiness.blockers, monthReadiness.blockers), detectMediaOpsGaps(days))
    }
  };

  return {
    ...dashboardCore,
    exports: buildExportPackages(dashboardCore)
  };
}

function buildHealthChecks(days: ReturnType<typeof buildDailyExecutionPlan>[], blockedTasks: number): OpsHealthCheck[] {
  return [
    check("storyops", "StoryOps integrado", days.every((day) => day.storyExport.includes("Story 6:")) ? "ok" : "bloqueado", "Todos os dias devem ter 6 stories gerados."),
    check("monthly", "Campanha mensal ativa", days.length >= 30 ? "ok" : "atencao", `${days.length} dias carregados no plano operacional.`),
    check("safety", "Safety gate", blockedTasks === 0 ? "ok" : "atencao", blockedTasks === 0 ? "Sem tarefa bloqueada na base padrao." : `${blockedTasks} tarefa(s) bloqueada(s).`),
    check("manual", "Publicacao manual", "ok", "Nenhuma publicacao automatica foi criada.")
  ];
}

function buildOpsRecommendations(days: ReturnType<typeof buildDailyExecutionPlan>[], blockedTasks: number): OpsRecommendation[] {
  const today = days[0];
  const recommendations: OpsRecommendation[] = [
    {
      id: "today-first-action",
      title: "Executar primeiro pacote do dia",
      description: `Comecar por ${today.theme}: revisar stories, separar midia e liberar publicacao manual se o safety estiver ok.`,
      priority: today.readiness.status === "bloqueado" ? "critica" : "alta",
      area: "strategy",
      nextAction: "Abrir /operations, copiar pacote do dia e revisar checklist."
    },
    {
      id: "media-capture",
      title: "Reservar bloco de captura de midia natural",
      description: "Gravar videos curtos, fundos simples e imagens de estudo antes de preparar posts.",
      priority: "alta",
      area: "media",
      nextAction: "Capturar material neutro sem local, tela, documento ou pessoa identificavel."
    }
  ];
  if (blockedTasks > 0) {
    recommendations.push({
      id: "resolve-blocks",
      title: "Resolver bloqueios antes de publicar",
      description: "Conteudo bloqueado nao deve gerar tarefa de publicacao.",
      priority: "critica",
      area: "safety",
      nextAction: "Abrir Safety Center e ajustar termos ou midia."
    });
  }
  return recommendations;
}

function buildEditorialOperations(today: ReturnType<typeof buildDailyExecutionPlan>, week: ReturnType<typeof aggregateReadiness>, month: ReturnType<typeof aggregateReadiness>): EditorialOperation[] {
  return [
    { id: "op-today", label: "Hoje", scope: "hoje", status: today.readiness.readyForManualPublishing ? "pronto" : "pendente", readiness: today.readiness },
    { id: "op-week", label: "Esta semana", scope: "semana", status: week.readyForManualPublishing ? "pronto" : "em_andamento", readiness: week },
    { id: "op-month", label: "Este mes", scope: "mes", status: month.readyForManualPublishing ? "pronto" : "em_andamento", readiness: month }
  ];
}

function buildBottlenecks(blockers: string[], mediaGaps: string[]): string[] {
  const merged = Array.from(new Set([...blockers, ...mediaGaps]));
  return merged.length ? merged.slice(0, 8) : ["sem gargalo critico no plano padrao"];
}

function check(id: string, label: string, status: OpsHealthCheck["status"], message: string): OpsHealthCheck {
  return { id, label, status, message };
}
