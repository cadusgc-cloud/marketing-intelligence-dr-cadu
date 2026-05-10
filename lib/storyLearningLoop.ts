import type { ContentFunnelStage } from "@/lib/contentStudio";
import type { StorySlotType } from "@/lib/mediaLibrary";
import { buildStoryDayExecutionBoard } from "@/lib/storyExecutionBoard";
import { buildStoryWeekExportPackage } from "@/lib/storyWeekExport";
import {
  buildStoryResultItem,
  calculateStoryEngagementScore,
  detectStoryResultSignals,
  type StoryResultItem,
  type StoryResultMetricField
} from "@/lib/storyResults";

export type StoryLearningSignal =
  | "high_engagement"
  | "low_engagement"
  | "generated_whatsapp"
  | "generated_replies"
  | "strong_cta"
  | "weak_cta"
  | "strong_bastidor"
  | "strong_authority"
  | "strong_procedure"
  | "strong_maternity"
  | "ethical_attention"
  | "missing_data"
  | "reuse_recommended"
  | "avoid_repeating"
  | "needs_more_testing";

export type StoryLearningPriority = "low" | "medium" | "high";

export type StoryLearningRecommendationType =
  | "repeat"
  | "avoid"
  | "adjust"
  | "test_again"
  | "increase_frequency"
  | "reduce_frequency"
  | "improve_cta"
  | "add_more_bofu"
  | "add_more_authority"
  | "collect_more_data";

export type StoryLearningItem = {
  id: string;
  sourceStoryId: string;
  dayLabel: string;
  slotType: StorySlotType;
  pillar: string;
  funnelStage: ContentFunnelStage;
  suggestedFilename: string;
  originalText: string;
  views: number | null;
  replies: number | null;
  linkClicks: number | null;
  whatsappConversations: number | null;
  engagementScore: number;
  signals: StoryLearningSignal[];
  learning: string;
  recommendationType: StoryLearningRecommendationType;
  priority: StoryLearningPriority;
  nextWeekSuggestion: string;
  warnings: string[];
  createdAt: Date;
};

export type StoryThemeLearning = {
  id: string;
  theme: string;
  pillar: string;
  totalStories: number;
  totalViews: number;
  totalReplies: number;
  totalWhatsappConversations: number;
  averageEngagementScore: number;
  bestStoryId: string;
  weakestStoryId: string;
  recommendation: string;
  shouldRepeat: boolean;
  shouldReduce: boolean;
  createdAt: Date;
};

export type StoryCtaLearning = {
  id: string;
  ctaText: string;
  totalUses: number;
  totalClicks: number;
  totalWhatsappConversations: number;
  performanceLabel: "strong" | "neutral" | "weak" | "missing_data";
  recommendation: string;
  createdAt: Date;
};

export type StoryWeeklyLearningSummary = {
  id: string;
  weekLabel: string;
  totalStoriesAnalyzed: number;
  storiesWithResults: number;
  storiesMissingData: number;
  highPerformanceStories: number;
  lowPerformanceStories: number;
  whatsappGeneratingStories: number;
  replyGeneratingStories: number;
  reuseCandidates: StoryLearningItem[];
  avoidRepeatingItems: StoryLearningItem[];
  topThemes: StoryThemeLearning[];
  weakThemes: StoryThemeLearning[];
  topCtas: StoryCtaLearning[];
  weakCtas: StoryCtaLearning[];
  mainLearnings: string[];
  nextWeekRecommendations: NextWeekStoryRecommendation[];
  missingDataWarnings: string[];
  createdAt: Date;
};

