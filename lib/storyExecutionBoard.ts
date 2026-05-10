import type { ContentFunnelStage } from "@/lib/contentStudio";
import type { PatientPrivacyRisk, StorySlotType } from "@/lib/mediaLibrary";
import {
  buildStoryWeekExportPackage,
  type StoryDayExportPackage,
  type StoryExportSlot,
  type StoryWeekExportPackage
} from "@/lib/storyWeekExport";
import { storySlotTypeLabel, storyWeekThemeLabel, type StoryWeekDayTheme } from "@/lib/storyWeekBuilder";

export type StoryExecutionStatus = "pending" | "needs_review" | "approved" | "ready_for_manual_publish" | "manually_published" | "skipped" | "blocked";
export type StoryExecutionPriority = "low" | "medium" | "high";

export type StoryExecutionItem = {
  id: string;
  dayLabel: string;
  order: number;
  slotType: StorySlotType;
  suggestedFilename: string;
  suggestedText: string;
  stickerSuggestion: string;
  cta: string;
  funnelStage: ContentFunnelStage;
  pillar: string;
  privacyRisk: PatientPrivacyRisk;
  ethicalWarnings: string[];
  executionStatus: StoryExecutionStatus;
  priority: StoryExecutionPriority;
  manualPublishInstruction: string;
  publicationTarget: string;
  publishedUrl: string;
  publishedAt: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StoryDayExecutionBoard = {
  id: string;
  dayLabel: string;
  date: string;
  theme: StoryWeekDayTheme;
  objective: string;
  items: StoryExecutionItem[];
  totalStories: number;
  pendingCount: number;
  needsReviewCount: number;
  approvedCount: number;
  readyCount: number;
  manuallyPublishedCount: number;
  blockedCount: number;
  progressPercent: number;
  mainWarning: string;
  nextAction: string;
  status: StoryExecutionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type StoryExecutionSummary = {
  totalStories: number;
  pendingCount: number;
  needsReviewCount: number;
  approvedCount: number;
  readyCount: number;
  manuallyPublishedCount: number;
  skippedCount: number;
  blockedCount: number;
  progressPercent: number;
  ethicalReviewCount: number;
  directCtaCount: number;
  lightCtaCount: number;
  mainWarnings: string[];
  nextActions: string[];
};

export type StoryExecutionChecklistItem = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "done" | "blocked" | "not_applicable";
  isRequired: boolean;
  warning: string;
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");

export function buildStoryDayExecutionBoard(dayPackage: StoryDayExportPackage = buildStoryWeekExportPackage().dayPackages[0]): StoryDayExecutionBoard {
  const items = dayPackage.slots.map((slot) => buildStoryExecutionItem(slot));
  return createStoryDayExecutionBoardFromItems(dayPackage, items);
}

export function buildStoryExecutionItem(slot: StoryExportSlot): StoryExecutionItem {
  const executionStatus = determineInitialExecutionStatus(slot);
  return {
    id: `execution-${slot.id}`,
    dayLabel: slot.dayLabel,
    order: slot.order,
    slotType: slot.slotType,
    suggestedFilename: slot.suggestedFilename,
    suggestedText: slot.suggestedText,
    stickerSuggestion: slot.stickerSuggestion,
    cta: slot.cta,
    funnelStage: slot.funnelStage,
    pillar: slot.pillar,
    privacyRisk: slot.privacyRisk,
    ethicalWarnings: slot.ethicalWarnings,
    executionStatus,
    priority: determineExecutionPriority(slot),
    manualPublishInstruction: slot.manualInstruction || "Revisar manualmente antes de publicar.",
    publicationTarget: "Instagram Stories (publicacao manual)",
    publishedUrl: "",
    publishedAt: "",
    notes: "",
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function buildStoryExecutionBoardFromExportPackage(
  exportPackage: StoryWeekExportPackage = buildStoryWeekExportPackage(),
  dayLabel = exportPackage.dayPackages[0]?.dayLabel ?? "Segunda-feira"
): StoryDayExecutionBoard {
  const dayPackage = exportPackage.dayPackages.find((day) => day.dayLabel === dayLabel) ?? exportPackage.dayPackages[0];
  return buildStoryDayExecutionBoard(dayPackage);
}

export function summarizeStoryExecution(board: StoryDayExecutionBoard): StoryExecutionSummary {
  const items = board.items;
  return {
    totalStories: board.totalStories,
    pendingCount: getPendingStoryItems(items).length,
    needsReviewCount: getItemsNeedingReview(items).length,
    approvedCount: items.filter((item) => item.executionStatus === "approved").length,
    readyCount: getReadyToPublishItems(items).length,
    manuallyPublishedCount: getManuallyPublishedItems(items).length,
    skippedCount: items.filter((item) => item.executionStatus === "skipped").length,
    blockedCount: getBlockedStoryItems(items).length,
    progressPercent: calculateStoryExecutionProgress(items),
    ethicalReviewCount: items.filter((item) => item.ethicalWarnings.length > 0 || item.privacyRisk !== "low").length,
    directCtaCount: items.filter((item) => item.slotType === "cta_direto").length,
    lightCtaCount: items.filter((item) => item.slotType === "cta_leve").length,
    mainWarnings: getStoryExecutionWarnings(board),
    nextActions: getStoryExecutionNextActions(board)
  };
}

export function calculateStoryExecutionProgress(items: StoryExecutionItem[]): number {
  if (items.length === 0) return 0;
  return Math.round((getManuallyPublishedItems(items).length / items.length) * 100);
}

export function getPendingStoryItems(items: StoryExecutionItem[]): StoryExecutionItem[] {
  return items.filter((item) => item.executionStatus === "pending");
}

export function getItemsNeedingReview(items: StoryExecutionItem[]): StoryExecutionItem[] {
  return items.filter((item) => item.executionStatus === "needs_review");
}

export function getReadyToPublishItems(items: StoryExecutionItem[]): StoryExecutionItem[] {
  return items.filter((item) => item.executionStatus === "ready_for_manual_publish");
}

export function getManuallyPublishedItems(items: StoryExecutionItem[]): StoryExecutionItem[] {
  return items.filter((item) => item.executionStatus === "manually_published");
}

export function getBlockedStoryItems(items: StoryExecutionItem[]): StoryExecutionItem[] {
  return items.filter((item) => item.executionStatus === "blocked");
}

export function getHighPriorityExecutionItems(items: StoryExecutionItem[]): StoryExecutionItem[] {
  return items.filter((item) => item.priority === "high");
}

export function getStoryExecutionWarnings(board: StoryDayExecutionBoard): string[] {
  const warnings = [
    "Status local e simulado: nada e salvo em banco e nenhum story e publicado automaticamente.",
    "Revisar manualmente todos os itens antes da publicacao."
  ];
  const needsReview = getItemsNeedingReview(board.items).length;
  const blocked = getBlockedStoryItems(board.items).length;
  const highRisk = board.items.filter((item) => item.privacyRisk === "high").length;
  if (needsReview > 0) warnings.push(`${needsReview} story/stories precisam de revisao antes da execucao.`);
  if (blocked > 0) warnings.push(`${blocked} story/stories estao bloqueados ate aprovacao manual.`);
  if (highRisk > 0) warnings.push(`${highRisk} story/stories tem risco alto de privacidade ou etica.`);
  return unique(warnings);
}

export function getStoryExecutionNextActions(board: StoryDayExecutionBoard): string[] {
  const actions: string[] = [];
  const firstReview = getItemsNeedingReview(board.items)[0];
  const firstReady = getReadyToPublishItems(board.items)[0];
  const firstPending = getPendingStoryItems(board.items)[0];

  if (firstReview) actions.push(`Revisar Story ${firstReview.order} antes de publicar.`);
  if (firstReady) actions.push(`Publicar manualmente Story ${firstReady.order} quando a revisao final estiver ok.`);
  if (firstPending) actions.push(`Avaliar Story ${firstPending.order} e definir proximo status.`);
  actions.push("Registrar link/status depois da publicacao manual.");
  actions.push("Alimentar dados semanais depois da execucao.");
  return unique(actions);
}

export function generateStoryExecutionChecklist(board: StoryDayExecutionBoard): StoryExecutionChecklistItem[] {
  const hasRisk = board.items.some((item) => item.privacyRisk !== "low" || item.ethicalWarnings.length > 0);
  const hasMissingCta = board.items.some((item) => !item.cta);
  return [
    checklistItem("review-risk", "Revisar itens de risco", "Confirmar privacidade, consentimento e aprovacao manual.", hasRisk ? "pending" : "not_applicable", true, hasRisk ? "Ha item com alerta etico." : ""),
    checklistItem("cta", "Confirmar CTA", "Conferir se CTAs estao adequados e sem promessa de resultado.", hasMissingCta ? "blocked" : "pending", true, hasMissingCta ? "Existe story sem CTA." : ""),
    checklistItem("media", "Conferir midia final", "Garantir que a midia corresponde ao texto e ao sticker.", "pending", true, ""),
    checklistItem("manual-order", "Publicar na ordem", "Executar manualmente story por story na ordem planejada.", "pending", true, ""),
    checklistItem("link-status", "Registrar link/status", "Registrar URL, observacao ou status depois da publicacao manual.", "pending", true, ""),
    checklistItem("data", "Alimentar dados semanais", "Atualizar /data depois da execucao para manter auditoria e sinais.", "pending", false, "")
  ];
}

export function updateStoryExecutionStatus(items: StoryExecutionItem[], itemId: string, executionStatus: StoryExecutionStatus): StoryExecutionItem[] {
  return items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          executionStatus,
          publishedAt: executionStatus === "manually_published" && !item.publishedAt ? "registro local da sessao" : item.publishedAt,
          updatedAt: new Date(baseDate.getTime() + 1000)
        }
      : item
  );
}

export function updateStoryExecutionNotes(items: StoryExecutionItem[], itemId: string, notes: string): StoryExecutionItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, notes, updatedAt: new Date(baseDate.getTime() + 1000) } : item));
}

