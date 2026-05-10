import type { ContentFunnelStage } from "@/lib/contentStudio";
import type { StorySlotType } from "@/lib/mediaLibrary";
import { storySlotTypeLabel } from "@/lib/storyWeekBuilder";
import {
  buildStoryLearningItems,
  buildWeeklyStoryLearningSummary,
  filterStoryLearningItemsBySignal,
  getStoriesToAvoidRepeating,
  getStoryLearningMainWarnings,
  getStoryReuseCandidates,
  type NextWeekStoryRecommendation,
  type StoryLearningItem,
  type StoryLearningPriority,
  type StoryLearningSignal,
  type StoryWeeklyLearningSummary
} from "@/lib/storyLearningLoop";

export type NextWeekPlanningStrategy =
  | "repeat_winners"
  | "adjust_weak_content"
  | "fill_funnel_gaps"
  | "improve_cta"
  | "increase_bastidores"
  | "increase_authority"
  | "increase_bofu"
  | "collect_more_data"
  | "ethical_rewrite";

export type NextWeekRecommendationSource = "story_learning" | "result_signal" | "funnel_gap" | "cta_learning" | "theme_learning" | "manual_rule";
export type NextWeekStoryStatus = "suggested" | "needs_review" | "approved" | "ready_to_export" | "blocked";

export type NextWeekStoryItem = {
  id: string;
  dayLabel: string;
  order: number;
  slotType: StorySlotType;
  pillar: string;
  funnelStage: ContentFunnelStage;
  theme: NextWeekDayTheme;
  suggestedTitle: string;
  suggestedText: string;
  suggestedCTA: string;
  suggestedSticker: string;
  suggestedMediaHint: string;
  sourceLearningId: string;
  sourceSignals: StoryLearningSignal[];
  planningStrategy: NextWeekPlanningStrategy;
  recommendationSource: NextWeekRecommendationSource;
  reason: string;
  priority: StoryLearningPriority;
  ethicalWarnings: string[];
  needsHumanReview: boolean;
  status: NextWeekStoryStatus;
  createdAt: Date;
};

export type NextWeekDayTheme =
  | "mamas_protese"
  | "lipo_contorno"
  | "mamoplastia_redutora"
  | "maternidade_pos_gestacao"
  | "seguranca_resultado_expectativa"
  | "bastidores_naturalidade"
  | "autoridade_preparacao";

export type NextWeekDayPlan = {
  id: string;
  dayLabel: string;
  date: string;
  theme: NextWeekDayTheme;
  objective: string;
  items: NextWeekStoryItem[];
  totalStories: number;
  ctaCount: number;
  bofuCount: number;
  mofuCount: number;
  tofuCount: number;
  reviewCount: number;
  status: NextWeekStoryStatus;
  warnings: string[];
  createdAt: Date;
};

export type NextWeekPlan = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: NextWeekDayPlan[];
  totalStories: number;
  averageStoriesPerDay: number;
  repeatedWinningThemes: string[];
  adjustedWeakThemes: string[];
  funnelGapsAddressed: string[];
  ctaImprovements: string[];
  ethicalReviewItems: NextWeekStoryItem[];
  missingDataActions: string[];
  status: NextWeekStoryStatus;
  warnings: string[];
  createdAt: Date;
};

export type NextWeekPlanningSummary = {
  totalStories: number;
  totalDays: number;
  averageStoriesPerDay: number;
  highPriorityItems: number;
  reviewItems: number;
  blockedItems: number;
  repeatRecommendations: number;
  adjustRecommendations: number;
  ctaImprovementItems: number;
  bofuItems: number;
  mofuItems: number;
  tofuItems: number;
  mainStrategy: string;
  mainWarnings: string[];
  nextActions: string[];
};

export type NextWeekPlanningChecklistItem = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "done" | "blocked" | "not_applicable";
  isRequired: boolean;
  warning: string;
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");
const slotOrder: StorySlotType[] = ["human_bastidor", "rotina_medica", "autoridade", "duvida_frequente", "quebra_de_mito", "prova_confianca", "procedimento", "maternidade_naturalidade", "cta_leve", "cta_direto"];

