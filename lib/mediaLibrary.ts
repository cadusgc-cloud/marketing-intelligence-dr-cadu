import type { ContentFunnelStage } from "@/lib/contentStudio";

export type MediaAssetType = "photo" | "video" | "carousel" | "graphic" | "document";
export type MediaOrientation = "vertical" | "horizontal" | "square" | "unknown";
export type MediaUsageStatus = "unused" | "planned" | "used" | "archived" | "blocked";
export type MediaApprovalStatus = "not_reviewed" | "approved" | "needs_adjustment" | "blocked";
export type MediaSuggestedUse = "stories" | "reels" | "shorts" | "tiktok" | "feed" | "site" | "all";
export type PatientPrivacyRisk = "low" | "medium" | "high";

export type MediaAsset = {
  id: string;
  filename: string;
  displayName: string;
  filePath: string;
  assetType: MediaAssetType;
  orientation: MediaOrientation;
  source: string;
  theme: string;
  pillar: string;
  funnelStage: ContentFunnelStage;
  suggestedUse: MediaSuggestedUse;
  description: string;
  tags: string[];
  usageStatus: MediaUsageStatus;
  approvalStatus: MediaApprovalStatus;
  ethicalNotes: string;
  patientPrivacyRisk: PatientPrivacyRisk;
  createdAt: Date;
  updatedAt: Date;
};

export type StorySlotType =
  | "human_bastidor"
  | "rotina_medica"
  | "autoridade"
  | "duvida_frequente"
  | "quebra_de_mito"
  | "prova_confianca"
  | "procedimento"
  | "maternidade_naturalidade"
  | "cta_leve"
  | "cta_direto";

export type StorySlotStatus = "planned" | "needs_review" | "approved" | "published" | "blocked";
export type DailyStoryPlanStatus = "draft" | "needs_review" | "approved" | "ready_to_publish" | "published";

export type DailyStorySlot = {
  id: string;
  dayLabel: string;
  order: number;
  slotType: StorySlotType;
  objective: string;
  mediaAssetId: string;
  suggestedText: string;
  stickerSuggestion: string;
  cta: string;
  funnelStage: ContentFunnelStage;
  status: StorySlotStatus;
  notes: string;
};

