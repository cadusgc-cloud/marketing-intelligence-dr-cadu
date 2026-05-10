import type { ContentFunnelStage } from "@/lib/contentStudio";
import type { PatientPrivacyRisk, StorySlotType } from "@/lib/mediaLibrary";
import {
  buildStoryWeekPlanFromCatalog,
  generateCTAForSlot,
  storySlotTypeLabel,
  storyWeekThemeLabel,
  type StoryWeekDay,
  type StoryWeekDayTheme,
  type StoryWeekPlan,
  type StoryWeekSlot
} from "@/lib/storyWeekBuilder";

export type StoryExportStatus = "draft" | "needs_review" | "approved" | "ready_for_manual_publish" | "exported" | "blocked";
export type StoryExportFormat = "copy_ready" | "markdown" | "checklist" | "platform_brief" | "full_week";

export type StoryExportSlot = {
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
  status: StoryExportStatus;
  copyReadyText: string;
  manualInstruction: string;
  createdAt: Date;
};

export type StoryPublicationChecklistItem = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "done" | "blocked" | "not_applicable";
  isRequired: boolean;
  warning: string;
};

export type StoryDayExportPackage = {
  id: string;
  dayLabel: string;
  date: string;
  theme: StoryWeekDayTheme;
  objective: string;
  totalStories: number;
  slots: StoryExportSlot[];
  copyReadySequence: string;
  markdownBrief: string;
  ethicalWarnings: string[];
  publicationChecklist: StoryPublicationChecklistItem[];
  status: StoryExportStatus;
  createdAt: Date;
};

export type StoryWeekExportPackage = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  dayPackages: StoryDayExportPackage[];
  totalStories: number;
  totalWarnings: number;
  totalNeedsReview: number;
  totalReadyForManualPublish: number;
  fullWeekCopyReadyText: string;
  fullWeekMarkdownBrief: string;
  operationalChecklist: StoryPublicationChecklistItem[];
  status: StoryExportStatus;
  createdAt: Date;
};