const dayBlueprint: Array<{ dayLabel: string; date: string; theme: NextWeekDayTheme; objective: string }> = [
  { dayLabel: "Segunda-feira", date: "2026-05-18", theme: "mamas_protese", objective: "Usar aprendizado de protese, silicone e CTA forte para gerar conversas qualificadas." },
  { dayLabel: "Terca-feira", date: "2026-05-19", theme: "lipo_contorno", objective: "Ajustar ganchos fracos e reforcar seguranca em lipoaspiracao e contorno." },
  { dayLabel: "Quarta-feira", date: "2026-05-20", theme: "mamoplastia_redutora", objective: "Aprofundar procedimento de alta intencao com linguagem simples." },
  { dayLabel: "Quinta-feira", date: "2026-05-21", theme: "maternidade_pos_gestacao", objective: "Repetir linguagem emocional com seguranca e sem promessa de transformacao." },
  { dayLabel: "Sexta-feira", date: "2026-05-22", theme: "seguranca_resultado_expectativa", objective: "Transformar resultado e expectativa em educacao sem antes/depois irregular." },
  { dayLabel: "Sabado", date: "2026-05-23", theme: "bastidores_naturalidade", objective: "Usar bastidores fortes para humanizar e manter presenca." },
  { dayLabel: "Domingo", date: "2026-05-24", theme: "autoridade_preparacao", objective: "Aquecer audiencia com autoridade e preparacao da semana." }
];

export function buildNextWeekPlanFromLearning(learningItems: StoryLearningItem[] = buildStoryLearningItems()): NextWeekPlan {
  const learningSummary = buildWeeklyStoryLearningSummary(learningItems);
  const days = dayBlueprint.map((day) => buildNextWeekDayPlan(day, learningItems, learningSummary));
  const items = days.flatMap((day) => day.items);
  const warnings = validateNextWeekPlan({
    id: "",
    weekLabel: "Proxima semana de stories",
    startDate: dayBlueprint[0].date,
    endDate: dayBlueprint[dayBlueprint.length - 1].date,
    days,
    totalStories: items.length,
    averageStoriesPerDay: calculateAverage(items.length, days.length),
    repeatedWinningThemes: [],
    adjustedWeakThemes: [],
    funnelGapsAddressed: [],
    ctaImprovements: [],
    ethicalReviewItems: [],
    missingDataActions: [],
    status: "suggested",
    warnings: [],
    createdAt: baseDate
  } as NextWeekPlan);

  const plan: NextWeekPlan = {
    id: "next-week-story-plan-2026-05-18",
    weekLabel: "Proxima semana de stories",
    startDate: dayBlueprint[0].date,
    endDate: dayBlueprint[dayBlueprint.length - 1].date,
    days,
    totalStories: items.length,
    averageStoriesPerDay: calculateAverage(items.length, days.length),
    repeatedWinningThemes: unique(items.filter((item) => item.planningStrategy === "repeat_winners").map((item) => item.pillar)),
    adjustedWeakThemes: unique(items.filter((item) => item.planningStrategy === "adjust_weak_content").map((item) => item.pillar)),
    funnelGapsAddressed: unique(items.filter((item) => item.planningStrategy === "fill_funnel_gaps" || item.planningStrategy === "increase_bofu").map((item) => item.funnelStage)),
    ctaImprovements: unique(items.filter((item) => item.planningStrategy === "improve_cta").map((item) => item.suggestedCTA)),
    ethicalReviewItems: getNextWeekReviewItems({ days } as NextWeekPlan),
    missingDataActions: getNextWeekMissingDataActions(items),
    status: determinePlanStatus(days),
    warnings,
    createdAt: baseDate
  };

  return { ...plan, warnings: validateNextWeekPlan(plan) };
}

export function buildNextWeekDayPlan(
  day: (typeof dayBlueprint)[number] = dayBlueprint[0],
  learningItems: StoryLearningItem[] = buildStoryLearningItems(),
  learningSummary: StoryWeeklyLearningSummary = buildWeeklyStoryLearningSummary(learningItems)
): NextWeekDayPlan {
  const applied = applyLearningToNextWeekSlots(day, learningItems, learningSummary);
  const items = fillMissingStorySlots(day, applied, learningItems, learningSummary);
  const warnings = validateNextWeekDayPlan({ items, totalStories: items.length, dayLabel: day.dayLabel } as NextWeekDayPlan);
  return {
    id: `next-week-day-${day.date}`,
    dayLabel: day.dayLabel,
    date: day.date,
    theme: day.theme,
    objective: day.objective,
    items,
    totalStories: items.length,
    ctaCount: items.filter((item) => item.slotType === "cta_leve" || item.slotType === "cta_direto").length,
    bofuCount: items.filter((item) => item.funnelStage === "BOFU").length,
    mofuCount: items.filter((item) => item.funnelStage === "MOFU").length,
    tofuCount: items.filter((item) => item.funnelStage === "TOFU").length,
    reviewCount: items.filter((item) => item.needsHumanReview).length,
    status: determineDayStatus(items),
    warnings,
    createdAt: baseDate
  };
}