export type DailyStoryPlan = {
  id: string;
  date: string;
  dayLabel: string;
  theme: string;
  objective: string;
  slots: DailyStorySlot[];
  totalStories: number;
  status: DailyStoryPlanStatus;
  approvalStatus: MediaApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type WeeklyStoryPlan = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  dailyPlans: DailyStoryPlan[];
  totalStoriesPlanned: number;
  averageStoriesPerDay: number;
  missingDays: string[];
  daysBelowTarget: string[];
  recommendedAdjustments: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type MediaLibrarySummary = {
  totalAssets: number;
  photos: number;
  videos: number;
  approvedAssets: number;
  unusedAssets: number;
  highPrivacyRiskAssets: number;
  assetsByPillar: Record<string, number>;
};

export type WeeklyStoryPlanSummary = {
  totalStoriesPlanned: number;
  averageStoriesPerDay: number;
  daysBelowTarget: string[];
  missingDays: string[];
  recommendedAdjustments: string[];
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");
const defaultTargetStoriesPerDay = 10;
const expectedWeekDays = ["Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado", "Domingo"];

export const MEDIA_ASSETS: MediaAsset[] = [
  asset("cadu-consultorio-bastidor-01", "cadu-consultorio-bastidor-01.jpg", "Bastidor no consultorio", "photo", "vertical", "Bastidores e rotina", "Bastidores e rotina", "TOFU", "stories", ["bastidor", "consultorio", "humano"], "unused", "approved", "Sem paciente identificavel.", "low"),
  asset("cadu-centro-cirurgico-preparo-01", "cadu-centro-cirurgico-preparo-01.jpg", "Preparo no centro cirurgico", "photo", "vertical", "Seguranca cirurgica", "Naturalidade e seguranca", "MOFU", "stories", ["rotina", "centro cirurgico", "seguranca"], "planned", "approved", "Usar sem pacientes ou dados sensiveis.", "medium"),
  asset("protese-silicone-explicacao-01", "protese-silicone-explicacao-01.mp4", "Explicacao sobre protese de silicone", "video", "vertical", "Protese de silicone", "Mamas e protese de silicone", "MOFU", "all", ["protese", "mamas", "duvida frequente"], "planned", "approved", "Conteudo educativo, sem promessa.", "low"),
  asset("mamoplastia-redutora-consulta-01", "mamoplastia-redutora-consulta-01.jpg", "Consulta sobre mamoplastia redutora", "photo", "vertical", "Mamoplastia redutora", "Mamoplastia redutora", "MOFU", "stories", ["consulta", "redutora", "mamas"], "unused", "not_reviewed", "Revisar enquadramento antes de uso.", "medium"),
  asset("lipoaspiracao-planejamento-01", "lipoaspiracao-planejamento-01.mp4", "Planejamento de lipoaspiracao", "video", "vertical", "Lipoaspiracao", "Lipoaspiracao e contorno corporal", "BOFU", "all", ["lipo", "planejamento", "procedimento"], "planned", "approved", "Evitar qualquer promessa de resultado.", "low"),
  asset("maternidade-naturalidade-01", "maternidade-naturalidade-01.jpg", "Maternidade e naturalidade", "photo", "square", "Maternidade", "Maternidade e pos-gestacao", "TOFU", "stories", ["maternidade", "naturalidade", "acolhimento"], "unused", "approved", "Imagem humanizada sem exposicao sensivel.", "low"),
  asset("resultado-3-meses-explicacao-01", "resultado-3-meses-explicacao-01.mp4", "Resultado com 3 meses explicado", "video", "vertical", "Resultado com seguranca", "Naturalidade e seguranca", "BOFU", "reels", ["resultado", "pos-operatorio", "prova"], "planned", "needs_adjustment", "Exige revisao etica antes de usar como prova.", "medium"),
  asset("bastidores-equipe-clinica-01", "bastidores-equipe-clinica-01.jpg", "Equipe da clinica nos bastidores", "photo", "horizontal", "Equipe", "Bastidores e rotina", "TOFU", "stories", ["equipe", "bastidor", "rotina"], "unused", "approved", "Conferir autorizacao da equipe.", "low"),
  asset("autoridade-aula-cirurgia-01", "autoridade-aula-cirurgia-01.jpg", "Aula e autoridade medica", "photo", "horizontal", "Autoridade", "Autoridade medica", "MOFU", "feed", ["autoridade", "aula", "educacao"], "unused", "approved", "Uso institucional permitido.", "low"),
  asset("duvida-frequente-mamas-01", "duvida-frequente-mamas-01.mp4", "Duvida frequente sobre mamas", "video", "vertical", "Duvidas sobre mamas", "Mamas e protese de silicone", "MOFU", "stories", ["duvida", "mamas", "faq"], "planned", "approved", "Sem dado pessoal.", "low"),
  asset("checklist-seguranca-cirurgica-01", "checklist-seguranca-cirurgica-01.jpg", "Checklist de seguranca cirurgica", "graphic", "square", "Seguranca", "Naturalidade e seguranca", "MOFU", "stories", ["seguranca", "checklist", "autoridade"], "unused", "approved", "Peca educativa.", "low"),
  asset("rotina-pos-operatorio-01", "rotina-pos-operatorio-01.jpg", "Rotina de pos-operatorio", "photo", "vertical", "Pos-operatorio", "Naturalidade e seguranca", "BOFU", "stories", ["pos-operatorio", "rotina", "confianca"], "used", "approved", "Sem paciente identificavel.", "low"),
  asset("cadu-estudando-marketing-01", "cadu-estudando-marketing-01.jpg", "Dr. Cadu estudando marketing", "photo", "square", "Bastidor estrategico", "Bastidores e rotina", "TOFU", "stories", ["bastidor", "estudo", "humano"], "unused", "approved", "Adequado para humanizacao.", "low"),
  asset("naturalidade-consulta-01", "naturalidade-consulta-01.jpg", "Consulta sobre naturalidade", "photo", "vertical", "Naturalidade", "Naturalidade e seguranca", "BOFU", "stories", ["naturalidade", "consulta", "confianca"], "unused", "not_reviewed", "Checar privacidade do ambiente.", "medium"),
  asset("story-cta-avaliacao-01", "story-cta-avaliacao-01.jpg", "CTA para avaliacao", "graphic", "vertical", "CTA", "Autoridade medica", "BOFU", "stories", ["cta", "avaliacao", "whatsapp"], "planned", "approved", "CTA informativo, sem promessa.", "low"),
  asset("video-curto-protese-ml-01", "video-curto-protese-ml-01.mp4", "Video curto sobre protese e ml", "video", "vertical", "Protese por ml", "Mamas e protese de silicone", "MOFU", "reels", ["protese", "ml", "mito"], "unused", "approved", "Evitar promessa de resultado.", "low"),
  asset("video-curto-lipo-nao-emagrece-01", "video-curto-lipo-nao-emagrece-01.mp4", "Lipo nao e emagrecimento", "video", "vertical", "Lipo nao emagrece", "Lipoaspiracao e contorno corporal", "TOFU", "tiktok", ["lipo", "mito", "educativo"], "unused", "approved", "Conteudo educativo.", "low"),
  asset("bastidor-familia-humanizado-01", "bastidor-familia-humanizado-01.jpg", "Bastidor humanizado em familia", "photo", "vertical", "Humanizacao", "Maternidade e pos-gestacao", "TOFU", "stories", ["familia", "humanizacao", "bastidor"], "unused", "needs_adjustment", "Revisar exposicao de terceiros.", "high"),
  asset("conteudo-site-mamoplastia-01", "conteudo-site-mamoplastia-01.jpg", "Imagem para conteudo de mamoplastia", "document", "horizontal", "Conteudo de site", "Mamoplastia redutora", "MOFU", "site", ["site", "mamoplastia", "educativo"], "archived", "approved", "Apenas apoio editorial.", "low"),
  asset("reels-nem-toda-mulher-exagero-01", "reels-nem-toda-mulher-exagero-01.mp4", "Nem toda mulher quer exagero", "video", "vertical", "Naturalidade", "Naturalidade e seguranca", "BOFU", "all", ["naturalidade", "reels", "posicionamento"], "planned", "approved", "Mensagem segura e sem promessa.", "low"),
  asset("story-caixinha-duvidas-mamas-01", "story-caixinha-duvidas-mamas-01.jpg", "Caixinha de duvidas sobre mamas", "graphic", "vertical", "Duvidas", "Mamas e protese de silicone", "TOFU", "stories", ["caixinha", "duvidas", "stories"], "unused", "approved", "Pedir perguntas gerais, sem caso clinico.", "low"),
  asset("arquivo-antigo-resultado-nao-aprovado-01", "arquivo-antigo-resultado-nao-aprovado-01.jpg", "Resultado antigo nao aprovado", "photo", "vertical", "Arquivo antigo", "Naturalidade e seguranca", "BOFU", "stories", ["resultado", "bloqueado", "privacidade"], "blocked", "blocked", "Bloqueado por risco de privacidade e revisao etica.", "high")
];

export function getMediaAssets(assets: MediaAsset[] = MEDIA_ASSETS): MediaAsset[] {
  return [...assets];
}

export function filterMediaAssetsByType(assets: MediaAsset[], type: MediaAssetType): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.assetType === type);
}

