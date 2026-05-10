import type { ContentFunnelStage } from "@/lib/contentStudio";
import type { MediaCatalogingConfidence, MediaCatalogingSuggestion } from "@/lib/mediaCataloging";
import type { MediaAsset, StorySlotType } from "@/lib/mediaLibrary";

export type CatalogStorySlotMatch = {
  id: string;
  suggestionId: string;
  filename: string;
  slotType: StorySlotType;
  matchReason: string;
  confidence: MediaCatalogingConfidence;
  warnings: string[];
  createdAt: Date;
};

export type StorySlotRecommendation = {
  id: string;
  slotType: StorySlotType;
  suggestedFilename: string;
  suggestedText: string;
  suggestedCTA: string;
  suggestedSticker: string;
  funnelStage: ContentFunnelStage;
  pillar: string;
  confidence: MediaCatalogingConfidence;
  reason: string;
  warnings: string[];
};

export type CatalogDailyStoryPlanDraft = {
  id: string;
  date: string;
  dayLabel: string;
  theme: string;
  objective: string;
  slots: StorySlotRecommendation[];
  totalStories: number;
  sourceManifestLabel: string;
  warnings: string[];
  createdAt: Date;
};

export type CatalogWeeklyStoryPlanDraft = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  dailyPlans: CatalogDailyStoryPlanDraft[];
  totalStories: number;
  averageStoriesPerDay: number;
  daysBelowTarget: string[];
  warnings: string[];
  createdAt: Date;
};