export function buildNextWeekStoryItem(
  slotType: StorySlotType,
  day: (typeof dayBlueprint)[number] = dayBlueprint[0],
  order = 1,
  learningItem: StoryLearningItem | null = null,
  strategy: NextWeekPlanningStrategy = learningItem ? selectPlanningStrategyForLearningItem(learningItem) : strategyForSlot(slotType),
  source: NextWeekRecommendationSource = learningItem ? "story_learning" : "manual_rule"
): NextWeekStoryItem {
  const pillar = selectPillarForSlot(day.theme, slotType, learningItem);
  const funnelStage = selectFunnelForSlot(slotType, learningItem, strategy);
  const ethicalWarnings = learningItem?.signals.includes("ethical_attention") ? ["Inspirado em item com alerta etico; revisar e reescrever antes de usar."] : [];
  const needsHumanReview = ethicalWarnings.length > 0 || strategy === "ethical_rewrite" || strategy === "collect_more_data";
  const status: NextWeekStoryStatus = needsHumanReview ? "needs_review" : strategy === "fill_funnel_gaps" ? "suggested" : "ready_to_export";
  const sourceSignals = learningItem?.signals ?? [];

  return {
    id: `next-week-${day.date}-${String(order).padStart(2, "0")}-${slotType}`,
    dayLabel: day.dayLabel,
    order,
    slotType,
    pillar,
    funnelStage,
    theme: day.theme,
    suggestedTitle: titleForSlot(slotType, pillar, strategy),
    suggestedText: generateNextWeekStoryText(slotType, day.theme, learningItem, strategy),
    suggestedCTA: generateNextWeekCTA(slotType, learningItem, strategy),
    suggestedSticker: generateNextWeekStickerSuggestion(slotType, strategy),
    suggestedMediaHint: mediaHintForSlot(slotType, day.theme, learningItem),
    sourceLearningId: learningItem?.id ?? "",
    sourceSignals,
    planningStrategy: strategy,
    recommendationSource: source,
    reason: reasonForItem(slotType, strategy, learningItem),
    priority: learningItem?.priority ?? priorityForStrategy(strategy),
    ethicalWarnings,
    needsHumanReview,
    status,
    createdAt: baseDate
  };
}

export function generateNextWeekStoryText(slotType: StorySlotType, theme: NextWeekDayTheme = "mamas_protese", learningItem: StoryLearningItem | null = null, strategy: NextWeekPlanningStrategy = "fill_funnel_gaps"): string {
  if (strategy === "ethical_rewrite") return "Transformar o aprendizado em conteudo educativo, sem expor paciente, resultado ou antes/depois.";
  if (learningItem?.signals.includes("generated_whatsapp")) return "Vamos aprofundar esse tema com foco em indicacao, seguranca e proximo passo claro.";
  if (learningItem?.signals.includes("generated_replies")) return "Pergunta importante da semana: o que ainda gera duvida sobre esse tema?";
  if (slotType === "human_bastidor") return "Comecando o dia com bastidores reais de planejamento e cuidado.";
  if (slotType === "autoridade") return "Um ponto tecnico explicado de forma simples para ajudar na decisao.";
  if (slotType === "procedimento") return procedureTextForTheme(theme);
  if (slotType === "maternidade_naturalidade") return "Maternidade muda o corpo, mas a conversa precisa ser individual, segura e realista.";
  if (slotType === "cta_direto") return "Quer entender se isso faz sentido para o seu caso? Fale com a equipe.";
  if (slotType === "cta_leve") return "Se esse tema faz sentido para voce, acompanhe os proximos stories.";
  return "Novo gancho para testar o tema com clareza e sem promessa de resultado.";
}