export function updateStoryPublishedUrl(items: StoryExecutionItem[], itemId: string, publishedUrl: string): StoryExecutionItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, publishedUrl, updatedAt: new Date(baseDate.getTime() + 1000) } : item));
}

export function filterStoryExecutionItemsByStatus(items: StoryExecutionItem[], status: StoryExecutionStatus): StoryExecutionItem[] {
  return items.filter((item) => item.executionStatus === status);
}

export function filterStoryExecutionItemsByPriority(items: StoryExecutionItem[], priority: StoryExecutionPriority): StoryExecutionItem[] {
  return items.filter((item) => item.priority === priority);
}

export function filterStoryExecutionItemsByDay(items: StoryExecutionItem[], dayLabel: string): StoryExecutionItem[] {
  return items.filter((item) => item.dayLabel === dayLabel);
}

export function validateStoryExecutionItem(item: StoryExecutionItem): string[] {
  const warnings: string[] = [];
  if (item.privacyRisk === "high") warnings.push("Story com risco alto precisa de revisao manual ou bloqueio.");
  if (item.ethicalWarnings.length > 0) warnings.push("Story possui alerta etico.");
  if (hasSensitiveFilename(item.suggestedFilename)) warnings.push("Arquivo pode envolver paciente, resultado, depoimento ou antes/depois.");
  if (!item.suggestedText) warnings.push("Texto ausente.");
  if (!item.manualPublishInstruction) warnings.push("Instrucao manual ausente.");
  if ((item.slotType === "cta_leve" || item.slotType === "cta_direto") && !item.cta) warnings.push("CTA ausente.");
  return unique(warnings);
}