export type CatalogPlanningSummary = {
  totalSuggestions: number;
  usableSuggestions: number;
  blockedSuggestions: number;
  needsReviewSuggestions: number;
  matchedSlots: number;
  unmatchedSlots: number;
  privacyRiskItems: number;
  dailyStoriesPlanned: number;
  weeklyStoriesPlanned: number;
  mainWarnings: string[];
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");
const targetStoriesPerDay = 10;

const dailySlotOrder: StorySlotType[] = [
  "human_bastidor",
  "rotina_medica",
  "autoridade",
  "duvida_frequente",
  "quebra_de_mito",
  "prova_confianca",
  "procedimento",
  "maternidade_naturalidade",
  "cta_leve",
  "cta_direto"
];

const weekDays = [
  { date: "2026-05-11", label: "Segunda-feira", theme: "Mamas, bastidores e segurança" },
  { date: "2026-05-12", label: "Terça-feira", theme: "Lipoaspiração e contorno corporal" },
  { date: "2026-05-13", label: "Quarta-feira", theme: "Mamoplastia redutora e dúvidas frequentes" },
  { date: "2026-05-14", label: "Quinta-feira", theme: "Maternidade, naturalidade e acolhimento" },
  { date: "2026-05-15", label: "Sexta-feira", theme: "Autoridade, prova de confiança e CTA" },
  { date: "2026-05-16", label: "Sábado", theme: "Naturalidade e conteúdo leve" },
  { date: "2026-05-17", label: "Domingo", theme: "Bastidores, rotina e agenda da semana" }
];

const slotKeywordHints: Record<StorySlotType, string[]> = {
  human_bastidor: ["bastidor", "bastidores", "rotina", "equipe", "consultorio", "familia", "humanizado"],
  rotina_medica: ["rotina", "clinica", "consultorio", "centro-cirurgico", "pos-operatorio"],
  autoridade: ["autoridade", "aula", "cirurgia", "seguranca", "checklist"],
  duvida_frequente: ["duvida", "frequente", "mamas", "protese", "lipo", "mamoplastia"],
  quebra_de_mito: ["nao-emagrece", "ml", "exagero", "mito", "verdade"],
  prova_confianca: ["autoridade", "checklist", "seguranca", "depoimento", "resultado", "paciente", "antes-depois"],
  procedimento: ["protese", "silicone", "mamoplastia", "redutora", "lipoaspiracao", "contorno", "lipo"],
  maternidade_naturalidade: ["maternidade", "pos-gestacao", "naturalidade", "familia"],
  cta_leve: ["cta", "avaliacao", "consulta", "agenda", "duvida"],
  cta_direto: ["cta", "avaliacao", "consulta", "agenda"]
};

const slotText: Record<StorySlotType, Pick<StorySlotRecommendation, "suggestedText" | "suggestedCTA" | "suggestedSticker" | "funnelStage">> = {
  human_bastidor: {
    suggestedText: "Abrir o dia com bastidor humano e contexto da rotina.",
    suggestedCTA: "Acompanhe a sequência de hoje.",
    suggestedSticker: "Caixinha: o que você quer ver nos bastidores?",
    funnelStage: "TOFU"
  },
  rotina_medica: {
    suggestedText: "Mostrar a rotina médica sem expor pacientes ou dados sensíveis.",
    suggestedCTA: "Envie uma dúvida geral sobre preparação.",
    suggestedSticker: "Enquete: você sabia dessa etapa?",
    funnelStage: "TOFU"
  },
  autoridade: {
    suggestedText: "Reforçar critério técnico, segurança e tomada de decisão responsável.",
    suggestedCTA: "Salve para rever antes da consulta.",
    suggestedSticker: "Quiz rápido.",
    funnelStage: "MOFU"
  },
  duvida_frequente: {
    suggestedText: "Responder uma dúvida comum com linguagem educativa.",
    suggestedCTA: "Mande uma dúvida geral para próximos stories.",
    suggestedSticker: "Caixinha de perguntas.",
    funnelStage: "MOFU"
  },
  quebra_de_mito: {
    suggestedText: "Corrigir uma crença simplificada sem tom alarmista.",
    suggestedCTA: "Compartilhe com quem está pesquisando o tema.",
    suggestedSticker: "Mito ou verdade.",
    funnelStage: "TOFU"
  },
  prova_confianca: {
    suggestedText: "Construir confiança com segurança, acompanhamento e contexto.",
    suggestedCTA: "Salve para lembrar do acompanhamento.",
    suggestedSticker: "Slider de confiança.",
    funnelStage: "BOFU"
  },
  procedimento: {
    suggestedText: "Conectar o tema do dia ao procedimento principal com foco em indicação.",
    suggestedCTA: "Leve essa pergunta para sua avaliação.",
    suggestedSticker: "Pergunta: você já pesquisou sobre isso?",
    funnelStage: "MOFU"
  },
  maternidade_naturalidade: {
    suggestedText: "Trazer acolhimento, naturalidade e respeito à identidade.",
    suggestedCTA: "Envie para alguém que valoriza esse cuidado.",
    suggestedSticker: "Enquete sobre naturalidade.",
    funnelStage: "TOFU"
  },
  cta_leve: {
    suggestedText: "Abrir conversa sem pressão comercial.",
    suggestedCTA: "Responder o story com a palavra dúvida.",
    suggestedSticker: "Caixa de interesse.",
    funnelStage: "MOFU"
  },
  cta_direto: {
    suggestedText: "Direcionar interessadas para avaliação com segurança.",
    suggestedCTA: "Chamar no WhatsApp para agendar avaliação.",
    suggestedSticker: "Link para WhatsApp.",
    funnelStage: "BOFU"
  }
};

export function matchSuggestionToStorySlot(suggestion: MediaCatalogingSuggestion, slotType: StorySlotType): CatalogStorySlotMatch | null {
  const score = scoreSuggestionForSlot(suggestion, slotType);
  if (score === 0) return null;

  const warnings = buildMatchWarnings(suggestion);
  return {
    id: `${suggestion.id}-${slotType}-match`,
    suggestionId: suggestion.id,
    filename: suggestion.filename,
    slotType,
    matchReason: `Combina com ${slotKeywordHints[slotType].filter((keyword) => suggestionKeywords(suggestion).includes(keyword)).join(", ") || suggestion.suggestedPillar}.`,
    confidence: score >= 3 ? "high" : score >= 2 ? "medium" : "low",
    warnings,
    createdAt: baseDate
  };
}

export function buildStorySlotRecommendationsFromSuggestions(suggestions: MediaCatalogingSuggestion[]): StorySlotRecommendation[] {
  return dailySlotOrder.map((slotType, index) => buildRecommendationForSlot(slotType, suggestions, index));
}

export function buildDailyStoryPlanFromCatalog(
  suggestions: MediaCatalogingSuggestion[],
  date = "2026-05-11",
  dayLabel = "Segunda-feira",
  theme = "Plano diário a partir do acervo catalogado",
  sourceManifestLabel = "Manifesto colado"
): CatalogDailyStoryPlanDraft {
  const slots = buildStorySlotRecommendationsFromSuggestions(suggestions);
  const warnings = getCatalogPlanningWarnings(suggestions, slots);

  return {
    id: `catalog-daily-plan-${date}`,
    date,
    dayLabel,
    theme,
    objective: "Preencher 10 stories com mídias catalogadas, preservando revisão humana e checklist ético.",
    slots,
    totalStories: slots.length,
    sourceManifestLabel,
    warnings,
    createdAt: baseDate
  };
}

export function buildWeeklyStoryPlanFromCatalog(suggestions: MediaCatalogingSuggestion[]): CatalogWeeklyStoryPlanDraft {
  const dailyPlans = weekDays.map((day) => buildDailyStoryPlanFromCatalog(suggestions, day.date, day.label, day.theme, "Manifesto colado"));
  const totalStories = dailyPlans.reduce((total, plan) => total + plan.totalStories, 0);
  const averageStoriesPerDay = dailyPlans.length === 0 ? 0 : Math.round((totalStories / dailyPlans.length) * 10) / 10;
  const daysBelowTarget = dailyPlans.filter((plan) => plan.totalStories < targetStoriesPerDay).map((plan) => plan.dayLabel);
  const reuseWarning = getUsableSuggestions(suggestions).length < totalStories ? ["Poucas mídias utilizáveis para a semana; haverá reutilização e revisão manual deve ser reforçada."] : [];

  return {
    id: "catalog-weekly-plan-2026-05-11",
    weekLabel: "Semana de 11/05 a 17/05",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    dailyPlans,
    totalStories,
    averageStoriesPerDay,
    daysBelowTarget,
    warnings: unique([...dailyPlans.flatMap((plan) => plan.warnings), ...reuseWarning]),
    createdAt: baseDate
  };
}

export function summarizeCatalogPlanning(
  suggestions: MediaCatalogingSuggestion[],
  dailyPlan: CatalogDailyStoryPlanDraft = buildDailyStoryPlanFromCatalog(suggestions),
  weeklyPlan: CatalogWeeklyStoryPlanDraft = buildWeeklyStoryPlanFromCatalog(suggestions)
): CatalogPlanningSummary {
  const usable = getUsableSuggestions(suggestions);
  const unmatchedSlots = getUnmatchedStorySlots(dailyPlan.slots);

  return {
    totalSuggestions: suggestions.length,
    usableSuggestions: usable.length,
    blockedSuggestions: suggestions.filter((suggestion) => suggestion.status === "blocked").length,
    needsReviewSuggestions: suggestions.filter((suggestion) => suggestion.status === "needs_review").length,
    matchedSlots: dailyPlan.slots.length - unmatchedSlots.length,
    unmatchedSlots: unmatchedSlots.length,
    privacyRiskItems: getHighRiskCatalogSuggestions(suggestions).length,
    dailyStoriesPlanned: dailyPlan.totalStories,
    weeklyStoriesPlanned: weeklyPlan.totalStories,
    mainWarnings: unique([...dailyPlan.warnings, ...weeklyPlan.warnings]).slice(0, 6)
  };
}

export function getUnmatchedStorySlots(slots: StorySlotRecommendation[]): StorySlotRecommendation[] {
  return slots.filter((slot) => !slot.suggestedFilename);
}

export function getHighRiskCatalogSuggestions(suggestions: MediaCatalogingSuggestion[]): MediaCatalogingSuggestion[] {
  return suggestions.filter((suggestion) => suggestion.suggestedPrivacyRisk === "high");
}

export function getCatalogPlanningWarnings(suggestions: MediaCatalogingSuggestion[], slots: StorySlotRecommendation[] = buildStorySlotRecommendationsFromSuggestions(suggestions)): string[] {
  const warnings: string[] = ["Plano gerado automaticamente a partir do manifesto; exige revisão humana antes de qualquer publicação."];
  const unmatchedSlots = getUnmatchedStorySlots(slots);
  const highRisk = getHighRiskCatalogSuggestions(suggestions);
  const balance = balanceStoryPlanByFunnelStage(slots);

  if (unmatchedSlots.length > 0) warnings.push(`${unmatchedSlots.length} slot(s) sem mídia adequada no catálogo.`);
  if (highRisk.length > 0) warnings.push(`${highRisk.length} item(ns) com risco ético/privacidade exigem revisão manual.`);
  if (getUsableSuggestions(suggestions).length < slots.length) warnings.push("Poucas mídias utilizáveis para preencher os 10 stories sem reutilização.");
  warnings.push(...balance.warnings);

  return unique(warnings);
}

export function selectBestSuggestionForSlot(suggestions: MediaCatalogingSuggestion[], slotType: StorySlotType, usedSuggestionIds: string[] = []): MediaCatalogingSuggestion | null {
  const usable = getUsableSuggestions(suggestions);
  const sorted = usable
    .map((suggestion) => ({
      suggestion,
      score: scoreSuggestionForSlot(suggestion, slotType) - (usedSuggestionIds.includes(suggestion.id) ? 1 : 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || confidenceValue(b.suggestion.confidence) - confidenceValue(a.suggestion.confidence));

  return sorted[0]?.suggestion ?? null;
}

export function convertCatalogSuggestionToStoryMediaAsset(suggestion: MediaCatalogingSuggestion): MediaAsset {
  return {
    id: `story-plan-${suggestion.id}`,
    filename: suggestion.filename,
    displayName: suggestion.displayName,
    filePath: `/simulado/story-plan/${suggestion.filename}`,
    assetType: suggestion.suggestedAssetType === "unknown" ? "document" : suggestion.suggestedAssetType,
    orientation: suggestion.suggestedOrientation,
    source: "Catalogação assistida para plano de stories",
    theme: suggestion.suggestedTheme,
    pillar: suggestion.suggestedPillar,
    funnelStage: suggestion.suggestedFunnelStage,
    suggestedUse: suggestion.suggestedUse,
    description: suggestion.suggestedDescription,
    tags: suggestion.suggestedTags,
    usageStatus: suggestion.suggestedPrivacyRisk === "high" ? "planned" : "unused",
    approvalStatus: suggestion.suggestedPrivacyRisk === "high" ? "needs_adjustment" : suggestion.suggestedApprovalStatus,
    ethicalNotes: buildMatchWarnings(suggestion).join(" ") || "Revisar antes de usar em stories.",
    patientPrivacyRisk: suggestion.suggestedPrivacyRisk,
    createdAt: suggestion.createdAt,
    updatedAt: suggestion.updatedAt
  };
}

export function groupSuggestionsByPillar(suggestions: MediaCatalogingSuggestion[]): Record<string, MediaCatalogingSuggestion[]> {
  return suggestions.reduce<Record<string, MediaCatalogingSuggestion[]>>((acc, suggestion) => {
    acc[suggestion.suggestedPillar] = [...(acc[suggestion.suggestedPillar] ?? []), suggestion];
    return acc;
  }, {});
}

export function balanceStoryPlanByFunnelStage(slots: StorySlotRecommendation[]): { counts: Record<ContentFunnelStage, number>; balanced: boolean; warnings: string[] } {
  const counts: Record<ContentFunnelStage, number> = {
    TOFU: slots.filter((slot) => slot.funnelStage === "TOFU").length,
    MOFU: slots.filter((slot) => slot.funnelStage === "MOFU").length,
    BOFU: slots.filter((slot) => slot.funnelStage === "BOFU").length
  };
  const warnings: string[] = [];
  const unmatchedSlots = getUnmatchedStorySlots(slots).length;
  if (counts.TOFU > counts.MOFU + counts.BOFU) warnings.push("Plano com excesso de TOFU; adicionar mais MOFU/BOFU antes de publicar.");
  if (counts.MOFU === 0) warnings.push("Plano sem meio de funil; incluir educação técnica antes de publicar.");
  if (counts.BOFU === 0) warnings.push("Plano sem fundo de funil; incluir CTA ou conteúdo de avaliação.");
  if (unmatchedSlots > 0) warnings.push(`${unmatchedSlots} slot(s) sem mídia adequada; revisar manualmente antes de usar o plano.`);
  return { counts, balanced: warnings.length === 0, warnings };
}

function buildRecommendationForSlot(slotType: StorySlotType, suggestions: MediaCatalogingSuggestion[], index: number): StorySlotRecommendation {
  const usedIds = dailySlotOrder.slice(0, index).map((previousSlot) => selectBestSuggestionForSlot(suggestions, previousSlot)?.id ?? "");
  const bestSuggestion = selectBestSuggestionForSlot(suggestions, slotType, usedIds);
  const slotDefaults = slotText[slotType];
  if (!bestSuggestion) {
    return {
      id: `story-slot-${index + 1}-${slotType}`,
      slotType,
      suggestedFilename: "",
      suggestedText: slotDefaults.suggestedText,
      suggestedCTA: slotDefaults.suggestedCTA,
      suggestedSticker: slotDefaults.suggestedSticker,
      funnelStage: slotDefaults.funnelStage,
      pillar: "A revisar",
      confidence: "low",
      reason: "Nenhuma mídia adequada foi encontrada para este slot.",
      warnings: ["Slot sem mídia adequada no catálogo; preencher manualmente."]
    };
  }

  const match = matchSuggestionToStorySlot(bestSuggestion, slotType);
  return {
    id: `story-slot-${index + 1}-${slotType}`,
    slotType,
    suggestedFilename: bestSuggestion.filename,
    suggestedText: slotDefaults.suggestedText,
    suggestedCTA: slotDefaults.suggestedCTA,
    suggestedSticker: slotDefaults.suggestedSticker,
    funnelStage: bestSuggestion.suggestedFunnelStage,
    pillar: bestSuggestion.suggestedPillar,
    confidence: match?.confidence ?? bestSuggestion.confidence,
    reason: match?.matchReason ?? "Sugestão selecionada por proximidade temática.",
    warnings: match?.warnings ?? buildMatchWarnings(bestSuggestion)
  };
}

function scoreSuggestionForSlot(suggestion: MediaCatalogingSuggestion, slotType: StorySlotType): number {
  const keywords = suggestionKeywords(suggestion);
  const keywordScore = slotKeywordHints[slotType].filter((keyword) => keywords.includes(keyword)).length;
  const useScore = suggestion.suggestedUse === "stories" || suggestion.suggestedUse === "all" ? 1 : 0;
  const riskPenalty = suggestion.suggestedPrivacyRisk === "high" ? 1 : 0;
  return Math.max(0, keywordScore + useScore - riskPenalty);
}

function suggestionKeywords(suggestion: MediaCatalogingSuggestion): string[] {
  return unique([...suggestion.suggestedTags, ...suggestion.filename.toLowerCase().split(/[-_.]+/)]);
}

function buildMatchWarnings(suggestion: MediaCatalogingSuggestion): string[] {
  const warnings: string[] = [];
  if (suggestion.suggestedPrivacyRisk === "high") warnings.push("Revisão ética obrigatória antes de usar em stories.");
  if (suggestion.status === "blocked") warnings.push("Item bloqueado; não usar automaticamente.");
  if (suggestion.status === "needs_review") warnings.push("Item precisa de revisão manual antes do uso.");
  if (["paciente", "resultado", "antes-depois", "depoimento"].some((keyword) => suggestionKeywords(suggestion).includes(keyword))) {
    warnings.push("Possível paciente, resultado, depoimento ou antes/depois; não aprovar automaticamente.");
  }
  return unique(warnings);
}

function getUsableSuggestions(suggestions: MediaCatalogingSuggestion[]): MediaCatalogingSuggestion[] {
  return suggestions.filter((suggestion) => suggestion.status !== "blocked" && suggestion.suggestedAssetType !== "unknown");
}

function confidenceValue(confidence: MediaCatalogingConfidence): number {
  return { low: 1, medium: 2, high: 3 }[confidence];
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