export function generateNextWeekCTA(slotType: StorySlotType, learningItem: StoryLearningItem | null = null, strategy: NextWeekPlanningStrategy = "fill_funnel_gaps"): string {
  if (slotType === "cta_direto" || strategy === "increase_bofu" || learningItem?.signals.includes("generated_whatsapp")) return "Quer entender se isso faz sentido para o seu caso? Fale com a equipe.";
  if (slotType === "cta_leve") return "Acompanhe os proximos stories.";
  if (learningItem?.signals.includes("generated_replies")) return "Envie sua duvida para a equipe.";
  return "Salve para rever com calma.";
}

export function generateNextWeekStickerSuggestion(slotType: StorySlotType, strategy: NextWeekPlanningStrategy = "fill_funnel_gaps"): string {
  if (slotType === "duvida_frequente") return "caixa de perguntas";
  if (slotType === "quebra_de_mito") return "enquete mito/verdade";
  if (slotType === "cta_direto") return "link ou botao de contato manual";
  if (strategy === "collect_more_data") return "pergunta para medir interesse";
  return "enquete leve";
}

export function selectPlanningStrategyForLearningItem(item: StoryLearningItem): NextWeekPlanningStrategy {
  if (item.signals.includes("ethical_attention")) return "ethical_rewrite";
  if (item.signals.includes("missing_data")) return "collect_more_data";
  if (item.signals.includes("generated_whatsapp")) return item.funnelStage === "BOFU" ? "increase_bofu" : "repeat_winners";
  if (item.signals.includes("strong_cta")) return "improve_cta";
  if (item.signals.includes("strong_bastidor")) return "increase_bastidores";
  if (item.signals.includes("strong_authority")) return "increase_authority";
  if (item.signals.includes("low_engagement")) return "adjust_weak_content";
  return "fill_funnel_gaps";
}

export function selectNextWeekPillarBalance(items: StoryLearningItem[] = buildStoryLearningItems()): Record<string, number> {
  const winners = getStoryReuseCandidates(items);
  const balance = winners.reduce<Record<string, number>>((acc, item) => {
    acc[item.pillar] = (acc[item.pillar] ?? 0) + 1;
    return acc;
  }, {});
  return Object.keys(balance).length > 0 ? balance : { "Mamas e protese": 2, "Lipoaspiracao e contorno corporal": 2, "Bastidores e rotina": 2 };
}

export function selectNextWeekFunnelBalance(items: StoryLearningItem[] = buildStoryLearningItems()): Record<ContentFunnelStage, number> {
  const base: Record<ContentFunnelStage, number> = { TOFU: 0, MOFU: 0, BOFU: 0 };
  return items.reduce<Record<ContentFunnelStage, number>>((acc, item) => {
    acc[item.funnelStage] += item.signals.includes("generated_whatsapp") ? 2 : 1;
    return acc;
  }, base);
}

export function applyLearningToNextWeekSlots(
  day: (typeof dayBlueprint)[number],
  learningItems: StoryLearningItem[],
  learningSummary: StoryWeeklyLearningSummary = buildWeeklyStoryLearningSummary(learningItems)
): NextWeekStoryItem[] {
  return slotOrder.map((slotType, index) => {
    const learningItem = selectLearningForSlot(slotType, day.theme, learningItems, learningSummary);
    const strategy = learningItem ? selectPlanningStrategyForLearningItem(learningItem) : strategyForSlot(slotType);
    return buildNextWeekStoryItem(slotType, day, index + 1, learningItem, strategy, learningItem ? sourceForStrategy(strategy) : "manual_rule");
  });
}

export function fillMissingStorySlots(
  day: (typeof dayBlueprint)[number],
  items: NextWeekStoryItem[],
  learningItems: StoryLearningItem[] = buildStoryLearningItems(),
  learningSummary: StoryWeeklyLearningSummary = buildWeeklyStoryLearningSummary(learningItems)
): NextWeekStoryItem[] {
  const byOrder = new Map(items.map((item) => [item.order, item]));
  return slotOrder.map((slotType, index) => byOrder.get(index + 1) ?? buildNextWeekStoryItem(slotType, day, index + 1, selectLearningForSlot(slotType, day.theme, learningItems, learningSummary)));
}

export function avoidRepeatingWeakStories(items: StoryLearningItem[] = buildStoryLearningItems()): StoryLearningItem[] {
  return getStoriesToAvoidRepeating(items);
}

export function adaptWinningStoryForNextWeek(item: StoryLearningItem): NextWeekStoryItem {
  return buildNextWeekStoryItem(item.slotType, dayBlueprint[0], 1, item, selectPlanningStrategyForLearningItem(item), "story_learning");
}