export function filterMediaAssetsByPillar(assets: MediaAsset[], pillar: string): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.pillar === pillar);
}

export function filterMediaAssetsByUsageStatus(assets: MediaAsset[], status: MediaUsageStatus): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.usageStatus === status);
}

export function filterMediaAssetsByApprovalStatus(assets: MediaAsset[], status: MediaApprovalStatus): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.approvalStatus === status);
}

export function getApprovedMediaAssets(assets: MediaAsset[] = MEDIA_ASSETS): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.approvalStatus === "approved" && assetItem.usageStatus !== "blocked");
}

export function getUnusedMediaAssets(assets: MediaAsset[] = MEDIA_ASSETS): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.usageStatus === "unused");
}

export function getMediaAssetsBySuggestedUse(assets: MediaAsset[], suggestedUse: MediaSuggestedUse): MediaAsset[] {
  return assets.filter((assetItem) => assetItem.suggestedUse === suggestedUse || assetItem.suggestedUse === "all");
}

export function recommendMediaForStorySlot(slotType: StorySlotType, assets: MediaAsset[] = MEDIA_ASSETS): MediaAsset | null {
  const approvedStoryAssets = getApprovedMediaAssets(assets).filter((assetItem) => assetItem.suggestedUse === "stories" || assetItem.suggestedUse === "all");
  const tagHints = slotTypeTagHints[slotType];
  const match = approvedStoryAssets.find((assetItem) => tagHints.some((tag) => assetItem.tags.includes(tag) || assetItem.theme.toLowerCase().includes(tag)));

  return match ?? approvedStoryAssets[0] ?? null;
}

