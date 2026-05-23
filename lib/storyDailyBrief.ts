import {
  buildStoryDayExecutionBoard,
  generateStoryExecutionChecklist,
  getBlockedStoryItems,
  getItemsNeedingReview,
  getReadyToPublishItems,
  getStoryExecutionNextActions,
  summarizeStoryExecution,
  type StoryDayExecutionBoard,
  type StoryExecutionItem,
  type StoryExecutionPriority
} from "@/lib/storyExecutionBoard";
import { buildStoryWeekExportPackage, type StoryDayExportPackage, type StoryWeekExportPackage } from "@/lib/storyWeekExport";
import { storySlotTypeLabel, storyWeekThemeLabel } from "@/lib/storyWeekBuilder";

export type StoryDailyBriefStatus = "ready_for_manual_execution" | "needs_review" | "blocked" | "limited_data";
export type StoryDailyBriefActionOwner = "Cadu" | "marketing" | "atendimento" | "revisao humana";
export type StoryDailyBriefActionWindow = "agora" | "hoje" | "apos publicar";
export type StoryDailyBriefActionType = "review" | "manual_publish" | "data_capture" | "strategy" | "privacy";

export type StoryDailyBriefAction = {
  id: string;
  title: string;
  description: string;
  priority: StoryExecutionPriority;
  type: StoryDailyBriefActionType;
  ownerSuggestion: StoryDailyBriefActionOwner;
  actionWindow: StoryDailyBriefActionWindow;
};

export type StoryDailyBriefQueueItem = {
  id: string;
  order: number;
  title: string;
  slotTypeLabel: string;
  funnelStage: string;
  pillar: string;
  suggestedText: string;
  suggestedCTA: string;
  stickerSuggestion: string;
  suggestedFilename: string;
  status: StoryExecutionItem["executionStatus"];
  priority: StoryExecutionPriority;
  reason: string;
  warnings: string[];
};

export type StoryDailyBriefDayOption = {
  dayLabel: string;
  date: string;
  href: string;
  isSelected: boolean;
};

export type StoryDailyBrief = {
  id: string;
  weekLabel: string;
  dayLabel: string;
  date: string;
  themeLabel: string;
  objective: string;
  status: StoryDailyBriefStatus;
  statusLabel: string;
  totalStories: number;
  readyCount: number;
  reviewCount: number;
  blockedCount: number;
  ctaCount: number;
  directCtaCount: number;
  bofuCount: number;
  mofuCount: number;
  tofuCount: number;
  progressPercent: number;
  mainWarning: string;
  topPriorities: StoryDailyBriefAction[];
  manualPublishQueue: StoryDailyBriefQueueItem[];
  reviewQueue: StoryDailyBriefQueueItem[];
  dataCaptureChecklist: string[];
  guardrails: string[];
  nextActions: StoryDailyBriefAction[];
  availableDays: StoryDailyBriefDayOption[];
  sourceLinks: Array<{ label: string; href: string }>;
  createdAt: Date;
};

export type StoryDailyBriefOptions = {
  date?: string;
  dayLabel?: string;
  referenceDate?: Date | string;
  exportPackage?: StoryWeekExportPackage;
};

const fallbackReferenceDate = "2026-05-16";

export function buildStoryDailyBrief(options: StoryDailyBriefOptions = {}): StoryDailyBrief {
  const exportPackage = options.exportPackage ?? buildStoryWeekExportPackage();
  const selectedDay = selectStoryDailyBriefDay(exportPackage, options);
  const board = buildStoryDayExecutionBoard(selectedDay);

  return buildStoryDailyBriefFromBoard(exportPackage, selectedDay, board);
}

export function buildStoryDailyBriefFromBoard(
  exportPackage: StoryWeekExportPackage,
  dayPackage: StoryDayExportPackage,
  board: StoryDayExecutionBoard = buildStoryDayExecutionBoard(dayPackage)
): StoryDailyBrief {
  const summary = summarizeStoryExecution(board);
  const reviewQueue = buildReviewQueue(board.items);
  const manualPublishQueue = buildManualPublishQueue(board.items);
  const status = determineDailyBriefStatus(board);
  const dayHref = `/stories/today?date=${encodeURIComponent(dayPackage.date)}`;

  return {
    id: `story-daily-brief-${dayPackage.date}`,
    weekLabel: exportPackage.weekLabel,
    dayLabel: dayPackage.dayLabel,
    date: dayPackage.date,
    themeLabel: storyWeekThemeLabel(dayPackage.theme),
    objective: dayPackage.objective,
    status,
    statusLabel: storyDailyBriefStatusLabel(status),
    totalStories: board.totalStories,
    readyCount: summary.readyCount + summary.approvedCount,
    reviewCount: summary.needsReviewCount,
    blockedCount: summary.blockedCount,
    ctaCount: summary.directCtaCount + summary.lightCtaCount,
    directCtaCount: summary.directCtaCount,
    bofuCount: board.items.filter((item) => item.funnelStage === "BOFU").length,
    mofuCount: board.items.filter((item) => item.funnelStage === "MOFU").length,
    tofuCount: board.items.filter((item) => item.funnelStage === "TOFU").length,
    progressPercent: summary.progressPercent,
    mainWarning: buildDailyBriefMainWarning(board),
    topPriorities: buildDailyBriefPriorities(board, reviewQueue, manualPublishQueue),
    manualPublishQueue,
    reviewQueue,
    dataCaptureChecklist: buildDailyDataCaptureChecklist(),
    guardrails: buildDailyBriefGuardrails(),
    nextActions: buildDailyBriefNextActions(board),
    availableDays: exportPackage.dayPackages.map((day) => ({
      dayLabel: day.dayLabel,
      date: day.date,
      href: `/stories/today?date=${encodeURIComponent(day.date)}`,
      isSelected: day.date === dayPackage.date
    })),
    sourceLinks: [
      { label: "Board de execucao manual", href: "/stories/execution" },
      { label: "Exportacao da semana", href: "/stories/export" },
      { label: "Resultados dos Stories", href: "/stories/results" },
      { label: "Aprendizado dos Stories", href: "/stories/learning" },
      { label: "Central Semanal", href: "/weekly" },
      { label: "Este briefing", href: dayHref }
    ],
    createdAt: exportPackage.createdAt
  };
}