export function createEthicalRewriteSuggestion(item: StoryLearningItem): NextWeekStoryItem {
  return buildNextWeekStoryItem(item.slotType, dayBlueprint[4], 6, item, "ethical_rewrite", "story_learning");
}

export function summarizeNextWeekPlan(plan: NextWeekPlan): NextWeekPlanningSummary {
  const items = plan.days.flatMap((day) => day.items);
  return {
    totalStories: plan.totalStories,
    totalDays: plan.days.length,
    averageStoriesPerDay: plan.averageStoriesPerDay,
    highPriorityItems: getNextWeekHighPriorityItems(plan).length,
    reviewItems: getNextWeekReviewItems(plan).length,
    blockedItems: getNextWeekBlockedItems(plan).length,
    repeatRecommendations: items.filter((item) => item.planningStrategy === "repeat_winners").length,
    adjustRecommendations: items.filter((item) => item.planningStrategy === "adjust_weak_content" || item.planningStrategy === "ethical_rewrite").length,
    ctaImprovementItems: items.filter((item) => item.planningStrategy === "improve_cta").length,
    bofuItems: items.filter((item) => item.funnelStage === "BOFU").length,
    mofuItems: items.filter((item) => item.funnelStage === "MOFU").length,
    tofuItems: items.filter((item) => item.funnelStage === "TOFU").length,
    mainStrategy: "Repetir o que gerou WhatsApp, ajustar conteudos fracos e preencher lacunas de BOFU.",
    mainWarnings: plan.warnings.slice(0, 8),
    nextActions: ["Revisar itens de risco", "Aprovar plano da semana", "Exportar semana", "Executar manualmente", "Registrar resultados"]
  };
}

export function validateNextWeekPlan(plan: NextWeekPlan): string[] {
  const warnings: string[] = [];
  if (plan.days.length !== 7) warnings.push("Plano da proxima semana deve conter 7 dias.");
  if (plan.totalStories !== 70) warnings.push("Plano deveria tentar atingir 70 stories.");
  warnings.push(...getNextWeekFunnelWarnings(plan));
  warnings.push(...getNextWeekCtaWarnings(plan));
  warnings.push(...getNextWeekEthicalWarnings(plan));
  if (getNextWeekMissingDataActions(plan.days.flatMap((day) => day.items)).length > 0) warnings.push("Ha aprendizados dependentes de dados faltantes; preencher /stories/results.");
  return unique(warnings);
}

export function validateNextWeekDayPlan(day: NextWeekDayPlan): string[] {
  const warnings: string[] = [];
  if (day.totalStories !== 10) warnings.push(`${day.dayLabel} deveria ter 10 stories.`);
  if (!day.items.some((item) => item.slotType === "human_bastidor")) warnings.push(`${day.dayLabel} precisa de bastidor.`);
  if (!day.items.some((item) => item.slotType === "autoridade")) warnings.push(`${day.dayLabel} precisa de autoridade.`);
  if (!day.items.some((item) => item.slotType === "procedimento")) warnings.push(`${day.dayLabel} precisa de procedimento.`);
  if (!day.items.some((item) => item.slotType === "cta_leve")) warnings.push(`${day.dayLabel} precisa de CTA leve.`);
  if (!day.items.some((item) => item.slotType === "cta_direto")) warnings.push(`${day.dayLabel} precisa de CTA direto.`);
  if (day.reviewCount > 0) warnings.push(`${day.reviewCount} item(ns) precisam de revisao humana.`);
  return unique(warnings);
}

export function getNextWeekReviewItems(plan: NextWeekPlan): NextWeekStoryItem[] {
  return plan.days.flatMap((day) => day.items).filter((item) => item.needsHumanReview || item.status === "needs_review");
}

export function getNextWeekBlockedItems(plan: NextWeekPlan): NextWeekStoryItem[] {
  return plan.days.flatMap((day) => day.items).filter((item) => item.status === "blocked");
}

export function getNextWeekHighPriorityItems(plan: NextWeekPlan): NextWeekStoryItem[] {
  return plan.days.flatMap((day) => day.items).filter((item) => item.priority === "high");
}