export function buildDailyStoryPlan(
  date = "2026-05-11",
  dayLabel = "Segunda-feira",
  theme = "Mamas, seguranca e naturalidade",
  assets: MediaAsset[] = MEDIA_ASSETS
): DailyStoryPlan {
  const slots = dailySlotBlueprint.map((blueprint, index) => {
    const media = recommendMediaForStorySlot(blueprint.slotType, assets);
    const status: StorySlotStatus = media?.approvalStatus === "approved" ? "planned" : "needs_review";

    return {
      id: `${date}-story-${index + 1}`,
      dayLabel,
      order: index + 1,
      slotType: blueprint.slotType,
      objective: blueprint.objective,
      mediaAssetId: media?.id ?? "",
      suggestedText: blueprint.suggestedText,
      stickerSuggestion: blueprint.stickerSuggestion,
      cta: blueprint.cta,
      funnelStage: blueprint.funnelStage,
      status,
      notes: blueprint.notes
    };
  });

  return {
    id: `daily-story-plan-${date}`,
    date,
    dayLabel,
    theme,
    objective: "Manter presenca diaria com bastidor, autoridade, educacao e CTA para avaliacao.",
    slots,
    totalStories: slots.length,
    status: "draft",
    approvalStatus: "not_reviewed",
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function buildWeeklyStoryPlan(assets: MediaAsset[] = MEDIA_ASSETS): WeeklyStoryPlan {
  const days = [
    buildDailyStoryPlan("2026-05-11", "Segunda-feira", "Protese de silicone sem simplificar por ml", assets),
    buildDailyStoryPlan("2026-05-12", "Terca-feira", "Lipoaspiracao e contorno corporal", assets),
    buildDailyStoryPlan("2026-05-13", "Quarta-feira", "Mamoplastia redutora com seguranca", assets),
    buildDailyStoryPlan("2026-05-14", "Quinta-feira", "Maternidade, naturalidade e acolhimento", assets),
    buildDailyStoryPlan("2026-05-15", "Sexta-feira", "Resultado com 3 meses explicado com responsabilidade", assets),
    buildDailyStoryPlan("2026-05-16", "Sabado", "Nem toda mulher quer exagero", assets),
    buildDailyStoryPlan("2026-05-17", "Domingo", "Bastidores e autoridade medica", assets)
  ];

  return createWeeklyStoryPlan("Semana de 11/05 a 17/05", "2026-05-11", "2026-05-17", days);
}

export function calculateStoriesPerDayAverage(dailyPlans: DailyStoryPlan[]): number {
  if (dailyPlans.length === 0) return 0;
  return roundToOne(dailyPlans.reduce((total, plan) => total + plan.totalStories, 0) / dailyPlans.length);
}

export function getDaysBelowStoryTarget(dailyPlans: DailyStoryPlan[], target = defaultTargetStoriesPerDay): string[] {
  return dailyPlans.filter((plan) => plan.totalStories < target).map((plan) => plan.dayLabel);
}

export function getMissingStoryPlanDays(dailyPlans: DailyStoryPlan[], expectedDays: string[] = expectedWeekDays): string[] {
  const plannedDays = new Set(dailyPlans.map((plan) => plan.dayLabel));
  return expectedDays.filter((day) => !plannedDays.has(day));
}

export function summarizeMediaLibrary(assets: MediaAsset[] = MEDIA_ASSETS): MediaLibrarySummary {
  return {
    totalAssets: assets.length,
    photos: assets.filter((assetItem) => assetItem.assetType === "photo").length,
    videos: assets.filter((assetItem) => assetItem.assetType === "video").length,
    approvedAssets: getApprovedMediaAssets(assets).length,
    unusedAssets: getUnusedMediaAssets(assets).length,
    highPrivacyRiskAssets: assets.filter((assetItem) => assetItem.patientPrivacyRisk === "high").length,
    assetsByPillar: countBy(assets.map((assetItem) => assetItem.pillar))
  };
}

export function summarizeWeeklyStoryPlan(plan: WeeklyStoryPlan): WeeklyStoryPlanSummary {
  return {
    totalStoriesPlanned: plan.dailyPlans.reduce((total, dailyPlan) => total + dailyPlan.totalStories, 0),
    averageStoriesPerDay: calculateStoriesPerDayAverage(plan.dailyPlans),
    daysBelowTarget: getDaysBelowStoryTarget(plan.dailyPlans),
    missingDays: getMissingStoryPlanDays(plan.dailyPlans),
    recommendedAdjustments: buildWeeklyAdjustments(plan.dailyPlans)
  };
}

export function validateDailyStoryPlan(plan: DailyStoryPlan, assets: MediaAsset[] = MEDIA_ASSETS, target = defaultTargetStoriesPerDay): string[] {
  const warnings: string[] = [];
  if (plan.totalStories < target) warnings.push(`${plan.dayLabel}: plano abaixo da meta de ${target} stories.`);
  if (!plan.slots.some((slot) => slot.slotType === "cta_leve")) warnings.push("Plano diario sem CTA leve.");
  if (!plan.slots.some((slot) => slot.slotType === "cta_direto")) warnings.push("Plano diario sem CTA direto.");
  if (!plan.slots.some((slot) => slot.slotType === "human_bastidor")) warnings.push("Plano diario sem bastidor humano.");
  if (!plan.slots.some((slot) => slot.slotType === "autoridade")) warnings.push("Plano diario sem conteudo de autoridade.");
  if (!plan.slots.some((slot) => slot.slotType === "procedimento")) warnings.push("Plano diario sem conteudo de procedimento.");
  if (!plan.slots.some((slot) => slot.slotType === "cta_leve" || slot.slotType === "cta_direto")) warnings.push("Plano diario sem CTA.");

  const assetsById = new Map(assets.map((assetItem) => [assetItem.id, assetItem]));
  plan.slots.forEach((slot) => {
    const media = assetsById.get(slot.mediaAssetId);
    if (!media) {
      warnings.push(`Story ${slot.order}: midia sugerida ausente no acervo simulado.`);
      return;
    }
    if (media.approvalStatus !== "approved" && slot.status !== "needs_review" && slot.status !== "blocked") {
      warnings.push(`Story ${slot.order}: midia sem aprovacao precisa ficar em revisao.`);
    }
    if (media.patientPrivacyRisk === "high") warnings.push(`Story ${slot.order}: midia com risco alto de privacidade.`);
    if (media.usageStatus === "blocked" || media.approvalStatus === "blocked") warnings.push(`Story ${slot.order}: midia bloqueada nao deve ser usada.`);
  });

  return unique(warnings);
}

export function validateWeeklyStoryPlan(plan: WeeklyStoryPlan, target = defaultTargetStoriesPerDay): string[] {
  const warnings: string[] = [];
  const belowTarget = getDaysBelowStoryTarget(plan.dailyPlans, target);
  const missingDays = getMissingStoryPlanDays(plan.dailyPlans);
  const stages = plan.dailyPlans.flatMap((dailyPlan) => dailyPlan.slots.map((slot) => slot.funnelStage));
  const tofu = stages.filter((stage) => stage === "TOFU").length;
  const mofu = stages.filter((stage) => stage === "MOFU").length;
  const bofu = stages.filter((stage) => stage === "BOFU").length;

  if (belowTarget.length > 0) warnings.push(`Dias abaixo da meta de ${target} stories: ${belowTarget.join(", ")}.`);
  if (missingDays.length > 0) warnings.push(`Dias sem planejamento de stories: ${missingDays.join(", ")}.`);
  if (tofu > mofu + bofu) warnings.push("Excesso de TOFU sem volume suficiente de MOFU/BOFU.");
  if (bofu === 0) warnings.push("Semana sem stories de fundo de funil.");

  return unique(warnings);
}

export function getStoryPlanWarnings(dailyPlan: DailyStoryPlan, weeklyPlan: WeeklyStoryPlan, assets: MediaAsset[] = MEDIA_ASSETS): string[] {
  return unique([...validateDailyStoryPlan(dailyPlan, assets), ...validateWeeklyStoryPlan(weeklyPlan), ...getMediaLibraryWarnings(assets)]);
}

export function getMediaLibraryWarnings(assets: MediaAsset[] = MEDIA_ASSETS): string[] {
  const warnings = [
    "Nesta fase, as midias sao simuladas; nenhum arquivo real e lido, enviado ou publicado.",
    "Importacao do acervo real, reconhecimento visual, OCR e publicacao automatica ainda nao foram implementados."
  ];
  const highRisk = assets.filter((assetItem) => assetItem.patientPrivacyRisk === "high").length;
  const pendingApproval = assets.filter((assetItem) => assetItem.approvalStatus !== "approved").length;
  const blocked = assets.filter((assetItem) => assetItem.usageStatus === "blocked" || assetItem.approvalStatus === "blocked").length;

  if (pendingApproval > 0) warnings.push(`${pendingApproval} midia(s) ainda precisam de aprovacao antes de entrar em sequencias reais.`);
  if (highRisk > 0) warnings.push(`${highRisk} midia(s) tem risco alto de privacidade e exigem revisao manual.`);
  if (blocked > 0) warnings.push(`${blocked} midia(s) estao bloqueadas e nao devem ser usadas.`);

  return warnings;
}

export function assetTypeLabel(type: MediaAssetType): string {
  return {
    photo: "Foto",
    video: "Video",
    carousel: "Carrossel",
    graphic: "Arte",
    document: "Documento"
  }[type];
}

export function orientationLabel(orientation: MediaOrientation): string {
  return {
    vertical: "Vertical",
    horizontal: "Horizontal",
    square: "Quadrado",
    unknown: "Nao informado"
  }[orientation];
}

export function usageStatusLabel(status: MediaUsageStatus): string {
  return {
    unused: "Nao usada",
    planned: "Planejada",
    used: "Usada",
    archived: "Arquivada",
    blocked: "Bloqueada"
  }[status];
}

export function approvalStatusLabel(status: MediaApprovalStatus): string {
  return {
    not_reviewed: "Nao revisada",
    approved: "Aprovada",
    needs_adjustment: "Precisa ajuste",
    blocked: "Bloqueada"
  }[status];
}

export function suggestedUseLabel(use: MediaSuggestedUse): string {
  return {
    stories: "Stories",
    reels: "Reels",
    shorts: "Shorts",
    tiktok: "TikTok",
    feed: "Feed",
    site: "Site",
    all: "Todos"
  }[use];
}

export function storySlotTypeLabel(type: StorySlotType): string {
  return {
    human_bastidor: "Bastidor humano",
    rotina_medica: "Rotina medica",
    autoridade: "Autoridade",
    duvida_frequente: "Duvida frequente",
    quebra_de_mito: "Quebra de mito",
    prova_confianca: "Prova de confianca",
    procedimento: "Procedimento",
    maternidade_naturalidade: "Maternidade/naturalidade",
    cta_leve: "CTA leve",
    cta_direto: "CTA direto"
  }[type];
}

export function funnelStageLabel(stage: ContentFunnelStage): string {
  return {
    TOFU: "Topo de funil",
    MOFU: "Meio de funil",
    BOFU: "Fundo de funil"
  }[stage];
}

function asset(
  id: string,
  filename: string,
  displayName: string,
  assetType: MediaAssetType,
  orientation: MediaOrientation,
  theme: string,
  pillar: string,
  funnelStage: ContentFunnelStage,
  suggestedUse: MediaSuggestedUse,
  tags: string[],
  usageStatus: MediaUsageStatus,
  approvalStatus: MediaApprovalStatus,
  ethicalNotes: string,
  patientPrivacyRisk: PatientPrivacyRisk
): MediaAsset {
  return {
    id,
    filename,
    displayName,
    filePath: `/simulado/acervo-dr-cadu/${filename}`,
    assetType,
    orientation,
    source: "Acervo simulado do Dr. Cadu",
    theme,
    pillar,
    funnelStage,
    suggestedUse,
    description: `Midia simulada para ${theme.toLowerCase()}.`,
    tags,
    usageStatus,
    approvalStatus,
    ethicalNotes,
    patientPrivacyRisk,
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

const slotTypeTagHints: Record<StorySlotType, string[]> = {
  human_bastidor: ["bastidor", "humano"],
  rotina_medica: ["rotina", "consultorio", "centro cirurgico"],
  autoridade: ["autoridade", "aula", "checklist"],
  duvida_frequente: ["duvida", "faq", "caixinha"],
  quebra_de_mito: ["mito", "lipo", "ml"],
  prova_confianca: ["prova", "resultado", "confianca", "pos-operatorio"],
  procedimento: ["procedimento", "planejamento", "protese", "lipo"],
  maternidade_naturalidade: ["maternidade", "naturalidade", "acolhimento"],
  cta_leve: ["cta", "caixinha", "duvidas"],
  cta_direto: ["cta", "avaliacao", "whatsapp"]
};

const dailySlotBlueprint: Array<Omit<DailyStorySlot, "id" | "dayLabel" | "order" | "mediaAssetId" | "status">> = [
  {
    slotType: "human_bastidor",
    objective: "Abrir o dia com presenca humana e proximidade.",
    suggestedText: "Bom dia. Hoje vou mostrar um pouco dos bastidores e da rotina por aqui.",
    stickerSuggestion: "Caixinha: o que voce quer acompanhar hoje?",
    cta: "Acompanhe a sequencia do dia.",
    funnelStage: "TOFU",
    notes: "Humanizacao sem expor pacientes."
  },
  {
    slotType: "rotina_medica",
    objective: "Mostrar consistencia de rotina e cuidado.",
    suggestedText: "Antes de falar de resultado, existe preparo, indicacao e seguranca.",
    stickerSuggestion: "Enquete: voce sabia dessa etapa?",
    cta: "Envie sua duvida geral sobre preparacao.",
    funnelStage: "TOFU",
    notes: "Evitar detalhes sensiveis de agenda ou paciente."
  },
  {
    slotType: "autoridade",
    objective: "Reforcar criterio tecnico e autoridade medica.",
    suggestedText: "Uma decisao cirurgica boa precisa unir desejo, anatomia e seguranca.",
    stickerSuggestion: "Quiz rapido.",
    cta: "Salve para rever antes da consulta.",
    funnelStage: "MOFU",
    notes: "Conteudo educativo."
  },
  {
    slotType: "duvida_frequente",
    objective: "Responder uma duvida comum e reduzir ansiedade.",
    suggestedText: "Uma pergunta frequente: como saber se meu caso precisa de avaliacao individual?",
    stickerSuggestion: "Caixinha de perguntas.",
    cta: "Mande uma duvida geral para proximos stories.",
    funnelStage: "MOFU",
    notes: "Nao responder caso clinico individual."
  },
  {
    slotType: "quebra_de_mito",
    objective: "Corrigir uma expectativa simplificada.",
    suggestedText: "Mito: escolher procedimento ou volume por comparacao com outra pessoa.",
    stickerSuggestion: "Mito ou verdade.",
    cta: "Compartilhe com quem esta pesquisando o tema.",
    funnelStage: "TOFU",
    notes: "Falar sem assustar nem prometer."
  },
  {
    slotType: "prova_confianca",
    objective: "Construir confianca sem promessa de resultado.",
    suggestedText: "Confianca tambem vem de acompanhamento, orientacao e revisao de expectativas.",
    stickerSuggestion: "Slider: isso te tranquiliza?",
    cta: "Salve para lembrar do acompanhamento.",
    funnelStage: "BOFU",
    notes: "Evitar antes/depois irregular."
  },
  {
    slotType: "procedimento",
    objective: "Conectar o tema da semana ao procedimento principal.",
    suggestedText: "Quando falamos deste procedimento, a indicacao vem antes da tecnica.",
    stickerSuggestion: "Pergunta: voce ja pesquisou sobre isso?",
    cta: "Leve essa pergunta para sua avaliacao.",
    funnelStage: "MOFU",
    notes: "Manter tom educativo."
  },
  {
    slotType: "maternidade_naturalidade",
    objective: "Trazer acolhimento e naturalidade para o funil.",
    suggestedText: "Naturalidade nao e falta de mudanca. E respeitar identidade e proporcao.",
    stickerSuggestion: "Enquete: voce prefere naturalidade?",
    cta: "Envie para alguem que valoriza esse cuidado.",
    funnelStage: "TOFU",
    notes: "Acolhimento sem promessa."
  },
  {
    slotType: "cta_leve",
    objective: "Abrir conversa sem pressao comercial.",
    suggestedText: "Se esse tema faz sentido para voce, acompanhe os proximos conteudos da semana.",
    stickerSuggestion: "Link ou caixa de interesse.",
    cta: "Responder story com a palavra duvida.",
    funnelStage: "MOFU",
    notes: "CTA leve para engajamento."
  },
  {
    slotType: "cta_direto",
    objective: "Direcionar interessadas para avaliacao com seguranca.",
    suggestedText: "Para entender indicacao, limites e seguranca no seu caso, o caminho e uma avaliacao.",
    stickerSuggestion: "Link para WhatsApp.",
    cta: "Chamar no WhatsApp para agendar avaliacao.",
    funnelStage: "BOFU",
    notes: "CTA direto sem promessa de resultado."
  }
];

function createWeeklyStoryPlan(weekLabel: string, startDate: string, endDate: string, dailyPlans: DailyStoryPlan[]): WeeklyStoryPlan {
  const totalStoriesPlanned = dailyPlans.reduce((total, plan) => total + plan.totalStories, 0);
  const averageStoriesPerDay = calculateStoriesPerDayAverage(dailyPlans);
  const missingDays = getMissingStoryPlanDays(dailyPlans);
  const daysBelowTarget = getDaysBelowStoryTarget(dailyPlans);
  const recommendedAdjustments = buildWeeklyAdjustments(dailyPlans);

  return {
    id: `weekly-story-plan-${startDate}`,
    weekLabel,
    startDate,
    endDate,
    dailyPlans,
    totalStoriesPlanned,
    averageStoriesPerDay,
    missingDays,
    daysBelowTarget,
    recommendedAdjustments,
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

function buildWeeklyAdjustments(dailyPlans: DailyStoryPlan[]): string[] {
  const adjustments: string[] = [];
  const belowTarget = getDaysBelowStoryTarget(dailyPlans);
  const missingDays = getMissingStoryPlanDays(dailyPlans);
  const stages = dailyPlans.flatMap((dailyPlan) => dailyPlan.slots.map((slot) => slot.funnelStage));
  const bofuCount = stages.filter((stage) => stage === "BOFU").length;
  const mofuCount = stages.filter((stage) => stage === "MOFU").length;

  if (belowTarget.length > 0) adjustments.push(`Completar ${belowTarget.join(", ")} ate chegar perto de 10 stories.`);
  if (missingDays.length > 0) adjustments.push(`Criar plano para ${missingDays.join(", ")}.`);
  if (mofuCount === 0 || bofuCount === 0) adjustments.push("Adicionar stories de meio e fundo de funil para equilibrar a semana.");
  if (adjustments.length === 0) adjustments.push("Manter cadencia diaria e revisar aprovacao das midias antes de publicar.");

  return adjustments;
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function roundToOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