export function selectStoryDailyBriefDay(exportPackage: StoryWeekExportPackage, options: StoryDailyBriefOptions = {}): StoryDayExportPackage {
  const requestedDate = options.date || isoDateFromReference(options.referenceDate ?? fallbackReferenceDate);
  const byDate = exportPackage.dayPackages.find((day) => day.date === requestedDate);
  if (byDate) return byDate;

  if (options.dayLabel) {
    const requestedLabel = normalizeLabel(options.dayLabel);
    const byLabel = exportPackage.dayPackages.find((day) => normalizeLabel(day.dayLabel) === requestedLabel);
    if (byLabel) return byLabel;
  }

  return exportPackage.dayPackages[0];
}

export function buildReviewQueue(items: StoryExecutionItem[]): StoryDailyBriefQueueItem[] {
  return items
    .filter((item) => item.executionStatus === "needs_review" || item.executionStatus === "blocked" || item.privacyRisk !== "low" || item.ethicalWarnings.length > 0)
    .map((item) => queueItemFromExecutionItem(item, reviewReasonForItem(item)));
}

export function buildManualPublishQueue(items: StoryExecutionItem[]): StoryDailyBriefQueueItem[] {
  const readyItems = getReadyToPublishItems(items);
  const safePendingItems = items.filter((item) => item.executionStatus === "pending" && item.privacyRisk === "low" && item.ethicalWarnings.length === 0);
  return [...readyItems, ...safePendingItems].map((item) => queueItemFromExecutionItem(item, publishReasonForItem(item)));
}

export function buildDailyBriefPriorities(
  board: StoryDayExecutionBoard,
  reviewQueue: StoryDailyBriefQueueItem[] = buildReviewQueue(board.items),
  manualPublishQueue: StoryDailyBriefQueueItem[] = buildManualPublishQueue(board.items)
): StoryDailyBriefAction[] {
  const actions: StoryDailyBriefAction[] = [];
  const blocked = getBlockedStoryItems(board.items);
  const needsReview = getItemsNeedingReview(board.items);
  const ready = getReadyToPublishItems(board.items);

  if (blocked.length > 0) {
    actions.push(action("resolve-blocked", "Resolver bloqueios antes de publicar", `${blocked.length} story/stories estao bloqueados ate revisao manual.`, "high", "privacy", "revisao humana", "agora"));
  }

  if (needsReview.length > 0) {
    actions.push(action("review-queue", "Revisar fila sensivel", `${reviewQueue.length} item(ns) precisam de revisao de privacidade, etica ou texto.`, "high", "review", "Cadu", "agora"));
  }

  if (ready.length > 0 || manualPublishQueue.length > 0) {
    actions.push(action("publish-ready", "Executar stories seguros manualmente", `${manualPublishQueue.length} story/stories podem seguir para conferencia final e publicacao manual.`, "medium", "manual_publish", "marketing", "hoje"));
  }

  actions.push(action("capture-data", "Registrar metricas agregadas ao final do dia", "Coletar visualizacoes, respostas, cliques, visitas ao perfil e conversas agregadas sem dados pessoais.", "medium", "data_capture", "atendimento", "apos publicar"));

  return uniqueById(actions).slice(0, 5);
}