export function getNextWeekFunnelWarnings(plan: NextWeekPlan): string[] {
  const items = plan.days.flatMap((day) => day.items);
  const tofu = items.filter((item) => item.funnelStage === "TOFU").length;
  const bofu = items.filter((item) => item.funnelStage === "BOFU").length;
  const warnings: string[] = [];
  if (tofu > 42) warnings.push("Excesso de TOFU; incluir mais MOFU/BOFU.");
  if (bofu === 0) warnings.push("Ausencia de BOFU; incluir CTAs e temas de decisao.");
  return warnings;
}

export function getNextWeekCtaWarnings(plan: NextWeekPlan): string[] {
  const warnings: string[] = [];
  plan.days.forEach((day) => {
    if (!day.items.some((item) => item.slotType === "cta_leve")) warnings.push(`${day.dayLabel} sem CTA leve.`);
    if (!day.items.some((item) => item.slotType === "cta_direto")) warnings.push(`${day.dayLabel} sem CTA direto.`);
  });
  return warnings;
}

export function getNextWeekEthicalWarnings(plan: NextWeekPlan): string[] {
  const reviewItems = getNextWeekReviewItems(plan);
  return reviewItems.length > 0 ? [`${reviewItems.length} item(ns) precisam de revisao humana antes de exportar.`] : [];
}

export function getNextWeekMissingDataActions(items: NextWeekStoryItem[]): string[] {
  const count = items.filter((item) => item.planningStrategy === "collect_more_data").length;
  return count > 0 ? [`Preencher metricas de ${count} aprendizado(s) em /stories/results antes de decidir frequencia.`] : [];
}

export function generateNextWeekPlanningChecklist(plan: NextWeekPlan): NextWeekPlanningChecklistItem[] {
  const hasReview = getNextWeekReviewItems(plan).length > 0;
  return [
    checklistItem("review-risk", "Revisar itens de risco", "Conferir alertas eticos, paciente, resultado, depoimento e antes/depois.", hasReview ? "pending" : "not_applicable", true, hasReview ? "Ha itens em revisao." : ""),
    checklistItem("approve-plan", "Aprovar plano", "Validar os 7 dias e 70 stories antes de exportar.", "pending", true, ""),
    checklistItem("export-week", "Exportar semana", "Enviar plano aprovado para o pacote de exportacao manual.", "pending", true, ""),
    checklistItem("manual-execution", "Executar manualmente", "Publicar manualmente, sem API externa ou automacao real.", "pending", true, ""),
    checklistItem("record-results", "Registrar resultado", "Registrar visualizacoes, respostas, cliques e WhatsApp depois da publicacao.", "pending", true, "")
  ];
}

export function generateNextWeekPlanMarkdownBrief(plan: NextWeekPlan): string {
  return [
    `# ${plan.weekLabel}`,
    "",
    "Plano simulado: revisar, aprovar e exportar antes de qualquer publicacao manual.",
    "",
    ...plan.days.flatMap((day) => [
      `## ${day.dayLabel} - ${nextWeekThemeLabel(day.theme)}`,
      "",
      `Objetivo: ${day.objective}`,
      "",
      ...day.items.map((item) => `### Story ${String(item.order).padStart(2, "0")} - ${storySlotTypeLabel(item.slotType)}\n- Texto: ${item.suggestedText}\n- CTA: ${item.suggestedCTA}\n- Sticker: ${item.suggestedSticker}\n- Pilar: ${item.pillar}\n- Funil: ${item.funnelStage}\n- Estrategia: ${planningStrategyLabel(item.planningStrategy)}\n- Atencao: ${item.ethicalWarnings.join(" ") || "revisao operacional padrao"}`),
      ""
    ])
  ].join("\n");
}

export function generateNextWeekCopyReadyPlan(plan: NextWeekPlan): string {
  return plan.days
    .map((day) => `${day.dayLabel} - ${nextWeekThemeLabel(day.theme)}\n\n${day.items.map((item) => `Story ${String(item.order).padStart(2, "0")} - ${storySlotTypeLabel(item.slotType)}\nTexto: ${item.suggestedText}\nCTA: ${item.suggestedCTA}\nSticker: ${item.suggestedSticker}\nStatus: ${nextWeekStoryStatusLabel(item.status)}`).join("\n\n")}`)
    .join("\n\n---\n\n");
}