export type NextWeekStoryRecommendation = {
  id: string;
  title: string;
  pillar: string;
  funnelStage: ContentFunnelStage;
  suggestedSlotType: StorySlotType;
  suggestedFrequency: number;
  reason: string;
  sourceLearning: string;
  suggestedText: string;
  suggestedCTA: string;
  priority: StoryLearningPriority;
  warnings: string[];
  createdAt: Date;
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");

export function buildStoryLearningItems(results: StoryResultItem[] = buildSimulatedStoryResultItems()): StoryLearningItem[] {
  return results.map((item) => buildStoryLearningItem(item));
}

export function buildStoryLearningItem(result: StoryResultItem): StoryLearningItem {
  const engagementScore = calculateStoryLearningScore(result);
  const signals = detectStoryLearningSignals(result);
  const recommendationType = classifyStoryRecommendationType(result, signals);
  const priority = classifyPriority(signals, recommendationType);
  const warnings = buildLearningWarnings(result, signals);

  return {
    id: `story-learning-${result.id}`,
    sourceStoryId: result.id,
    dayLabel: result.dayLabel,
    slotType: result.slotType,
    pillar: result.pillar,
    funnelStage: result.funnelStage,
    suggestedFilename: result.suggestedFilename,
    originalText: result.suggestedText,
    views: result.views,
    replies: result.replies,
    linkClicks: result.linkClicks,
    whatsappConversations: result.whatsappConversations,
    engagementScore,
    signals,
    learning: generateStoryLearningText(result, signals),
    recommendationType,
    priority,
    nextWeekSuggestion: buildNextWeekSuggestion(result, recommendationType, signals),
    warnings,
    createdAt: baseDate
  };
}

export function calculateStoryLearningScore(result: StoryResultItem): number {
  return calculateStoryEngagementScore(result);
}

export function detectStoryLearningSignals(result: StoryResultItem): StoryLearningSignal[] {
  const resultSignals = detectStoryResultSignals(result);
  const signals: StoryLearningSignal[] = [];
  const score = calculateStoryLearningScore(result);

  if (resultSignals.includes("generated_whatsapp")) signals.push("generated_whatsapp");
  if (resultSignals.includes("generated_replies")) signals.push("generated_replies");
  if (resultSignals.includes("good_cta")) signals.push("strong_cta");
  if (resultSignals.includes("weak_cta")) signals.push("weak_cta");
  if (resultSignals.includes("ethical_attention")) signals.push("ethical_attention");
  if (resultSignals.includes("needs_more_data")) signals.push("missing_data");
  if (score >= 8 || resultSignals.includes("strong_engagement")) signals.push("high_engagement");
  if (resultSignals.includes("low_engagement")) signals.push("low_engagement");
  if (isStrongSlot(result, "human_bastidor")) signals.push("strong_bastidor");
  if (isStrongSlot(result, "autoridade")) signals.push("strong_authority");
  if (isStrongSlot(result, "procedimento")) signals.push("strong_procedure");
  if (isStrongSlot(result, "maternidade_naturalidade")) signals.push("strong_maternity");
  if ((signals.includes("high_engagement") || signals.includes("generated_whatsapp") || signals.includes("generated_replies")) && !signals.includes("ethical_attention")) signals.push("reuse_recommended");
  if (signals.includes("low_engagement") && !signals.includes("missing_data")) signals.push("avoid_repeating");
  if (signals.includes("missing_data") || (signals.includes("low_engagement") && result.funnelStage === "BOFU")) signals.push("needs_more_testing");

  return unique(signals);
}

export function generateStoryLearningText(result: StoryResultItem, signals: StoryLearningSignal[] = detectStoryLearningSignals(result)): string {
  if (signals.includes("ethical_attention") && (signals.includes("generated_whatsapp") || signals.includes("high_engagement"))) {
    return "Performou bem, mas envolve risco etico; revisar e adaptar antes de qualquer reutilizacao.";
  }
  if (signals.includes("generated_whatsapp")) return "Gerou conversa no WhatsApp; vale repetir tema, CTA e estrutura com revisao manual.";
  if (signals.includes("generated_replies")) return "Gerou respostas; manter perguntas e stickers parecidos na proxima semana.";
  if (signals.includes("strong_bastidor")) return "Bastidor funcionou como aquecimento de relacionamento.";
  if (signals.includes("strong_procedure")) return "Tema de procedimento gerou intencao e pode reforcar BOFU.";
  if (signals.includes("strong_maternity")) return "Linguagem de maternidade/naturalidade gerou conexao e merece nova variacao.";
  if (signals.includes("missing_data")) return "Sem metricas suficientes; coletar dados antes de julgar desempenho.";
  if (signals.includes("low_engagement")) return "Baixo engajamento; ajustar gancho, ordem ou CTA antes de repetir.";
  return "Resultado neutro; comparar com temas e CTAs semelhantes antes de decidir.";
}

export function classifyStoryRecommendationType(result: StoryResultItem, signals: StoryLearningSignal[] = detectStoryLearningSignals(result)): StoryLearningRecommendationType {
  if (signals.includes("missing_data")) return "collect_more_data";
  if (signals.includes("ethical_attention") && (signals.includes("high_engagement") || signals.includes("generated_whatsapp"))) return "adjust";
  if (signals.includes("generated_whatsapp")) return "increase_frequency";
  if (signals.includes("strong_cta") || signals.includes("generated_replies")) return "repeat";
  if (signals.includes("weak_cta")) return "improve_cta";
  if (signals.includes("low_engagement") && result.funnelStage === "BOFU") return "test_again";
  if (signals.includes("low_engagement")) return "adjust";
  return "test_again";
}

export function getStoryReuseCandidates(items: StoryLearningItem[]): StoryLearningItem[] {
  return items.filter((item) => item.signals.includes("reuse_recommended") && !item.signals.includes("ethical_attention"));
}

export function getStoriesToAvoidRepeating(items: StoryLearningItem[]): StoryLearningItem[] {
  return items.filter((item) => item.signals.includes("avoid_repeating") || item.recommendationType === "avoid" || item.recommendationType === "adjust");
}

export function summarizeLearningByTheme(items: StoryLearningItem[]): StoryThemeLearning[] {
  const groups = groupStoryLearningByPillar(items);
  return Object.entries(groups)
    .map(([pillar, group]) => {
      const withResults = group.filter((item) => !item.signals.includes("missing_data"));
      const sorted = [...withResults].sort((a, b) => b.engagementScore - a.engagementScore);
      const totalWhatsapp = sum(group.map((item) => item.whatsappConversations ?? 0));
      const averageScore = withResults.length > 0 ? round(sum(withResults.map((item) => item.engagementScore)) / withResults.length) : 0;
      return {
        id: `theme-learning-${slug(pillar)}`,
        theme: pillar,
        pillar,
        totalStories: group.length,
        totalViews: sum(group.map((item) => item.views ?? 0)),
        totalReplies: sum(group.map((item) => item.replies ?? 0)),
        totalWhatsappConversations: totalWhatsapp,
        averageEngagementScore: averageScore,
        bestStoryId: sorted[0]?.sourceStoryId ?? "",
        weakestStoryId: sorted[sorted.length - 1]?.sourceStoryId ?? "",
        recommendation: totalWhatsapp > 0 || averageScore >= 8 ? "Manter tema e criar nova variacao com aprovacao manual." : "Ajustar gancho e testar de novo antes de reduzir frequencia.",
        shouldRepeat: totalWhatsapp > 0 || averageScore >= 8,
        shouldReduce: withResults.length > 0 && averageScore < 1 && totalWhatsapp === 0,
        createdAt: baseDate
      };
    })
    .sort((a, b) => b.totalWhatsappConversations - a.totalWhatsappConversations || b.averageEngagementScore - a.averageEngagementScore);
}

export function summarizeLearningByCta(items: StoryLearningItem[]): StoryCtaLearning[] {
  const groups = items.reduce<Record<string, StoryLearningItem[]>>((acc, item) => {
    const ctaText = ctaFromLearningItem(item);
    acc[ctaText] = [...(acc[ctaText] ?? []), item];
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([ctaText, group]) => {
      const totalClicks = sum(group.map((item) => item.linkClicks ?? 0));
      const totalWhatsapp = sum(group.map((item) => item.whatsappConversations ?? 0));
      const missing = group.every((item) => item.signals.includes("missing_data"));
      const performanceLabel: StoryCtaLearning["performanceLabel"] = missing ? "missing_data" : totalClicks > 0 || totalWhatsapp > 0 ? "strong" : group.length >= 2 ? "weak" : "neutral";
      return {
        id: `cta-learning-${slug(ctaText)}`,
        ctaText,
        totalUses: group.length,
        totalClicks,
        totalWhatsappConversations: totalWhatsapp,
        performanceLabel,
        recommendation: performanceLabel === "strong" ? "Repetir estrutura do CTA em temas parecidos." : performanceLabel === "weak" ? "Reescrever CTA com proxima acao mais clara." : "Coletar mais dados antes de decidir.",
        createdAt: baseDate
      };
    })
    .sort((a, b) => b.totalWhatsappConversations - a.totalWhatsappConversations || b.totalClicks - a.totalClicks);
}

export function buildWeeklyStoryLearningSummary(items: StoryLearningItem[] = buildStoryLearningItems(), weekLabel = "Semana simulada de stories"): StoryWeeklyLearningSummary {
  const topThemes = getTopPerformingStoryThemes(items);
  const weakThemes = getWeakPerformingStoryThemes(items);
  const topCtas = getTopPerformingCtas(items);
  const weakCtas = getWeakPerformingCtas(items);
  const reuseCandidates = getStoryReuseCandidates(items);
  const avoidRepeatingItems = getStoriesToAvoidRepeating(items);
  const missingDataWarnings = getMissingStoryResultWarnings(items);

  return {
    id: `story-weekly-learning-${slug(weekLabel)}`,
    weekLabel,
    totalStoriesAnalyzed: items.length,
    storiesWithResults: items.filter((item) => !item.signals.includes("missing_data")).length,
    storiesMissingData: items.filter((item) => item.signals.includes("missing_data")).length,
    highPerformanceStories: items.filter((item) => item.signals.includes("high_engagement")).length,
    lowPerformanceStories: items.filter((item) => item.signals.includes("low_engagement")).length,
    whatsappGeneratingStories: items.filter((item) => item.signals.includes("generated_whatsapp")).length,
    replyGeneratingStories: items.filter((item) => item.signals.includes("generated_replies")).length,
    reuseCandidates,
    avoidRepeatingItems,
    topThemes,
    weakThemes,
    topCtas,
    weakCtas,
    mainLearnings: buildSummaryLearnings(items, topThemes, topCtas, missingDataWarnings),
    nextWeekRecommendations: generateNextWeekStoryRecommendations(items),
    missingDataWarnings,
    createdAt: baseDate
  };
}

export function getTopPerformingStoryThemes(items: StoryLearningItem[]): StoryThemeLearning[] {
  return summarizeLearningByTheme(items).filter((theme) => theme.shouldRepeat).slice(0, 4);
}

export function getWeakPerformingStoryThemes(items: StoryLearningItem[]): StoryThemeLearning[] {
  return summarizeLearningByTheme(items).filter((theme) => theme.shouldReduce || theme.averageEngagementScore < 1).slice(0, 4);
}

export function getTopPerformingCtas(items: StoryLearningItem[]): StoryCtaLearning[] {
  return summarizeLearningByCta(items).filter((cta) => cta.performanceLabel === "strong").slice(0, 4);
}

export function getWeakPerformingCtas(items: StoryLearningItem[]): StoryCtaLearning[] {
  return summarizeLearningByCta(items).filter((cta) => cta.performanceLabel === "weak" || cta.performanceLabel === "missing_data").slice(0, 4);
}

export function generateNextWeekStoryRecommendations(items: StoryLearningItem[]): NextWeekStoryRecommendation[] {
  const sourceItems = [...getStoryReuseCandidates(items), ...items.filter((item) => item.recommendationType === "adjust" && item.signals.includes("ethical_attention")), ...items.filter((item) => item.signals.includes("missing_data"))].slice(0, 8);
  return sourceItems.map((item, index) => ({
    id: `next-week-story-${index + 1}`,
    title: recommendationTitle(item),
    pillar: item.pillar,
    funnelStage: item.signals.includes("generated_whatsapp") ? "BOFU" : item.funnelStage,
    suggestedSlotType: item.slotType,
    suggestedFrequency: item.signals.includes("generated_whatsapp") ? 2 : 1,
    reason: item.learning,
    sourceLearning: item.id,
    suggestedText: suggestedTextForRecommendation(item),
    suggestedCTA: item.signals.includes("generated_whatsapp") ? "Quer entender se isso faz sentido para o seu caso? Fale com a equipe." : "Acompanhe os proximos stories.",
    priority: item.priority,
    warnings: item.signals.includes("ethical_attention") ? ["Revisar e adaptar antes de reutilizar. Nao republicar igual sem aprovacao manual."] : item.warnings,
    createdAt: baseDate
  }));
}

export function getMissingStoryResultWarnings(items: StoryLearningItem[]): string[] {
  const missing = items.filter((item) => item.signals.includes("missing_data"));
  if (missing.length === 0) return [];
  return [
    `${missing.length} story/stories sem metricas suficientes para aprendizado.`,
    "Preencher resultados em /stories/results antes de fechar a auditoria da semana."
  ];
}

export function getStoryLearningMainWarnings(items: StoryLearningItem[]): string[] {
  const warnings = [
    "Aprendizado simulado e manual: nenhum dado e buscado automaticamente do Instagram, Meta ou qualquer plataforma.",
    "Nao transformar item com alerta etico em reutilizacao automatica sem revisao manual."
  ];
  const missingWarnings = getMissingStoryResultWarnings(items);
  const ethical = items.filter((item) => item.signals.includes("ethical_attention")).length;
  if (ethical > 0) warnings.push(`${ethical} story/stories exigem atencao etica antes de qualquer reaproveitamento.`);
  return unique([...warnings, ...missingWarnings]);
}

export function filterStoryLearningItemsBySignal(items: StoryLearningItem[], signal: StoryLearningSignal): StoryLearningItem[] {
  return items.filter((item) => item.signals.includes(signal));
}

export function filterStoryLearningItemsByRecommendationType(items: StoryLearningItem[], recommendationType: StoryLearningRecommendationType): StoryLearningItem[] {
  return items.filter((item) => item.recommendationType === recommendationType);
}

export function filterStoryLearningItemsByPriority(items: StoryLearningItem[], priority: StoryLearningPriority): StoryLearningItem[] {
  return items.filter((item) => item.priority === priority);
}

export function groupStoryLearningByPillar(items: StoryLearningItem[]): Record<string, StoryLearningItem[]> {
  return items.reduce<Record<string, StoryLearningItem[]>>((acc, item) => {
    acc[item.pillar] = [...(acc[item.pillar] ?? []), item];
    return acc;
  }, {});
}

export function groupStoryLearningByFunnelStage(items: StoryLearningItem[]): Record<ContentFunnelStage, StoryLearningItem[]> {
  return {
    TOFU: items.filter((item) => item.funnelStage === "TOFU"),
    MOFU: items.filter((item) => item.funnelStage === "MOFU"),
    BOFU: items.filter((item) => item.funnelStage === "BOFU")
  };
}

export function buildSimulatedStoryResultItems(): StoryResultItem[] {
  const exportPackage = buildStoryWeekExportPackage();
  const executionItems = exportPackage.dayPackages.flatMap((dayPackage) => buildStoryDayExecutionBoard(dayPackage).items);
  return executionItems.map((item, index) => {
    const orderSeed = `${item.dayLabel}-${item.order}`;
    const overrides = simulatedMetricsForItem(item.slotType, item.suggestedFilename, orderSeed, index);
    const keepsEthicalReview = /paciente|resultado|depoimento|antes-depois/i.test(item.suggestedFilename);
    const simulatedItem = keepsEthicalReview ? item : { ...item, privacyRisk: "low" as const, ethicalWarnings: [] };
    return buildStoryResultItem({ ...simulatedItem, executionStatus: "manually_published", publishedAt: "publicacao manual simulada" }, overrides);
  });
}

function simulatedMetricsForItem(
  slotType: StorySlotType,
  filename: string,
  seed: string,
  index: number
): Partial<Pick<StoryResultItem, StoryResultMetricField | "publishedUrl" | "notes">> {
  if (index % 13 === 0) return { publishedUrl: "https://instagram.com/stories/simulado", notes: "Aguardando coleta manual de metricas." };
  if (/paciente|resultado|depoimento|antes-depois/i.test(filename)) {
    return { publishedUrl: "https://instagram.com/stories/revisao-etica", views: 820, replies: 8, stickerInteractions: 14, linkClicks: 2, profileVisits: 11, whatsappConversations: 1, saves: 4, shares: 3, notes: "Performou bem, mas exige revisao etica antes de reutilizar." };
  }
  if (slotType === "human_bastidor" || slotType === "rotina_medica") {
    return { publishedUrl: "https://instagram.com/stories/bastidor", views: 740, replies: 7, stickerInteractions: 22, linkClicks: 0, profileVisits: 8, whatsappConversations: 0, saves: 2, shares: 2, notes: "Bastidor gerou resposta e aproximacao." };
  }
  if (slotType === "procedimento" || /protese|lipo|mamoplastia/i.test(filename)) {
    return { publishedUrl: "https://instagram.com/stories/procedimento", views: 690, replies: 5, stickerInteractions: 10, linkClicks: 3, profileVisits: 12, whatsappConversations: 2, saves: 6, shares: 3, notes: "Tema tecnico gerou intencao." };
  }
  if (slotType === "maternidade_naturalidade") {
    return { publishedUrl: "https://instagram.com/stories/maternidade", views: 760, replies: 9, stickerInteractions: 18, linkClicks: 1, profileVisits: 7, whatsappConversations: 1, saves: 5, shares: 4, notes: "Mensagem emocional com seguranca funcionou bem." };
  }
  if (slotType === "cta_direto") {
    return index % 2 === 0
      ? { publishedUrl: "https://instagram.com/stories/cta", views: 520, replies: 1, stickerInteractions: 3, linkClicks: 0, profileVisits: 2, whatsappConversations: 0, saves: 0, shares: 0, notes: "CTA direto fraco; precisa teste de texto." }
      : { publishedUrl: "https://instagram.com/stories/cta", views: 640, replies: 2, stickerInteractions: 5, linkClicks: 4, profileVisits: 13, whatsappConversations: 2, saves: 1, shares: 1, notes: "CTA direto claro gerou conversa." };
  }
  if (seed.includes("Domingo") || slotType === "quebra_de_mito") {
    return { publishedUrl: "https://instagram.com/stories/teste-fraco", views: 180, replies: 0, stickerInteractions: 0, linkClicks: 0, profileVisits: 0, whatsappConversations: 0, saves: 0, shares: 0, notes: "Baixo sinal; ajustar gancho." };
  }
  return { publishedUrl: "https://instagram.com/stories/simulado", views: 430, replies: 1, stickerInteractions: 4, linkClicks: 0, profileVisits: 3, whatsappConversations: 0, saves: 1, shares: 0, notes: "Resultado neutro para comparacao." };
}

function isStrongSlot(result: StoryResultItem, slotType: StorySlotType): boolean {
  return result.slotType === slotType && (calculateStoryLearningScore(result) >= 5 || (result.replies ?? 0) > 0 || (result.whatsappConversations ?? 0) > 0);
}

function classifyPriority(signals: StoryLearningSignal[], recommendationType: StoryLearningRecommendationType): StoryLearningPriority {
  if (signals.includes("generated_whatsapp") || signals.includes("ethical_attention") || recommendationType === "increase_frequency") return "high";
  if (signals.includes("generated_replies") || signals.includes("weak_cta") || signals.includes("missing_data")) return "medium";
  return "low";
}

function buildLearningWarnings(result: StoryResultItem, signals: StoryLearningSignal[]): string[] {
  const warnings: string[] = [];
  if (signals.includes("ethical_attention")) warnings.push("Exige revisao etica e aprovacao manual antes de reaproveitar.");
  if (signals.includes("missing_data")) warnings.push("Faltam metricas; nao classificar como ruim automaticamente.");
  if (signals.includes("low_engagement")) warnings.push("Testar novo gancho antes de abandonar tema importante.");
  return unique(warnings);
}

function buildNextWeekSuggestion(result: StoryResultItem, recommendationType: StoryLearningRecommendationType, signals: StoryLearningSignal[]): string {
  if (signals.includes("ethical_attention") && (signals.includes("high_engagement") || signals.includes("generated_whatsapp"))) return "Revisar e adaptar o conceito com cuidado etico; nao republicar igual.";
  if (recommendationType === "increase_frequency") return "Criar duas variacoes do tema com CTA para conversa qualificada.";
  if (recommendationType === "repeat") return "Repetir estrutura com novo texto e mesmo tipo de CTA.";
  if (recommendationType === "improve_cta") return "Manter tema, mas trocar CTA por proxima acao mais clara.";
  if (recommendationType === "collect_more_data") return "Registrar metricas antes de decidir frequencia.";
  return `Testar novo gancho para ${result.pillar}.`;
}

function recommendationTitle(item: StoryLearningItem): string {
  if (item.signals.includes("ethical_attention")) return `Revisar e adaptar: ${item.pillar}`;
  if (item.signals.includes("generated_whatsapp")) return `Reforcar tema que gerou WhatsApp: ${item.pillar}`;
  if (item.signals.includes("missing_data")) return `Coletar dados antes de decidir: ${item.pillar}`;
  return `Nova variacao para ${item.pillar}`;
}

function suggestedTextForRecommendation(item: StoryLearningItem): string {
  if (item.signals.includes("strong_procedure")) return "Vamos falar de indicacao, seguranca e expectativa realista para esse procedimento.";
  if (item.signals.includes("strong_maternity")) return "Maternidade muda o corpo, mas a conversa precisa ser individual e segura.";
  if (item.signals.includes("strong_bastidor")) return "Um pouco dos bastidores para mostrar planejamento e cuidado antes de qualquer decisao.";
  if (item.signals.includes("ethical_attention")) return "Revisar o contexto e transformar em conteudo educativo, sem expor paciente ou prometer resultado.";
  return "Repetir o tema com gancho mais claro e convite leve para conversa.";
}

function buildSummaryLearnings(items: StoryLearningItem[], topThemes: StoryThemeLearning[], topCtas: StoryCtaLearning[], missingWarnings: string[]): string[] {
  const learnings: string[] = [];
  if (topThemes[0]) learnings.push(`Tema mais forte: ${topThemes[0].pillar}.`);
  if (topCtas[0]) learnings.push(`CTA mais forte: ${topCtas[0].ctaText}.`);
  if (items.some((item) => item.signals.includes("generated_whatsapp"))) learnings.push("Stories com WhatsApp devem orientar BOFU da proxima semana.");
  if (items.some((item) => item.signals.includes("strong_bastidor"))) learnings.push("Bastidores continuam importantes para aquecer relacionamento.");
  if (missingWarnings.length > 0) learnings.push("Ainda ha lacunas de dados antes de fechar diagnostico definitivo.");
  return unique(learnings);
}

function ctaFromLearningItem(item: StoryLearningItem): string {
  if (item.slotType === "cta_direto" || item.signals.includes("generated_whatsapp")) return "Fale com a equipe";
  if (item.slotType === "cta_leve") return "Acompanhe os proximos stories";
  return item.funnelStage === "BOFU" ? "Entenda se faz sentido para seu caso" : "Envie sua duvida";
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