export function buildDailyBriefNextActions(board: StoryDayExecutionBoard): StoryDailyBriefAction[] {
  const boardActions = getStoryExecutionNextActions(board).slice(0, 3).map((item, index) =>
    action(`board-action-${index + 1}`, item, "Acao derivada do board diario de execucao manual.", index === 0 ? "high" : "medium", index === 0 ? "review" : "manual_publish", index === 0 ? "Cadu" : "marketing", index === 0 ? "agora" : "hoje")
  );

  return uniqueById([
    ...boardActions,
    action("after-results", "Atualizar /stories/results depois da execucao", "Registrar apenas metricas agregadas para alimentar o aprendizado da proxima semana.", "medium", "data_capture", "marketing", "apos publicar"),
    action("weekly-data", "Levar aprendizados para a Central Semanal", "Usar os resultados consolidados no fechamento semanal, sem concluir performance por um story isolado.", "low", "strategy", "Cadu", "apos publicar")
  ]);
}

export function buildDailyDataCaptureChecklist(): string[] {
  return [
    "Visualizacoes por story e total do dia.",
    "Respostas agregadas, sem nomes, DMs ou prints.",
    "Interacoes de sticker, enquetes e caixas de pergunta em volume total.",
    "Cliques de link ou CTA quando disponiveis.",
    "Visitas ao perfil apos a sequencia.",
    "Conversas de WhatsApp atribuiveis ao periodo, apenas em numero consolidado.",
    "Observacoes qualitativas sem identificacao de pessoa ou caso clinico."
  ];
}

export function buildDailyBriefGuardrails(): string[] {
  return [
    "Publicacao sempre manual; este modulo nao chama Instagram, Meta, WhatsApp ou APIs externas.",
    "Usar somente metricas agregadas e conteudo aprovado para uso institucional interno.",
    "Nao registrar nomes, DMs, prontuarios, fotos privadas, prints ou qualquer material identificavel.",
    "Nao usar antes/depois, depoimento, paciente ou resultado sem revisao etica e aprovacao manual.",
    "Nao prometer resultado, agenda, conversao, indicacao cirurgica ou desempenho de campanha.",
    "Tratar o briefing como apoio operacional interno para Dr. Cadu e equipe."
  ];
}

export function storyDailyBriefStatusLabel(status: StoryDailyBriefStatus): string {
  return {
    ready_for_manual_execution: "Pronto para execucao manual",
    needs_review: "Precisa revisao",
    blocked: "Bloqueado",
    limited_data: "Leitura limitada"
  }[status];
}

function determineDailyBriefStatus(board: StoryDayExecutionBoard): StoryDailyBriefStatus {
  if (board.totalStories === 0) return "limited_data";
  if (board.blockedCount > 0) return "blocked";
  if (board.needsReviewCount > 0) return "needs_review";
  return "ready_for_manual_execution";
}

function buildDailyBriefMainWarning(board: StoryDayExecutionBoard): string {
  if (board.blockedCount > 0) return "Nao publicar enquanto houver story bloqueado.";
  if (board.needsReviewCount > 0) return "Resolver revisoes manuais antes da publicacao.";
  if (board.readyCount > 0) return "Conferir midia, CTA e ordem antes de publicar manualmente.";
  return "Leitura operacional: validar contexto do dia antes de executar.";
}

function queueItemFromExecutionItem(item: StoryExecutionItem, reason: string): StoryDailyBriefQueueItem {
  return {
    id: item.id,
    order: item.order,
    title: `Story ${String(item.order).padStart(2, "0")} - ${storySlotTypeLabel(item.slotType)}`,
    slotTypeLabel: storySlotTypeLabel(item.slotType),
    funnelStage: item.funnelStage,
    pillar: item.pillar,
    suggestedText: item.suggestedText,
    suggestedCTA: item.cta,
    stickerSuggestion: item.stickerSuggestion,
    suggestedFilename: item.suggestedFilename || "definir manualmente",
    status: item.executionStatus,
    priority: item.priority,
    reason,
    warnings: [...item.ethicalWarnings, ...generateStoryExecutionChecklist({ items: [item], totalStories: 1 } as StoryDayExecutionBoard).filter((check) => check.warning).map((check) => check.warning)]
  };
}

function reviewReasonForItem(item: StoryExecutionItem): string {
  if (item.executionStatus === "blocked") return "Bloqueado ate revisao manual.";
  if (item.privacyRisk === "high") return "Risco alto de privacidade ou etica.";
  if (item.ethicalWarnings.length > 0) return "Possui alerta etico antes de qualquer uso.";
  return "Precisa revisao antes de publicar.";
}

function publishReasonForItem(item: StoryExecutionItem): string {
  if (item.executionStatus === "ready_for_manual_publish") return "Pronto para conferencia final e publicacao manual.";
  if (item.executionStatus === "approved") return "Aprovado, mas ainda precisa publicacao manual.";
  return "Pendente seguro para revisao operacional rapida antes de publicar.";
}

function action(
  id: string,
  title: string,
  description: string,
  priority: StoryExecutionPriority,
  type: StoryDailyBriefActionType,
  ownerSuggestion: StoryDailyBriefActionOwner,
  actionWindow: StoryDailyBriefActionWindow
): StoryDailyBriefAction {
  return { id, title, description, priority, type, ownerSuggestion, actionWindow };
}

function isoDateFromReference(reference: Date | string): string {
  if (typeof reference === "string") return reference.slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(reference);
}

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