export function nextWeekThemeLabel(theme: NextWeekDayTheme): string {
  return {
    mamas_protese: "Mamas e protese",
    lipo_contorno: "Lipoaspiracao e contorno",
    mamoplastia_redutora: "Mamoplastia redutora",
    maternidade_pos_gestacao: "Maternidade e pos-gestacao",
    seguranca_resultado_expectativa: "Seguranca, resultado e expectativa realista",
    bastidores_naturalidade: "Bastidores e naturalidade",
    autoridade_preparacao: "Autoridade e preparacao da semana"
  }[theme];
}

export function planningStrategyLabel(strategy: NextWeekPlanningStrategy): string {
  return {
    repeat_winners: "Repetir vencedores",
    adjust_weak_content: "Ajustar conteudo fraco",
    fill_funnel_gaps: "Preencher lacunas do funil",
    improve_cta: "Melhorar CTA",
    increase_bastidores: "Aumentar bastidores",
    increase_authority: "Aumentar autoridade",
    increase_bofu: "Aumentar BOFU",
    collect_more_data: "Coletar mais dados",
    ethical_rewrite: "Reescrita etica"
  }[strategy];
}

export function nextWeekStoryStatusLabel(status: NextWeekStoryStatus): string {
  return {
    suggested: "Sugerido",
    needs_review: "Precisa revisao",
    approved: "Aprovado",
    ready_to_export: "Pronto para exportar",
    blocked: "Bloqueado"
  }[status];
}

function selectLearningForSlot(slotType: StorySlotType, theme: NextWeekDayTheme, learningItems: StoryLearningItem[], learningSummary: StoryWeeklyLearningSummary): StoryLearningItem | null {
  const ethical = learningItems.find((item) => item.signals.includes("ethical_attention") && slotType === "prova_confianca" && theme === "seguranca_resultado_expectativa");
  if (ethical) return ethical;
  const missing = learningItems.find((item) => item.signals.includes("missing_data") && slotType === "duvida_frequente");
  if (missing) return missing;
  const slotWinner = getStoryReuseCandidates(learningItems).find((item) => item.slotType === slotType);
  if (slotWinner) return slotWinner;
  const themeWinner = getStoryReuseCandidates(learningItems).find((item) => themeMatchesPillar(theme, item.pillar));
  if (themeWinner) return themeWinner;
  const weak = getStoriesToAvoidRepeating(learningItems).find((item) => item.slotType === slotType || themeMatchesPillar(theme, item.pillar));
  if (weak) return weak;
  const recommendation = learningSummary.nextWeekRecommendations.find((item) => item.suggestedSlotType === slotType);
  return recommendation ? learningItems.find((item) => item.id === recommendation.sourceLearning) ?? null : null;
}

function sourceForStrategy(strategy: NextWeekPlanningStrategy): NextWeekRecommendationSource {
  if (strategy === "improve_cta") return "cta_learning";
  if (strategy === "fill_funnel_gaps" || strategy === "increase_bofu") return "funnel_gap";
  if (strategy === "repeat_winners" || strategy === "ethical_rewrite") return "story_learning";
  if (strategy === "collect_more_data") return "result_signal";
  return "theme_learning";
}

function strategyForSlot(slotType: StorySlotType): NextWeekPlanningStrategy {
  if (slotType === "human_bastidor") return "increase_bastidores";
  if (slotType === "autoridade") return "increase_authority";
  if (slotType === "cta_leve" || slotType === "cta_direto") return "improve_cta";
  if (slotType === "procedimento") return "increase_bofu";
  return "fill_funnel_gaps";
}

function selectPillarForSlot(theme: NextWeekDayTheme, slotType: StorySlotType, learningItem: StoryLearningItem | null): string {
  if (learningItem && slotType !== "human_bastidor") return learningItem.pillar;
  if (slotType === "human_bastidor" || theme === "bastidores_naturalidade") return "Bastidores e rotina";
  if (theme === "mamas_protese") return "Mamas e protese de silicone";
  if (theme === "lipo_contorno") return "Lipoaspiracao e contorno corporal";
  if (theme === "mamoplastia_redutora") return "Mamoplastia redutora";
  if (theme === "maternidade_pos_gestacao") return "Maternidade e pos-gestacao";
  if (theme === "autoridade_preparacao") return "Autoridade medica";
  return "Naturalidade e seguranca";
}

