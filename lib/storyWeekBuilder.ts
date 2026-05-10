import type { ContentFunnelStage } from "@/lib/contentStudio";
import {
  generateMediaCatalogingSuggestions,
  parseMediaManifestText,
  type MediaCatalogingConfidence,
  type MediaCatalogingSuggestion
} from "@/lib/mediaCataloging";
import type { PatientPrivacyRisk, StorySlotType } from "@/lib/mediaLibrary";

export type StoryWeekBuilderStatus = "draft" | "needs_review" | "approved" | "ready_to_export" | "exported" | "blocked";
export type StoryWeekOperationalStatus = "healthy" | "attention" | "critical";
export type StoryWeekDayTheme =
  | "mamas_protese"
  | "lipo_contorno"
  | "mamoplastia_redutora"
  | "maternidade_naturalidade"
  | "autoridade_segurança"
  | "bastidores_rotina"
  | "prova_confianca"
  | "consulta_avaliacao";
export type StoryWeekSlotStatus = "planned" | "needs_review" | "approved" | "ready_to_publish" | "published" | "blocked";

export type StoryWeekSlot = {
  id: string;
  dayLabel: string;
  date: string;
  order: number;
  slotType: StorySlotType;
  theme: StoryWeekDayTheme;
  objective: string;
  suggestedFilename: string;
  suggestedMediaId: string;
  suggestedText: string;
  stickerSuggestion: string;
  cta: string;
  funnelStage: ContentFunnelStage;
  pillar: string;
  privacyRisk: PatientPrivacyRisk;
  ethicalWarnings: string[];
  confidence: MediaCatalogingConfidence;
  status: StoryWeekSlotStatus;
  notes: string;
};

export type StoryWeekDay = {
  id: string;
  dayLabel: string;
  date: string;
  theme: StoryWeekDayTheme;
  objective: string;
  slots: StoryWeekSlot[];
  totalStories: number;
  ctaCount: number;
  hasBastidor: boolean;
  hasAutoridade: boolean;
  hasProcedimento: boolean;
  hasProvaConfianca: boolean;
  hasCtaDireto: boolean;
  status: StoryWeekBuilderStatus;
  warnings: string[];
};

export type StoryWeekPlan = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: StoryWeekDay[];
  totalStories: number;
  averageStoriesPerDay: number;
  daysBelowTarget: string[];
  missingSlotTypes: StorySlotType[];
  reusedMediaWarnings: string[];
  ethicalReviewItems: StoryWeekSlot[];
  funnelBalance: Record<ContentFunnelStage, number>;
  pillarBalance: Record<string, number>;
  status: StoryWeekBuilderStatus;
  warnings: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type StoryWeekSummary = {
  totalStories: number;
  averageStoriesPerDay: number;
  daysPlanned: number;
  daysBelowTarget: string[];
  totalNeedsReview: number;
  totalBlocked: number;
  totalApproved: number;
  highPrivacyRiskItems: number;
  totalCtas: number;
  totalDirectCtas: number;
  funnelBalance: Record<ContentFunnelStage, number>;
  pillarBalance: Record<string, number>;
  mainWarnings: string[];
};

export type StoryWeekExportDraft = {
  id: string;
  weekPlanId: string;
  dayLabel: string;
  totalStories: number;
  copyReadyText: string;
  markdownBrief: string;
  warnings: string[];
  status: StoryWeekBuilderStatus;
  createdAt: Date;
};

export type StoryWeekCtaSummary = {
  totalCtas: number;
  totalDirectCtas: number;
  daysWithDirectCta: string[];
};

export type StoryWeekEthicalReviewSummary = {
  totalItems: number;
  highRiskItems: number;
  patientMentions: number;
  resultMentions: number;
  beforeAfterMentions: number;
  testimonialMentions: number;
  warning: string;
  recommendedAction: string;
};