export function validateStoryDayExecutionBoard(board: StoryDayExecutionBoard): string[] {
  const warnings = [...getStoryExecutionWarnings(board)];
  if (board.totalStories !== 10) warnings.push("Board diario deveria ter 10 stories.");
  if (getBlockedStoryItems(board.items).length > 0) warnings.push("Nao publicar enquanto houver story bloqueado.");
  if (getItemsNeedingReview(board.items).length > 0) warnings.push("Resolver itens em revisao antes de concluir o dia.");
  return unique(warnings);
}

export function createStoryDayExecutionBoardFromItems(dayPackage: StoryDayExportPackage, items: StoryExecutionItem[]): StoryDayExecutionBoard {
  const summary = countBoardItems(items);
  const progressPercent = calculateStoryExecutionProgress(items);
  const mainWarning = buildMainWarning(items);
  const status = determineBoardStatus(items);

  return {
    id: `story-execution-${dayPackage.date}`,
    dayLabel: dayPackage.dayLabel,
    date: dayPackage.date,
    theme: dayPackage.theme,
    objective: dayPackage.objective,
    items,
    totalStories: items.length,
    pendingCount: summary.pending,
    needsReviewCount: summary.needs_review,
    approvedCount: summary.approved,
    readyCount: summary.ready_for_manual_publish,
    manuallyPublishedCount: summary.manually_published,
    blockedCount: summary.blocked,
    progressPercent,
    mainWarning,
    nextAction: getNextActionFromItems(items),
    status,
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function storyExecutionStatusLabel(status: StoryExecutionStatus): string {
  return {
    pending: "Pendente",
    needs_review: "Em revisao",
    approved: "Aprovado",
    ready_for_manual_publish: "Pronto para publicacao manual",
    manually_published: "Publicado manualmente",
    skipped: "Pulado",
    blocked: "Bloqueado"
  }[status];
}

export function storyExecutionPriorityLabel(priority: StoryExecutionPriority): string {
  return {
    low: "Baixa",
    medium: "Media",
    high: "Alta"
  }[priority];
}

export function storyExecutionBoardTitle(board: StoryDayExecutionBoard): string {
  return `${board.dayLabel} - ${storyWeekThemeLabel(board.theme)}`;
}

function determineInitialExecutionStatus(slot: StoryExportSlot): StoryExecutionStatus {
  if (slot.status === "blocked") return "blocked";
  if (slot.status === "needs_review" || slot.privacyRisk !== "low" || slot.ethicalWarnings.length > 0) return "needs_review";
  if (slot.status === "ready_for_manual_publish" || slot.status === "approved") return "ready_for_manual_publish";
  return "pending";
}

function determineExecutionPriority(slot: StoryExportSlot): StoryExecutionPriority {
  if (slot.status === "blocked" || slot.privacyRisk === "high" || hasSensitiveFilename(slot.suggestedFilename)) return "high";
  if (slot.status === "needs_review" || slot.privacyRisk === "medium" || slot.ethicalWarnings.length > 0 || slot.slotType === "cta_direto") return "medium";
  return "low";
}

function determineBoardStatus(items: StoryExecutionItem[]): StoryExecutionStatus {
  if (items.some((item) => item.executionStatus === "blocked")) return "blocked";
  if (items.some((item) => item.executionStatus === "needs_review")) return "needs_review";
  if (items.length > 0 && items.every((item) => item.executionStatus === "manually_published" || item.executionStatus === "skipped")) return "manually_published";
  if (items.some((item) => item.executionStatus === "ready_for_manual_publish")) return "ready_for_manual_publish";
  return "pending";
}

function countBoardItems(items: StoryExecutionItem[]): Record<StoryExecutionStatus, number> {
  return {
    pending: items.filter((item) => item.executionStatus === "pending").length,
    needs_review: items.filter((item) => item.executionStatus === "needs_review").length,
    approved: items.filter((item) => item.executionStatus === "approved").length,
    ready_for_manual_publish: items.filter((item) => item.executionStatus === "ready_for_manual_publish").length,
    manually_published: items.filter((item) => item.executionStatus === "manually_published").length,
    skipped: items.filter((item) => item.executionStatus === "skipped").length,
    blocked: items.filter((item) => item.executionStatus === "blocked").length
  };
}

function buildMainWarning(items: StoryExecutionItem[]): string {
  const blocked = getBlockedStoryItems(items).length;
  const review = getItemsNeedingReview(items).length;
  if (blocked > 0) return "Ha stories bloqueados; nao publicar ate revisao manual.";
  if (review > 0) return "Ha stories em revisao; resolver antes da publicacao manual.";
  return "Dia pronto para execucao manual, mantendo conferencia final antes de publicar.";
}

function getNextActionFromItems(items: StoryExecutionItem[]): string {
  const firstBlocked = getBlockedStoryItems(items)[0];
  const firstReview = getItemsNeedingReview(items)[0];
  const firstReady = getReadyToPublishItems(items)[0];
  if (firstBlocked) return `Resolver bloqueio do Story ${firstBlocked.order}.`;
  if (firstReview) return `Revisar Story ${firstReview.order}.`;
  if (firstReady) return `Publicar manualmente Story ${firstReady.order}.`;
  return "Registrar resultado e alimentar dados semanais.";
}

function checklistItem(
  id: string,
  label: string,
  description: string,
  status: StoryExecutionChecklistItem["status"],
  isRequired: boolean,
  warning: string
): StoryExecutionChecklistItem {
  return { id, label, description, status, isRequired, warning };
}

function hasSensitiveFilename(filename: string): boolean {
  return /paciente|resultado|depoimento|antes-depois/i.test(filename);
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