export type StoryExportSummary = {
  totalStories: number;
  totalDays: number;
  readyDays: number;
  daysNeedingReview: number;
  blockedItems: number;
  ethicalWarningItems: number;
  directCtas: number;
  lightCtas: number;
  exportableItems: number;
  mainWarnings: string[];
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");

export function buildStoryWeekExportPackage(plan: StoryWeekPlan = buildStoryWeekPlanFromCatalog()): StoryWeekExportPackage {
  const dayPackages = plan.days.map((day) => buildStoryDayExportPackage(day));
  const allSlots = dayPackages.flatMap((day) => day.slots);
  const operationalChecklist = getStoryExportOperationalChecklist(dayPackages);
  const status = determineWeekStatus(dayPackages);

  return {
    id: `story-week-export-${plan.startDate}`,
    weekLabel: plan.weekLabel,
    startDate: plan.startDate,
    endDate: plan.endDate,
    dayPackages,
    totalStories: allSlots.length,
    totalWarnings: dayPackages.reduce((total, day) => total + day.ethicalWarnings.length, 0),
    totalNeedsReview: allSlots.filter((slot) => slot.status === "needs_review").length,
    totalReadyForManualPublish: allSlots.filter((slot) => slot.status === "ready_for_manual_publish").length,
    fullWeekCopyReadyText: generateFullWeekCopyReadyText(dayPackages),
    fullWeekMarkdownBrief: generateFullWeekMarkdownBrief(dayPackages),
    operationalChecklist,
    status,
    createdAt: baseDate
  };
}

export function buildStoryDayExportPackage(day: StoryWeekDay): StoryDayExportPackage {
  const slots = day.slots.map((slot) => buildStoryExportSlot(slot));
  const ethicalWarnings = unique(slots.flatMap((slot) => slot.ethicalWarnings));
  const publicationChecklist = generateStoryPublicationChecklist(slots);
  const status = determineDayStatus(slots);

  return {
    id: `story-day-export-${day.date}`,
    dayLabel: day.dayLabel,
    date: day.date,
    theme: day.theme,
    objective: day.objective,
    totalStories: slots.length,
    slots,
    copyReadySequence: generateStoryDayCopyReadySequence(slots),
    markdownBrief: generateStoryDayMarkdownBrief(day, slots, publicationChecklist),
    ethicalWarnings,
    publicationChecklist,
    status,
    createdAt: baseDate
  };
}

export function buildStoryExportSlot(slot: StoryWeekSlot): StoryExportSlot {
  const ethicalWarnings = unique([...slot.ethicalWarnings, ...getSlotExportWarnings(slot)]);
  const status = determineSlotStatus(slot, ethicalWarnings);
  const exportSlot: StoryExportSlot = {
    id: `story-export-${slot.id}`,
    dayLabel: slot.dayLabel,
    order: slot.order,
    slotType: slot.slotType,
    suggestedFilename: slot.suggestedFilename,
    suggestedText: slot.suggestedText,
    stickerSuggestion: slot.stickerSuggestion,
    cta: slot.cta || generateCTAForSlot(slot.slotType),
    funnelStage: slot.funnelStage,
    pillar: slot.pillar,
    privacyRisk: slot.privacyRisk,
    ethicalWarnings,
    status,
    copyReadyText: "",
    manualInstruction: buildManualInstruction(status),
    createdAt: baseDate
  };

  return {
    ...exportSlot,
    copyReadyText: generateStorySlotCopyReadyText(exportSlot)
  };
}

export function generateStorySlotCopyReadyText(slot: StoryExportSlot): string {
  return [
    `Story ${String(slot.order).padStart(2, "0")} — ${storySlotTypeLabel(slot.slotType)}`,
    `Arquivo sugerido: ${slot.suggestedFilename || "definir manualmente"}`,
    `Texto: ${slot.suggestedText || "revisar texto antes de publicar"}`,
    `Sticker: ${slot.stickerSuggestion || "definir sticker manualmente"}`,
    `CTA: ${slot.cta || "definir CTA manualmente"}`,
    `Status: ${storyExportStatusLabel(slot.status)}`,
    `Instrucao manual: ${slot.manualInstruction}`
  ].join("\n");
}

export function generateStoryDayCopyReadySequence(slots: StoryExportSlot[]): string {
  return slots.map((slot) => slot.copyReadyText).join("\n\n");
}

export function generateStoryDayMarkdownBrief(day: StoryWeekDay, slots: StoryExportSlot[], checklist: StoryPublicationChecklistItem[] = generateStoryPublicationChecklist(slots)): string {
  return [
    `# ${day.dayLabel} — ${storyWeekThemeLabel(day.theme)}`,
    "",
    "## Objetivo",
    day.objective,
    "",
    "## Sequencia de stories",
    "",
    ...slots.flatMap((slot) => [
      `### Story ${String(slot.order).padStart(2, "0")} — ${storySlotTypeLabel(slot.slotType)}`,
      `- Arquivo: ${slot.suggestedFilename || "definir manualmente"}`,
      `- Texto: ${slot.suggestedText}`,
      `- Sticker: ${slot.stickerSuggestion}`,
      `- CTA: ${slot.cta}`,
      `- Atencao etica: ${slot.ethicalWarnings.length > 0 ? slot.ethicalWarnings.join(" ") : "revisar antes de publicar"}`,
      ""
    ]),
    "## Checklist antes de publicar",
    "",
    ...checklist.map((item) => `- [ ] ${item.label}: ${item.description}`)
  ].join("\n");
}

export function generateFullWeekCopyReadyText(dayPackages: StoryDayExportPackage[]): string {
  return dayPackages.map((day) => `${day.dayLabel} — ${storyWeekThemeLabel(day.theme)}\n\n${day.copyReadySequence}`).join("\n\n---\n\n");
}

export function generateFullWeekMarkdownBrief(dayPackages: StoryDayExportPackage[]): string {
  return [
    "# Semana de Stories — Pacote de Exportacao",
    "",
    "Nenhum story e publicado automaticamente. Revisar, aprovar e executar manualmente.",
    "",
    ...dayPackages.map((day) => day.markdownBrief)
  ].join("\n\n");
}

export function generateStoryPublicationChecklist(slots: StoryExportSlot[] = []): StoryPublicationChecklistItem[] {
  const hasEthicalRisk = slots.some((slot) => slot.ethicalWarnings.length > 0 || slot.privacyRisk !== "low");
  const hasMissingCta = slots.some((slot) => !slot.cta);

  return [
    checklistItem("review-risk", "Revisar arquivos com paciente/resultado/depoimento", "Checar contexto, consentimento, privacidade e aprovacao manual.", hasEthicalRisk ? "pending" : "not_applicable", true, hasEthicalRisk ? "Ha item de risco no pacote." : ""),
    checklistItem("cta", "Conferir CTAs", "Validar se todos os CTAs sao adequados e sem promessa de resultado.", hasMissingCta ? "blocked" : "pending", true, hasMissingCta ? "Ha story sem CTA." : ""),
    checklistItem("promise", "Confirmar que nao ha promessa de resultado", "Revisar texto, imagem e contexto antes de publicar.", "pending", true, ""),
    checklistItem("price", "Confirmar que nao ha preco ou promocao", "Evitar ofertas, descontos e linguagem promocional irregular.", "pending", true, ""),
    checklistItem("media", "Confirmar midia final", "Verificar se a midia final corresponde ao texto, sticker e CTA.", "pending", true, ""),
    checklistItem("manual-order", "Publicar manualmente na ordem correta", "Usar Meta Business Suite ou Instagram de forma manual.", "pending", true, ""),
    checklistItem("result", "Registrar links/status apos publicacao", "Registrar data, status e resultado para alimentar os dados semanais.", "pending", true, "")
  ];
}

export function summarizeStoryWeekExport(pkg: StoryWeekExportPackage): StoryExportSummary {
  const slots = pkg.dayPackages.flatMap((day) => day.slots);
  return {
    totalStories: pkg.totalStories,
    totalDays: pkg.dayPackages.length,
    readyDays: getStoryExportReadyDays(pkg).length,
    daysNeedingReview: getStoryExportDaysNeedingReview(pkg).length,
    blockedItems: getStoryExportBlockedItems(pkg).length,
    ethicalWarningItems: getStoryExportEthicalItems(pkg).length,
    directCtas: slots.filter((slot) => slot.slotType === "cta_direto").length,
    lightCtas: slots.filter((slot) => slot.slotType === "cta_leve").length,
    exportableItems: slots.filter((slot) => slot.status === "ready_for_manual_publish").length,
    mainWarnings: getStoryExportWarnings(pkg).slice(0, 8)
  };
}

export function getStoryExportWarnings(pkg: StoryWeekExportPackage): string[] {
  const warnings = [
    "Exportacao simulada: nenhuma publicacao real foi enviada.",
    "Revisar manualmente antes de publicar.",
    "Confirmar midia final antes de executar a sequencia.",
    "Publicar manualmente e registrar resultado depois."
  ];
  const ethicalItems = getStoryExportEthicalItems(pkg);
  const blockedItems = getStoryExportBlockedItems(pkg);
  if (ethicalItems.length > 0) warnings.push(`${ethicalItems.length} story/stories exigem revisao etica antes do uso.`);
  if (blockedItems.length > 0) warnings.push(`${blockedItems.length} story/stories estao bloqueados ate aprovacao manual.`);
  return unique(warnings);
}

export function getStoryExportReadyDays(pkg: StoryWeekExportPackage): StoryDayExportPackage[] {
  return pkg.dayPackages.filter((day) => day.status === "ready_for_manual_publish" || day.status === "approved");
}

export function getStoryExportDaysNeedingReview(pkg: StoryWeekExportPackage): StoryDayExportPackage[] {
  return pkg.dayPackages.filter((day) => day.status === "needs_review" || day.slots.some((slot) => slot.status === "needs_review"));
}

export function getStoryExportBlockedItems(pkg: StoryWeekExportPackage): StoryExportSlot[] {
  return pkg.dayPackages.flatMap((day) => day.slots).filter((slot) => slot.status === "blocked");
}

export function getStoryExportEthicalItems(pkg: StoryWeekExportPackage): StoryExportSlot[] {
  return pkg.dayPackages
    .flatMap((day) => day.slots)
    .filter((slot) => slot.ethicalWarnings.length > 0 || slot.privacyRisk === "high" || hasSensitiveFilename(slot.suggestedFilename));
}

export function getStoryExportOperationalChecklist(dayPackages: StoryDayExportPackage[]): StoryPublicationChecklistItem[] {
  return generateStoryPublicationChecklist(dayPackages.flatMap((day) => day.slots));
}

export function validateStoryExportPackage(pkg: StoryWeekExportPackage): string[] {
  const warnings = getStoryExportWarnings(pkg);
  if (pkg.dayPackages.length !== 7) warnings.push("Pacote semanal deve conter 7 dias.");
  if (pkg.totalStories < 70) warnings.push("Pacote semanal abaixo de 70 stories.");
  if (getStoryExportBlockedItems(pkg).length > 0) warnings.push("Ha itens bloqueados; nao publicar ate revisao manual.");
  if (pkg.operationalChecklist.some((item) => item.status === "blocked")) warnings.push("Checklist operacional possui item bloqueado.");
  return unique(warnings);
}

export function filterStoryExportSlotsByStatus(slots: StoryExportSlot[], status: StoryExportStatus): StoryExportSlot[] {
  return slots.filter((slot) => slot.status === status);
}

export function filterStoryExportSlotsByDay(slots: StoryExportSlot[], dayLabel: string): StoryExportSlot[] {
  return slots.filter((slot) => slot.dayLabel === dayLabel);
}

export function storyExportStatusLabel(status: StoryExportStatus): string {
  return {
    draft: "Rascunho",
    needs_review: "Precisa revisao",
    approved: "Aprovado",
    ready_for_manual_publish: "Pronto para publicacao manual",
    exported: "Exportado",
    blocked: "Bloqueado"
  }[status];
}

function determineSlotStatus(slot: StoryWeekSlot, ethicalWarnings: string[]): StoryExportStatus {
  if (hasBlockedRisk(slot, ethicalWarnings)) return "blocked";
  if (ethicalWarnings.length > 0 || slot.privacyRisk !== "low" || !slot.suggestedText || !slot.cta) return "needs_review";
  if (slot.status === "planned" || slot.status === "approved" || slot.status === "ready_to_publish") return "ready_for_manual_publish";
  return "needs_review";
}

function determineDayStatus(slots: StoryExportSlot[]): StoryExportStatus {
  const blocked = slots.filter((slot) => slot.status === "blocked").length;
  const needsReview = slots.filter((slot) => slot.status === "needs_review").length;
  const ready = slots.filter((slot) => slot.status === "ready_for_manual_publish").length;
  if (blocked > 0) return "blocked";
  if (needsReview > 0) return "needs_review";
  return ready >= 8 ? "ready_for_manual_publish" : "draft";
}

function determineWeekStatus(dayPackages: StoryDayExportPackage[]): StoryExportStatus {
  if (dayPackages.some((day) => day.status === "blocked")) return "blocked";
  if (dayPackages.some((day) => day.status === "needs_review")) return "needs_review";
  return "ready_for_manual_publish";
}

function getSlotExportWarnings(slot: StoryWeekSlot): string[] {
  const warnings: string[] = [];
  if (slot.privacyRisk !== "low") warnings.push("Revisar privacidade e aprovacao antes de publicar.");
  if (hasSensitiveFilename(slot.suggestedFilename)) warnings.push("Possivel paciente, resultado, depoimento ou antes/depois; exige revisao etica.");
  if (!slot.cta && (slot.slotType === "cta_leve" || slot.slotType === "cta_direto")) warnings.push("CTA obrigatorio ausente.");
  if (!slot.suggestedText) warnings.push("Texto sugerido ausente.");
  return warnings;
}

function hasBlockedRisk(slot: StoryWeekSlot, ethicalWarnings: string[]): boolean {
  const text = `${slot.suggestedFilename} ${ethicalWarnings.join(" ")}`.toLowerCase();
  return slot.privacyRisk === "high" && (text.includes("antes-depois") || text.includes("bloqueado") || text.includes("promessa"));
}

function hasSensitiveFilename(filename: string): boolean {
  return /paciente|resultado|antes-depois|depoimento/i.test(filename);
}

function buildManualInstruction(status: StoryExportStatus): string {
  if (status === "blocked") return "Nao publicar; revisar etica, privacidade e aprovacao manual.";
  if (status === "needs_review") return "Revisar manualmente antes de copiar para publicacao.";
  return "Copiar manualmente para a plataforma somente apos conferencia final.";
}

function checklistItem(
  id: string,
  label: string,
  description: string,
  status: StoryPublicationChecklistItem["status"],
  isRequired: boolean,
  warning: string
): StoryPublicationChecklistItem {
  return { id, label, description, status, isRequired, warning };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