export type StoryWeekExportSummary = {
  totalDays: number;
  daysWithCopyReady: number;
  daysNeedingReview: number;
  readyDays: string[];
  warningCount: number;
  nextStep: string;
  drafts: StoryWeekExportDraft[];
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");
const targetStoriesPerDay = 10;

export const STORY_WEEK_SIMULATED_MANIFEST = [
  "cadu-consultorio-bastidor-01.jpg",
  "cadu-consultorio-bastidor-02.jpg",
  "cadu-centro-cirurgico-preparo-01.jpg",
  "bastidores-equipe-clinica-01.jpg",
  "autoridade-aula-cirurgia-01.jpg",
  "checklist-seguranca-cirurgica-01.jpg",
  "protese-silicone-explicacao-01.mp4",
  "protese-silicone-ml-300-01.mp4",
  "video-curto-protese-ml-01.mp4",
  "duvida-frequente-mamas-01.mp4",
  "story-caixinha-duvidas-mamas-01.jpg",
  "mamoplastia-redutora-consulta-01.jpg",
  "mamoplastia-redutora-explicacao-01.mp4",
  "conteudo-site-mamoplastia-01.jpg",
  "lipoaspiracao-planejamento-01.mp4",
  "lipoaspiracao-seguranca-01.jpg",
  "video-curto-lipo-nao-emagrece-01.mp4",
  "maternidade-naturalidade-01.jpg",
  "maternidade-pos-gestacao-01.mp4",
  "naturalidade-consulta-01.jpg",
  "reels-nem-toda-mulher-exagero-01.mp4",
  "resultado-3-meses-explicacao-01.mp4",
  "resultado-mamas-revisao-etica-01.jpg",
  "foto-paciente-antes-depois-revisar-01.jpg",
  "depoimento-paciente-revisar-01.mp4",
  "story-cta-avaliacao-01.jpg",
  "agenda-semana-clinica-01.jpg",
  "consulta-online-duvida-01.jpg",
  "rotina-pos-operatorio-01.jpg",
  "cadu-estudando-marketing-01.jpg",
  "bastidor-familia-humanizado-01.jpg",
  "centro-cirurgico-seguranca-equipe-02.jpg",
  "autoridade-congresso-cirurgia-01.jpg",
  "prova-confianca-checklist-01.jpg",
  "procedimento-mamas-planejamento-01.mp4",
  "procedimento-lipo-contorno-02.mp4",
  "mamoplastia-redutora-duvidas-02.mp4",
  "maternidade-autoestima-naturalidade-02.jpg",
  "story-cta-whatsapp-avaliacao-02.jpg",
  "agenda-avaliacao-semana-02.jpg",
  "bastidor-consultorio-humanizado-03.jpg",
  "seguranca-pos-operatorio-orientacoes-01.jpg"
];

const storySlotOrder: StorySlotType[] = [
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

const weekBlueprint: Array<{ dayLabel: string; date: string; theme: StoryWeekDayTheme; objective: string }> = [
  {
    dayLabel: "Segunda-feira",
    date: "2026-05-11",
    theme: "mamas_protese",
    objective: "Educar sobre mamas e protese, gerando conversas qualificadas."
  },
  {
    dayLabel: "Terça-feira",
    date: "2026-05-12",
    theme: "lipo_contorno",
    objective: "Quebrar mitos sobre lipoaspiracao e filtrar expectativas."
  },
  {
    dayLabel: "Quarta-feira",
    date: "2026-05-13",
    theme: "mamoplastia_redutora",
    objective: "Aprofundar um procedimento de alta intencao."
  },
  {
    dayLabel: "Quinta-feira",
    date: "2026-05-14",
    theme: "maternidade_naturalidade",
    objective: "Conectar emocionalmente com maternidade, naturalidade e autoestima."
  },
  {
    dayLabel: "Sexta-feira",
    date: "2026-05-15",
    theme: "prova_confianca",
    objective: "Reforcar seguranca, expectativa realista e confianca sem promessa de resultado."
  },
  {
    dayLabel: "Sábado",
    date: "2026-05-16",
    theme: "bastidores_rotina",
    objective: "Humanizar a presenca e manter cadencia leve."
  },
  {
    dayLabel: "Domingo",
    date: "2026-05-17",
    theme: "autoridade_segurança",
    objective: "Aquecer a audiencia e preparar o CTA da semana."
  }
];

const slotObjectives: Record<StorySlotType, string> = {
  human_bastidor: "Abrir o dia com presenca humana e contexto.",
  rotina_medica: "Mostrar rotina, preparo e cuidado sem expor pacientes.",
  autoridade: "Reforcar criterio tecnico e seguranca.",
  duvida_frequente: "Responder uma duvida frequente com linguagem educativa.",
  quebra_de_mito: "Corrigir uma expectativa simplificada.",
  prova_confianca: "Construir confianca sem promessa de resultado.",
  procedimento: "Conectar o tema do dia ao procedimento principal.",
  maternidade_naturalidade: "Trazer acolhimento, naturalidade e identidade.",
  cta_leve: "Abrir conversa sem pressao comercial.",
  cta_direto: "Direcionar para avaliacao com seguranca."
};

const slotKeywordHints: Record<StorySlotType, string[]> = {
  human_bastidor: ["bastidor", "bastidores", "rotina", "equipe", "consultorio", "familia", "humanizado"],
  rotina_medica: ["rotina", "clinica", "consultorio", "centro-cirurgico", "pos-operatorio", "preparo"],
  autoridade: ["autoridade", "aula", "cirurgia", "seguranca", "checklist", "congresso"],
  duvida_frequente: ["duvida", "frequente", "mamas", "protese", "lipo", "mamoplastia"],
  quebra_de_mito: ["nao-emagrece", "ml", "exagero", "mito", "naturalidade"],
  prova_confianca: ["autoridade", "checklist", "seguranca", "depoimento", "resultado", "paciente", "antes-depois", "confianca"],
  procedimento: ["protese", "silicone", "mamoplastia", "redutora", "lipoaspiracao", "contorno", "procedimento", "lipo"],
  maternidade_naturalidade: ["maternidade", "pos-gestacao", "naturalidade", "familia", "autoestima"],
  cta_leve: ["cta", "avaliacao", "consulta", "agenda", "duvida"],
  cta_direto: ["cta", "avaliacao", "consulta", "agenda", "whatsapp"]
};

const themeKeywordHints: Record<StoryWeekDayTheme, string[]> = {
  mamas_protese: ["protese", "silicone", "mamas", "ml"],
  lipo_contorno: ["lipo", "lipoaspiracao", "contorno", "nao-emagrece"],
  mamoplastia_redutora: ["mamoplastia", "redutora", "mamas"],
  maternidade_naturalidade: ["maternidade", "pos-gestacao", "naturalidade", "familia", "autoestima"],
  "autoridade_segurança": ["autoridade", "aula", "cirurgia", "seguranca", "checklist"],
  bastidores_rotina: ["bastidor", "bastidores", "rotina", "equipe", "consultorio"],
  prova_confianca: ["resultado", "depoimento", "paciente", "antes-depois", "seguranca", "checklist"],
  consulta_avaliacao: ["cta", "avaliacao", "consulta", "agenda", "whatsapp"]
};

export function buildStoryWeekPlanFromCatalog(manifestText = STORY_WEEK_SIMULATED_MANIFEST.join("\n")): StoryWeekPlan {
  const suggestions = generateMediaCatalogingSuggestions(parseMediaManifestText(manifestText, "simulated"));
  const usageCount = new Map<string, number>();
  const days = weekBlueprint.map((day) => buildStoryWeekDayFromCatalog(suggestions, day, usageCount));
  const totalStories = days.reduce((total, day) => total + day.totalStories, 0);
  const averageStoriesPerDay = roundToOne(days.length === 0 ? 0 : totalStories / days.length);
  const daysBelowTarget = getDaysBelowStoryTarget(days);
  const allSlots = days.flatMap((day) => day.slots);
  const funnelBalance = getStoryWeekFunnelBalance(allSlots);
  const pillarBalance = getStoryWeekPillarBalance(allSlots);
  const reusedMediaWarnings = buildReusedMediaWarnings(usageCount);
  const ethicalReviewItems = getStorySlotsNeedingReview(allSlots);
  const missingSlotTypes = getMissingSlotTypes(days);
  const warnings = getStoryWeekWarnings(days, reusedMediaWarnings, funnelBalance, missingSlotTypes);

  return {
    id: "story-week-plan-2026-05-11",
    weekLabel: "Semana de 11/05 a 17/05",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    days,
    totalStories,
    averageStoriesPerDay,
    daysBelowTarget,
    missingSlotTypes,
    reusedMediaWarnings,
    ethicalReviewItems,
    funnelBalance,
    pillarBalance,
    status: warnings.length > 0 || ethicalReviewItems.length > 0 ? "needs_review" : "draft",
    warnings,
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function buildStoryWeekDayFromCatalog(
  suggestions: MediaCatalogingSuggestion[],
  day = weekBlueprint[0],
  usageCount: Map<string, number> = new Map()
): StoryWeekDay {
  const slots = storySlotOrder.map((slotType, index) => buildStoryWeekSlot(slotType, day, index + 1, suggestions, usageCount));
  const ctaCount = slots.filter((slot) => slot.slotType === "cta_leve" || slot.slotType === "cta_direto").length;
  const warnings = validateStoryWeekDay({ dayLabel: day.dayLabel, slots, totalStories: slots.length });

  return {
    id: `story-week-day-${day.date}`,
    dayLabel: day.dayLabel,
    date: day.date,
    theme: day.theme,
    objective: day.objective,
    slots,
    totalStories: slots.length,
    ctaCount,
    hasBastidor: slots.some((slot) => slot.slotType === "human_bastidor"),
    hasAutoridade: slots.some((slot) => slot.slotType === "autoridade"),
    hasProcedimento: slots.some((slot) => slot.slotType === "procedimento"),
    hasProvaConfianca: slots.some((slot) => slot.slotType === "prova_confianca"),
    hasCtaDireto: slots.some((slot) => slot.slotType === "cta_direto"),
    status: warnings.length > 0 || slots.some((slot) => slot.status === "needs_review") ? "needs_review" : "draft",
    warnings
  };
}

export function buildStoryWeekSlot(
  slotType: StorySlotType,
  day = weekBlueprint[0],
  order = storySlotOrder.indexOf(slotType) + 1,
  suggestions: MediaCatalogingSuggestion[] = generateMediaCatalogingSuggestions(parseMediaManifestText(STORY_WEEK_SIMULATED_MANIFEST.join("\n"))),
  usageCount: Map<string, number> = new Map()
): StoryWeekSlot {
  const selected = selectMediaForStorySlot(suggestions, slotType, day.theme, usageCount);
  const ethicalWarnings = selected ? buildEthicalWarnings(selected) : ["Sem midia adequada para este slot; preencher manualmente antes de publicar."];
  const isHighRisk = selected?.suggestedPrivacyRisk === "high";
  const status: StoryWeekSlotStatus = !selected ? "needs_review" : isHighRisk || selected.status !== "ready_to_import" ? "needs_review" : "planned";

  if (selected) usageCount.set(selected.filename, (usageCount.get(selected.filename) ?? 0) + 1);

  return {
    id: `${day.date}-story-${order}-${slotType}`,
    dayLabel: day.dayLabel,
    date: day.date,
    order,
    slotType,
    theme: day.theme,
    objective: slotObjectives[slotType],
    suggestedFilename: selected?.filename ?? "",
    suggestedMediaId: selected?.id ?? "",
    suggestedText: generateStoryTextForSlot(slotType, day.theme, selected),
    stickerSuggestion: generateStickerSuggestionForSlot(slotType),
    cta: generateCTAForSlot(slotType),
    funnelStage: selected?.suggestedFunnelStage ?? defaultFunnelStageForSlot(slotType),
    pillar: selected?.suggestedPillar ?? "A revisar",
    privacyRisk: selected?.suggestedPrivacyRisk ?? "low",
    ethicalWarnings,
    confidence: selected?.confidence ?? "low",
    status,
    notes: selected
      ? "Sugestao criada por regras a partir do nome do arquivo; revisar antes de usar."
      : "Slot criado sem midia porque o manifesto nao trouxe sugestao adequada."
  };
}

export function selectMediaForStorySlot(
  suggestions: MediaCatalogingSuggestion[],
  slotType: StorySlotType,
  theme: StoryWeekDayTheme = "mamas_protese",
  usageCount: Map<string, number> = new Map()
): MediaCatalogingSuggestion | null {
  const ranked = suggestions
    .filter((suggestion) => suggestion.suggestedAssetType !== "unknown")
    .map((suggestion) => ({
      suggestion,
      score: scoreSuggestion(suggestion, slotType, theme, usageCount.get(suggestion.filename) ?? 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || confidenceValue(b.suggestion.confidence) - confidenceValue(a.suggestion.confidence));

  return ranked[0]?.suggestion ?? null;
}

export function generateStoryTextForSlot(slotType: StorySlotType, theme: StoryWeekDayTheme = "mamas_protese", suggestion?: MediaCatalogingSuggestion | null): string {
  if (slotType === "human_bastidor") return "Comecando a sequencia com bastidores reais da rotina, sem expor pacientes.";
  if (slotType === "rotina_medica") return "Antes de qualquer resultado, existe preparo, indicacao e seguranca.";
  if (slotType === "autoridade") return "Uma decisao cirurgica boa une desejo, anatomia, tecnica e criterio medico.";
  if (slotType === "duvida_frequente") return `Duvida frequente sobre ${themeLabel(theme).toLowerCase()}: o que precisa ser avaliado individualmente?`;
  if (slotType === "quebra_de_mito") return theme === "lipo_contorno" ? "Lipoaspiracao melhora contorno, mas nao e metodo de emagrecimento." : "Nem toda escolha cirurgica deve ser guiada por comparacao ou exagero.";
  if (slotType === "prova_confianca") return "Confianca vem de orientacao, acompanhamento e expectativa realista, nunca de promessa de resultado.";
  if (slotType === "procedimento") return suggestion?.suggestedPillar.includes("Mamoplastia") ? "Mamoplastia redutora nao e so diminuir a mama." : procedureTextForTheme(theme);
  if (slotType === "maternidade_naturalidade") return "Maternidade muda o corpo, mas nao precisa apagar a mulher.";
  if (slotType === "cta_leve") return "Se esse tema faz sentido para voce, acompanhe os proximos stories e envie sua duvida geral.";
  return "Quer entender se isso faz sentido para o seu caso? Fale com a equipe para avaliar com seguranca.";
}

export function generateStickerSuggestionForSlot(slotType: StorySlotType): string {
  return {
    human_bastidor: "Caixinha: o que voce quer ver nos bastidores?",
    rotina_medica: "Enquete: voce sabia dessa etapa?",
    autoridade: "Quiz rapido sobre seguranca.",
    duvida_frequente: "Caixinha de perguntas.",
    quebra_de_mito: "Sticker: mito ou verdade.",
    prova_confianca: "Slider: isso te transmite seguranca?",
    procedimento: "Pergunta: voce ja pesquisou sobre isso?",
    maternidade_naturalidade: "Enquete: naturalidade importa para voce?",
    cta_leve: "Caixa de interesse.",
    cta_direto: "Link para WhatsApp."
  }[slotType];
}

export function generateCTAForSlot(slotType: StorySlotType): string {
  return {
    human_bastidor: "Acompanhe a sequencia de hoje.",
    rotina_medica: "Envie uma duvida geral sobre preparacao.",
    autoridade: "Salve para rever antes da consulta.",
    duvida_frequente: "Mande uma duvida para proximos stories.",
    quebra_de_mito: "Compartilhe com quem esta pesquisando o tema.",
    prova_confianca: "Salve para lembrar da importancia do acompanhamento.",
    procedimento: "Leve essa pergunta para sua avaliacao.",
    maternidade_naturalidade: "Envie para alguem que valoriza naturalidade.",
    cta_leve: "Responda com a palavra duvida.",
    cta_direto: "Chame no WhatsApp para agendar avaliacao."
  }[slotType];
}

export function calculateStoryWeekSummary(plan: StoryWeekPlan): StoryWeekSummary {
  const allSlots = plan.days.flatMap((day) => day.slots);
  return {
    totalStories: plan.totalStories,
    averageStoriesPerDay: plan.averageStoriesPerDay,
    daysPlanned: plan.days.length,
    daysBelowTarget: plan.daysBelowTarget,
    totalNeedsReview: allSlots.filter((slot) => slot.status === "needs_review").length,
    totalBlocked: allSlots.filter((slot) => slot.status === "blocked").length,
    totalApproved: allSlots.filter((slot) => slot.status === "approved" || slot.status === "ready_to_publish").length,
    highPrivacyRiskItems: getHighRiskStorySlots(allSlots).length,
    totalCtas: allSlots.filter((slot) => slot.slotType === "cta_leve" || slot.slotType === "cta_direto").length,
    totalDirectCtas: allSlots.filter((slot) => slot.slotType === "cta_direto").length,
    funnelBalance: plan.funnelBalance,
    pillarBalance: plan.pillarBalance,
    mainWarnings: plan.warnings.slice(0, 8)
  };
}

export function validateStoryWeekDay(day: Pick<StoryWeekDay, "dayLabel" | "slots" | "totalStories">): string[] {
  const warnings: string[] = [];
  if (day.totalStories < targetStoriesPerDay) warnings.push(`${day.dayLabel}: abaixo da meta de 10 stories.`);
  if (!day.slots.some((slot) => slot.slotType === "human_bastidor")) warnings.push(`${day.dayLabel}: falta bastidor humano.`);
  if (!day.slots.some((slot) => slot.slotType === "autoridade")) warnings.push(`${day.dayLabel}: falta conteudo de autoridade.`);
  if (!day.slots.some((slot) => slot.slotType === "procedimento")) warnings.push(`${day.dayLabel}: falta conteudo de procedimento.`);
  if (!day.slots.some((slot) => slot.slotType === "cta_leve")) warnings.push(`${day.dayLabel}: falta CTA leve.`);
  if (!day.slots.some((slot) => slot.slotType === "cta_direto")) warnings.push(`${day.dayLabel}: falta CTA direto.`);
  if (day.slots.some((slot) => !slot.suggestedFilename)) warnings.push(`${day.dayLabel}: ha stories sem midia adequada.`);
  if (day.slots.some((slot) => slot.privacyRisk === "high")) warnings.push(`${day.dayLabel}: ha midias com risco de privacidade que exigem revisao etica.`);
  return unique(warnings);
}

export function validateStoryWeekPlan(plan: StoryWeekPlan): string[] {
  return getStoryWeekWarnings(plan.days, plan.reusedMediaWarnings, plan.funnelBalance, plan.missingSlotTypes);
}

export function getDaysBelowStoryTarget(days: StoryWeekDay[], target = targetStoriesPerDay): string[] {
  return days.filter((day) => day.totalStories < target).map((day) => day.dayLabel);
}

export function getStorySlotsNeedingReview(slots: StoryWeekSlot[]): StoryWeekSlot[] {
  return slots.filter((slot) => slot.status === "needs_review" || slot.ethicalWarnings.length > 0);
}

export function getHighRiskStorySlots(slots: StoryWeekSlot[]): StoryWeekSlot[] {
  return slots.filter((slot) => slot.privacyRisk === "high");
}

export function getStoryWeekWarnings(
  days: StoryWeekDay[],
  reusedMediaWarnings: string[] = [],
  funnelBalance: Record<ContentFunnelStage, number> = getStoryWeekFunnelBalance(days.flatMap((day) => day.slots)),
  missingSlotTypes: StorySlotType[] = getMissingSlotTypes(days)
): string[] {
  const allSlots = days.flatMap((day) => day.slots);
  const warnings = [
    "Planejamento gerado por regras a partir de nomes de arquivos simulados; exige revisao humana antes de publicar.",
    "Nenhum arquivo real e lido, enviado, analisado visualmente ou publicado nesta fase.",
    ...days.flatMap((day) => day.warnings),
    ...reusedMediaWarnings
  ];

  if (getDaysBelowStoryTarget(days).length > 0) warnings.push("Ha dias abaixo da meta de 10 stories.");
  if (getHighRiskStorySlots(allSlots).length > 0) warnings.push("Midias com paciente, resultado, depoimento ou antes/depois exigem revisao etica manual.");
  if (funnelBalance.TOFU > funnelBalance.MOFU + funnelBalance.BOFU) warnings.push("Excesso de TOFU; reforcar MOFU/BOFU antes de publicar.");
  if (funnelBalance.MOFU === 0) warnings.push("Ausencia de MOFU no plano semanal.");
  if (funnelBalance.BOFU === 0) warnings.push("Ausencia de BOFU no plano semanal.");
  if (missingSlotTypes.length > 0) warnings.push(`Tipos de story ausentes: ${missingSlotTypes.map(storySlotTypeLabel).join(", ")}.`);

  return unique(warnings);
}

export function getStoryWeekFunnelBalance(slots: StoryWeekSlot[]): Record<ContentFunnelStage, number> {
  return {
    TOFU: slots.filter((slot) => slot.funnelStage === "TOFU").length,
    MOFU: slots.filter((slot) => slot.funnelStage === "MOFU").length,
    BOFU: slots.filter((slot) => slot.funnelStage === "BOFU").length
  };
}

export function getStoryWeekPillarBalance(slots: StoryWeekSlot[]): Record<string, number> {
  return slots.reduce<Record<string, number>>((acc, slot) => {
    acc[slot.pillar] = (acc[slot.pillar] ?? 0) + 1;
    return acc;
  }, {});
}

export function generateStoryWeekExportDraft(plan: StoryWeekPlan, dayLabel = plan.days[0]?.dayLabel ?? "Semana"): StoryWeekExportDraft {
  const day = plan.days.find((item) => item.dayLabel === dayLabel) ?? plan.days[0];
  const warnings = day ? unique([...day.warnings, ...plan.warnings]) : plan.warnings;

  return {
    id: `story-week-export-${day?.date ?? plan.startDate}`,
    weekPlanId: plan.id,
    dayLabel,
    totalStories: day?.totalStories ?? plan.totalStories,
    copyReadyText: day ? generateCopyReadyStorySequence(day) : "",
    markdownBrief: day ? generateDailyStoriesMarkdownBrief(day) : "",
    warnings,
    status: warnings.length > 0 ? "needs_review" : "ready_to_export",
    createdAt: baseDate
  };
}

export function generateDailyStoriesMarkdownBrief(day: StoryWeekDay): string {
  const lines = [
    `# ${day.dayLabel} - ${themeLabel(day.theme)}`,
    "",
    `Objetivo: ${day.objective}`,
    "",
    ...day.slots.flatMap((slot) => [
      `## Story ${slot.order}: ${storySlotTypeLabel(slot.slotType)}`,
      `- Arquivo sugerido: ${slot.suggestedFilename || "preencher manualmente"}`,
      `- Texto: ${slot.suggestedText}`,
      `- Sticker: ${slot.stickerSuggestion}`,
      `- CTA: ${slot.cta}`,
      `- Funil: ${slot.funnelStage}`,
      `- Revisao: ${slot.ethicalWarnings.length > 0 ? slot.ethicalWarnings.join(" ") : "revisar antes de publicar"}`,
      ""
    ])
  ];
  return lines.join("\n");
}

export function generateCopyReadyStorySequence(day: StoryWeekDay): string {
  return day.slots
    .map((slot) => `Story ${slot.order} - ${storySlotTypeLabel(slot.slotType)}\nArquivo: ${slot.suggestedFilename || "sem midia definida"}\nTexto: ${slot.suggestedText}\nSticker: ${slot.stickerSuggestion}\nCTA: ${slot.cta}`)
    .join("\n\n");
}

export function groupStorySlotsByDay(slots: StoryWeekSlot[]): Record<string, StoryWeekSlot[]> {
  return slots.reduce<Record<string, StoryWeekSlot[]>>((acc, slot) => {
    acc[slot.dayLabel] = [...(acc[slot.dayLabel] ?? []), slot];
    return acc;
  }, {});
}

export function getStoryWeekNextActions(plan: StoryWeekPlan): string[] {
  const actions = [
    "Revisar midias com paciente, resultado, depoimento ou antes/depois antes de qualquer uso.",
    "Aprovar o plano diario antes de exportar para a Central de Publicacao.",
    "Conferir CTAs e stickers em cada sequencia antes da publicacao manual.",
    "Registrar resultados depois da publicacao para alimentar a auditoria semanal."
  ];
  if (plan.daysBelowTarget.length > 0) actions.unshift("Completar dias abaixo da meta de 10 stories.");
  if (plan.reusedMediaWarnings.length > 0) actions.unshift("Substituir midias repetidas quando houver alternativa no acervo.");
  return unique(actions);
}

export function getStoryWeekOperationalStatus(plan: StoryWeekPlan): StoryWeekOperationalStatus {
  const reviewQueue = getStoryWeekReviewQueue(plan);
  const blockedSlots = plan.days.flatMap((day) => day.slots).filter((slot) => slot.status === "blocked");

  if (blockedSlots.length > 0) return "critical";
  if (reviewQueue.length > 0 || plan.warnings.length > 0 || plan.reusedMediaWarnings.length > 0) return "attention";
  return "healthy";
}

export function getStoryWeekMainAttention(plan: StoryWeekPlan): string {
  const ethicalSummary = getStoryWeekEthicalReviewSummary(plan);

  if (ethicalSummary.totalItems > 0) return "Revisar midias com paciente, resultado, depoimento ou antes/depois antes de qualquer uso.";
  if (plan.daysBelowTarget.length > 0) return "Completar dias abaixo da meta de 10 stories antes de exportar.";
  if (plan.reusedMediaWarnings.length > 0) return "Revisar midias repetidas e substituir quando houver alternativa no acervo.";
  return "Conferir texto, sticker e CTA de cada story antes da publicacao manual.";
}

export function getStoryWeekNextRecommendedAction(plan: StoryWeekPlan): string {
  if (getStoryWeekReviewQueue(plan).length > 0) return "Aprovar ou ajustar os slots em revisao.";
  if (plan.daysBelowTarget.length > 0) return "Completar os dias abaixo da meta de 10 stories.";
  return "Exportar a sequencia e publicar manualmente apos aprovacao.";
}

export function getStoryWeekReviewQueue(plan: StoryWeekPlan): StoryWeekSlot[] {
  return plan.days
    .flatMap((day) => day.slots)
    .filter((slot) => slot.status === "needs_review" || slot.status === "blocked" || slot.privacyRisk === "high" || slot.ethicalWarnings.length > 0);
}

export function getStoryWeekReadyDays(plan: StoryWeekPlan): StoryWeekDay[] {
  return plan.days.filter((day) => day.totalStories >= targetStoriesPerDay && !day.slots.some((slot) => slot.status === "blocked"));
}

export function getStoryWeekDayStatus(day: StoryWeekDay): StoryWeekBuilderStatus {
  if (day.slots.some((slot) => slot.status === "blocked")) return "blocked";
  if (day.slots.some((slot) => slot.status === "needs_review" || slot.privacyRisk === "high" || slot.ethicalWarnings.length > 0)) return "needs_review";
  if (day.totalStories >= targetStoriesPerDay) return "ready_to_export";
  return "draft";
}

export function getStoryWeekCtaSummary(plan: StoryWeekPlan): StoryWeekCtaSummary {
  const daysWithDirectCta = plan.days.filter((day) => day.slots.some((slot) => slot.slotType === "cta_direto")).map((day) => day.dayLabel);
  return {
    totalCtas: plan.days.flatMap((day) => day.slots).filter((slot) => slot.slotType === "cta_leve" || slot.slotType === "cta_direto").length,
    totalDirectCtas: plan.days.flatMap((day) => day.slots).filter((slot) => slot.slotType === "cta_direto").length,
    daysWithDirectCta
  };
}

export function getStoryWeekEthicalReviewSummary(plan: StoryWeekPlan): StoryWeekEthicalReviewSummary {
  const queue = getStoryWeekReviewQueue(plan);
  const filenames = queue.map((slot) => slot.suggestedFilename.toLowerCase());
  const countKeyword = (keyword: string) => filenames.filter((filename) => filename.includes(keyword)).length;

  return {
    totalItems: queue.length,
    highRiskItems: queue.filter((slot) => slot.privacyRisk === "high").length,
    patientMentions: countKeyword("paciente"),
    resultMentions: countKeyword("resultado"),
    beforeAfterMentions: countKeyword("antes-depois"),
    testimonialMentions: countKeyword("depoimento"),
    warning: queue.length > 0 ? "Nenhum item de risco deve ser usado sem aprovacao manual." : "Sem itens criticos identificados no plano simulado.",
    recommendedAction: queue.length > 0 ? "Revisar arquivo, contexto, consentimento e checklist etico antes de publicar." : "Manter conferencia manual antes da publicacao."
  };
}

export function getStoryWeekExportSummary(plan: StoryWeekPlan): StoryWeekExportSummary {
  const drafts = plan.days.map((day) => generateStoryWeekExportDraft(plan, day.dayLabel));
  return {
    totalDays: plan.days.length,
    daysWithCopyReady: drafts.filter((draft) => draft.copyReadyText.length > 0 && draft.markdownBrief.length > 0).length,
    daysNeedingReview: drafts.filter((draft) => draft.status === "needs_review").length,
    readyDays: getStoryWeekReadyDays(plan).map((day) => day.dayLabel),
    warningCount: drafts.reduce((total, draft) => total + draft.warnings.length, 0),
    nextStep: "Revisar avisos, aprovar manualmente e exportar apenas depois da validacao.",
    drafts
  };
}

export function getStoryWeekOperationalChecklist(plan: StoryWeekPlan): string[] {
  const checklist = [
    "Revisar itens de risco.",
    "Aprovar plano de segunda-feira.",
    "Aprovar plano da semana.",
    "Exportar sequencia copy-ready.",
    "Publicar manualmente apos aprovacao.",
    "Registrar resultado.",
    "Alimentar dados semanais depois."
  ];
  if (getStoryWeekReviewQueue(plan).length > 0) checklist.unshift("Resolver slots em revisao antes de publicar.");
  return unique(checklist);
}

export function storyWeekThemeLabel(theme: StoryWeekDayTheme): string {
  return themeLabel(theme);
}

export function storyWeekStatusLabel(status: StoryWeekBuilderStatus | StoryWeekSlotStatus): string {
  return {
    draft: "Rascunho",
    needs_review: "Precisa revisao",
    approved: "Aprovado",
    ready_to_export: "Pronto para exportar",
    exported: "Exportado",
    blocked: "Bloqueado",
    planned: "Planejado",
    ready_to_publish: "Pronto para publicar",
    published: "Publicado"
  }[status];
}

export function storySlotTypeLabel(type: StorySlotType): string {
  return {
    human_bastidor: "Bastidor humano",
    rotina_medica: "Rotina medica",
    autoridade: "Autoridade tecnica",
    duvida_frequente: "Duvida frequente",
    quebra_de_mito: "Quebra de mito",
    prova_confianca: "Prova de confianca",
    procedimento: "Procedimento",
    maternidade_naturalidade: "Maternidade/naturalidade",
    cta_leve: "CTA leve",
    cta_direto: "CTA direto"
  }[type];
}

function scoreSuggestion(suggestion: MediaCatalogingSuggestion, slotType: StorySlotType, theme: StoryWeekDayTheme, usedCount: number): number {
  const keywords = suggestionKeywords(suggestion);
  const slotScore = slotKeywordHints[slotType].filter((keyword) => keywords.includes(keyword)).length * 3;
  const themeScore = themeKeywordHints[theme].filter((keyword) => keywords.includes(keyword)).length * 2;
  const useScore = suggestion.suggestedUse === "stories" || suggestion.suggestedUse === "all" ? 2 : suggestion.suggestedUse === "reels" || suggestion.suggestedUse === "shorts" ? 1 : 0;
  const riskPenalty = suggestion.suggestedPrivacyRisk === "high" && slotType !== "prova_confianca" ? 2 : 0;
  const blockedPenalty = suggestion.status === "blocked" ? 2 : 0;
  const reusePenalty = usedCount * 2;
  return Math.max(0, slotScore + themeScore + useScore - riskPenalty - blockedPenalty - reusePenalty);
}

function suggestionKeywords(suggestion: MediaCatalogingSuggestion): string[] {
  return unique([...suggestion.suggestedTags, ...suggestion.filename.toLowerCase().split(/[-_.]+/)]);
}

function buildEthicalWarnings(suggestion: MediaCatalogingSuggestion): string[] {
  const keywords = suggestionKeywords(suggestion);
  const warnings = [...suggestion.warnings];
  if (suggestion.suggestedPrivacyRisk === "high") warnings.push("Exige revisao etica/manual antes de uso.");
  if (["paciente", "resultado", "antes-depois", "depoimento"].some((keyword) => keywords.includes(keyword))) {
    warnings.push("Possivel paciente, resultado, depoimento ou antes/depois; nao usar automaticamente.");
  }
  if (suggestion.status === "blocked") warnings.push("Item bloqueado na catalogacao; so pode ser reavaliado manualmente.");
  return unique(warnings);
}

function defaultFunnelStageForSlot(slotType: StorySlotType): ContentFunnelStage {
  if (slotType === "cta_direto" || slotType === "prova_confianca") return "BOFU";
  if (slotType === "autoridade" || slotType === "duvida_frequente" || slotType === "procedimento" || slotType === "cta_leve") return "MOFU";
  return "TOFU";
}

function procedureTextForTheme(theme: StoryWeekDayTheme): string {
  if (theme === "mamas_protese") return "Protese de silicone nao se escolhe so por ml.";
  if (theme === "lipo_contorno") return "Lipoaspiracao melhora contorno, mas nao substitui emagrecimento.";
  if (theme === "mamoplastia_redutora") return "Mamoplastia redutora tambem envolve proporcao, conforto e seguranca.";
  return "O procedimento deve partir de indicacao, limites e expectativa realista.";
}

function getMissingSlotTypes(days: StoryWeekDay[]): StorySlotType[] {
  const present = new Set(days.flatMap((day) => day.slots.map((slot) => slot.slotType)));
  return storySlotOrder.filter((slotType) => !present.has(slotType));
}

function buildReusedMediaWarnings(usageCount: Map<string, number>): string[] {
  return Array.from(usageCount.entries())
    .filter(([, count]) => count > 1)
    .map(([filename, count]) => `${filename} foi reutilizado ${count} vezes; revisar repeticao na semana.`);
}

function confidenceValue(confidence: MediaCatalogingConfidence): number {
  return { low: 1, medium: 2, high: 3 }[confidence];
}

function themeLabel(theme: StoryWeekDayTheme): string {
  return {
    mamas_protese: "Mamas e protese",
    lipo_contorno: "Lipoaspiracao e contorno",
    mamoplastia_redutora: "Mamoplastia redutora",
    maternidade_naturalidade: "Maternidade e naturalidade",
    "autoridade_segurança": "Autoridade e seguranca",
    bastidores_rotina: "Bastidores e rotina",
    prova_confianca: "Prova de confianca",
    consulta_avaliacao: "Consulta e avaliacao"
  }[theme];
}

function roundToOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