function selectFunnelForSlot(slotType: StorySlotType, learningItem: StoryLearningItem | null, strategy: NextWeekPlanningStrategy): ContentFunnelStage {
  if (slotType === "cta_direto" || strategy === "increase_bofu") return "BOFU";
  if (slotType === "cta_leve" || slotType === "procedimento" || slotType === "duvida_frequente") return "MOFU";
  if (learningItem?.signals.includes("generated_whatsapp")) return "BOFU";
  return learningItem?.funnelStage ?? "TOFU";
}

function titleForSlot(slotType: StorySlotType, pillar: string, strategy: NextWeekPlanningStrategy): string {
  if (strategy === "ethical_rewrite") return `Reescrita educativa: ${pillar}`;
  return `${storySlotTypeLabel(slotType)} - ${pillar}`;
}

function mediaHintForSlot(slotType: StorySlotType, theme: NextWeekDayTheme, learningItem: StoryLearningItem | null): string {
  if (learningItem?.suggestedFilename) return `Usar nova midia inspirada em ${learningItem.suggestedFilename}`;
  if (slotType === "human_bastidor") return "Foto/video vertical de bastidor aprovado";
  if (slotType === "procedimento") return `Midia educativa sobre ${nextWeekThemeLabel(theme)}`;
  return "Selecionar midia aprovada da biblioteca";
}

function reasonForItem(slotType: StorySlotType, strategy: NextWeekPlanningStrategy, learningItem: StoryLearningItem | null): string {
  if (learningItem) return learningItem.learning;
  if (strategy === "improve_cta") return "CTA deve ser testado com proxima acao mais clara.";
  if (strategy === "increase_bofu") return "Plano precisa manter conteudos de decisao e conversa qualificada.";
  return `Slot ${storySlotTypeLabel(slotType)} mantem a sequencia diaria de 10 stories.`;
}

function priorityForStrategy(strategy: NextWeekPlanningStrategy): StoryLearningPriority {
  if (strategy === "ethical_rewrite" || strategy === "increase_bofu" || strategy === "repeat_winners") return "high";
  if (strategy === "improve_cta" || strategy === "collect_more_data" || strategy === "adjust_weak_content") return "medium";
  return "low";
}

function determineDayStatus(items: NextWeekStoryItem[]): NextWeekStoryStatus {
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.status === "needs_review")) return "needs_review";
  return "ready_to_export";
}

function determinePlanStatus(days: NextWeekDayPlan[]): NextWeekStoryStatus {
  if (days.some((day) => day.status === "blocked")) return "blocked";
  if (days.some((day) => day.status === "needs_review")) return "needs_review";
  return "ready_to_export";
}

function themeMatchesPillar(theme: NextWeekDayTheme, pillar: string): boolean {
  const normalized = pillar.toLowerCase();
  if (theme === "mamas_protese") return normalized.includes("mamas") || normalized.includes("protese");
  if (theme === "lipo_contorno") return normalized.includes("lipo") || normalized.includes("contorno");
  if (theme === "mamoplastia_redutora") return normalized.includes("mamoplastia");
  if (theme === "maternidade_pos_gestacao") return normalized.includes("maternidade") || normalized.includes("naturalidade");
  if (theme === "bastidores_naturalidade") return normalized.includes("bastidor") || normalized.includes("naturalidade");
  if (theme === "autoridade_preparacao") return normalized.includes("autoridade") || normalized.includes("seguranca");
  return normalized.includes("resultado") || normalized.includes("seguranca");
}

function procedureTextForTheme(theme: NextWeekDayTheme): string {
  if (theme === "mamas_protese") return "Protese de silicone nao se escolhe so por ml; indicacao e seguranca mudam a decisao.";
  if (theme === "lipo_contorno") return "Lipoaspiracao melhora contorno, mas nao e metodo de emagrecimento.";
  if (theme === "mamoplastia_redutora") return "Mamoplastia redutora nao e so diminuir a mama; e planejamento de proporcao e conforto.";
  if (theme === "seguranca_resultado_expectativa") return "Resultado precisa de tempo, tecnica e expectativa realista.";
  return "Procedimento seguro comeca com avaliacao individual e conversa clara.";
}

function calculateAverage(total: number, days: number): number {
  return days === 0 ? 0 : Math.round((total / days) * 10) / 10;
}

function checklistItem(
  id: string,
  label: string,
  description: string,
  status: NextWeekPlanningChecklistItem["status"],
  isRequired: boolean,
  warning: string
): NextWeekPlanningChecklistItem {
  return { id, label, description, status, isRequired, warning };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
