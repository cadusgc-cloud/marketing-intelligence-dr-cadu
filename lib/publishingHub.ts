export type PublishingChannel =
  | "meta_instagram_feed"
  | "meta_instagram_reels"
  | "meta_instagram_stories"
  | "facebook_page"
  | "youtube_shorts"
  | "youtube_video"
  | "tiktok"
  | "website_article"
  | "website_page";

export type PublishingStatus = "draft" | "needs_review" | "approved" | "ready_to_schedule" | "scheduled" | "published" | "blocked" | "error";
export type ApprovalStatus = "not_reviewed" | "needs_adjustment" | "approved_by_cadu" | "blocked_by_ethics";
export type PublishingMediaType = "video" | "image" | "carousel" | "text" | "mixed";
export type PublishingSourceFormat = "stories" | "reels" | "shorts" | "tiktok" | "carousel" | "all";
export type PublishingFunnelStage = "TOFU" | "MOFU" | "BOFU";

export type EthicalChecklist = {
  hasMedicalApproval: boolean;
  noPromiseOfResult: boolean;
  noSensationalism: boolean;
  noIrregularBeforeAfter: boolean;
  noPriceOrPromotion: boolean;
  noGuaranteeOfTransformation: boolean;
  hasAppropriateCTA: boolean;
  respectsPatientPrivacy: boolean;
  isEducationalOrInformational: boolean;
};

export type PlatformPayload = {
  platform: string;
  title: string;
  caption: string;
  description: string;
  scheduledAt: string;
  mediaType: PublishingMediaType;
  destination: string;
  status: PublishingStatus;
  warnings: string[];
};

export type PublishingItem = {
  id: string;
  contentId: string;
  title: string;
  pillar: string;
  funnelStage: PublishingFunnelStage;
  channel: PublishingChannel;
  suggestedDate: string;
  suggestedTime: string;
  publishingStatus: PublishingStatus;
  approvalStatus: ApprovalStatus;
  caption: string;
  titleForPlatform: string;
  description: string;
  cta: string;
  hashtags: string[];
  mediaType: PublishingMediaType;
  sourceFormat: PublishingSourceFormat;
  ethicalChecklist: EthicalChecklist;
  platformPayload: PlatformPayload;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PublishingHubSummary = {
  totalItems: number;
  readyForApproval: number;
  approvedByCadu: number;
  readyToSchedule: number;
  blockedByChecklist: number;
  simulatedPublished: number;
  byPlatform: Record<string, number>;
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");

const completeChecklist: EthicalChecklist = {
  hasMedicalApproval: true,
  noPromiseOfResult: true,
  noSensationalism: true,
  noIrregularBeforeAfter: true,
  noPriceOrPromotion: true,
  noGuaranteeOfTransformation: true,
  hasAppropriateCTA: true,
  respectsPatientPrivacy: true,
  isEducationalOrInformational: true
};

const needsMedicalReview: EthicalChecklist = {
  ...completeChecklist,
  hasMedicalApproval: false
};

const beforeAfterRisk: EthicalChecklist = {
  ...completeChecklist,
  hasMedicalApproval: false,
  noIrregularBeforeAfter: false
};

const promiseRisk: EthicalChecklist = {
  ...completeChecklist,
  noPromiseOfResult: false,
  noGuaranteeOfTransformation: false
};

function makeItem(input: Omit<PublishingItem, "platformPayload" | "createdAt" | "updatedAt">): PublishingItem {
  const itemWithoutPayload = {
    ...input,
    createdAt: baseDate,
    updatedAt: baseDate
  };

  return {
    ...itemWithoutPayload,
    platformPayload: generatePlatformPayload(itemWithoutPayload)
  };
}

export const PUBLISHING_ITEMS: PublishingItem[] = [
  makeItem({
    id: "silicone-reels",
    contentId: "silicone-nao-e-so-ml",
    title: "Prótese de silicone não se escolhe só por ml",
    pillar: "Mamas e prótese de silicone",
    funnelStage: "MOFU",
    channel: "meta_instagram_reels",
    suggestedDate: "2026-05-11",
    suggestedTime: "19:30",
    publishingStatus: "ready_to_schedule",
    approvalStatus: "approved_by_cadu",
    caption: "A escolha da prótese é técnica, individual e precisa respeitar o corpo real.",
    titleForPlatform: "Prótese de silicone: por que ml não é tudo",
    description: "Roteiro educativo para reduzir comparação por volume e reforçar planejamento individual.",
    cta: "Salve para lembrar quais fatores discutir na consulta.",
    hashtags: ["#cirurgiaplastica", "#protesedesilicone", "#naturalidade"],
    mediaType: "video",
    sourceFormat: "reels",
    ethicalChecklist: completeChecklist,
    notes: "Conteúdo educativo, sem promessa de resultado."
  }),
  makeItem({
    id: "silicone-youtube-shorts",
    contentId: "silicone-nao-e-so-ml",
    title: "Prótese de silicone não se escolhe só por ml",
    pillar: "Mamas e prótese de silicone",
    funnelStage: "MOFU",
    channel: "youtube_shorts",
    suggestedDate: "2026-05-11",
    suggestedTime: "20:00",
    publishingStatus: "ready_to_schedule",
    approvalStatus: "approved_by_cadu",
    caption: "O mesmo volume pode ter resultados diferentes em corpos diferentes.",
    titleForPlatform: "Silicone: ml não decide sozinho",
    description: "Short educativo para reforçar avaliação médica individualizada.",
    cta: "Acompanhe mais conteúdos educativos sobre cirurgia plástica.",
    hashtags: ["#shorts", "#protesedesilicone", "#cirurgiaplastica"],
    mediaType: "video",
    sourceFormat: "shorts",
    ethicalChecklist: completeChecklist,
    notes: "Mesmo conceito do Reels, adaptado para Shorts."
  }),
  makeItem({
    id: "lipo-reels",
    contentId: "lipo-nao-e-emagrecimento",
    title: "Lipoaspiração não é emagrecimento",
    pillar: "Lipoaspiração e contorno corporal",
    funnelStage: "MOFU",
    channel: "meta_instagram_reels",
    suggestedDate: "2026-05-12",
    suggestedTime: "19:00",
    publishingStatus: "needs_review",
    approvalStatus: "needs_adjustment",
    caption: "Lipoaspiração é cirurgia de contorno corporal, não atalho para emagrecimento.",
    titleForPlatform: "Lipo não é emagrecimento",
    description: "Conteúdo de qualificação de expectativa antes da consulta.",
    cta: "Salve antes de comparar promessas na internet.",
    hashtags: ["#lipoaspiracao", "#contornocorporal", "#seguranca"],
    mediaType: "video",
    sourceFormat: "reels",
    ethicalChecklist: needsMedicalReview,
    notes: "Precisa revisão médica final antes de agendar."
  }),
  makeItem({
    id: "lipo-tiktok",
    contentId: "lipo-nao-e-emagrecimento",
    title: "Lipoaspiração não é emagrecimento",
    pillar: "Lipoaspiração e contorno corporal",
    funnelStage: "MOFU",
    channel: "tiktok",
    suggestedDate: "2026-05-12",
    suggestedTime: "20:30",
    publishingStatus: "needs_review",
    approvalStatus: "needs_adjustment",
    caption: "Se a expectativa é emagrecer, a indicação precisa ser revista com cuidado.",
    titleForPlatform: "Antes de pensar em lipo, veja isso",
    description: "Versão com gancho mais direto para TikTok, mantendo tom educativo.",
    cta: "Salve para rever com calma.",
    hashtags: ["#tiktoksaude", "#lipoaspiracao", "#cirurgiaplastica"],
    mediaType: "video",
    sourceFormat: "tiktok",
    ethicalChecklist: needsMedicalReview,
    notes: "Sem promessa, mas exige validação do tom."
  }),
  makeItem({
    id: "lipo-stories",
    contentId: "lipo-nao-e-emagrecimento",
    title: "Lipoaspiração não é emagrecimento",
    pillar: "Lipoaspiração e contorno corporal",
    funnelStage: "TOFU",
    channel: "meta_instagram_stories",
    suggestedDate: "2026-05-12",
    suggestedTime: "12:30",
    publishingStatus: "approved",
    approvalStatus: "approved_by_cadu",
    caption: "Sequência de Stories com enquete e CTA educativo.",
    titleForPlatform: "Mito ou verdade: lipo emagrece?",
    description: "Stories de apoio para sustentar o tema do Reels.",
    cta: "Envie sua dúvida geral sobre contorno corporal.",
    hashtags: [],
    mediaType: "mixed",
    sourceFormat: "stories",
    ethicalChecklist: completeChecklist,
    notes: "Pode virar apoio no dia do Reels."
  }),
  makeItem({
    id: "redutora-reels",
    contentId: "redutora-nao-e-so-diminuir",
    title: "Mamoplastia redutora não é só diminuir a mama",
    pillar: "Mamoplastia redutora",
    funnelStage: "BOFU",
    channel: "meta_instagram_reels",
    suggestedDate: "2026-05-13",
    suggestedTime: "19:30",
    publishingStatus: "ready_to_schedule",
    approvalStatus: "approved_by_cadu",
    caption: "Redutora envolve proporção, conforto, forma e planejamento individual.",
    titleForPlatform: "Mamoplastia redutora vai além do volume",
    description: "Conteúdo para explicar a cirurgia de forma completa e responsável.",
    cta: "Compartilhe com alguém que pesquisa redução mamária.",
    hashtags: ["#mamoplastiaredutora", "#cirurgiaplastica", "#saudedamulher"],
    mediaType: "video",
    sourceFormat: "reels",
    ethicalChecklist: completeChecklist,
    notes: "Aprovado para agendamento simulado."
  }),
  makeItem({
    id: "redutora-site",
    contentId: "redutora-nao-e-so-diminuir",
    title: "Mamoplastia redutora não é só diminuir a mama",
    pillar: "Mamoplastia redutora",
    funnelStage: "BOFU",
    channel: "website_article",
    suggestedDate: "2026-05-14",
    suggestedTime: "09:00",
    publishingStatus: "draft",
    approvalStatus: "not_reviewed",
    caption: "Artigo educativo para site.",
    titleForPlatform: "O que considerar antes da mamoplastia redutora",
    description: "Texto-base para SEO institucional, sem promessa de resultado.",
    cta: "Leia outros conteúdos educativos no site.",
    hashtags: [],
    mediaType: "text",
    sourceFormat: "all",
    ethicalChecklist: needsMedicalReview,
    notes: "Ainda precisa revisão e adaptação para site."
  }),
  makeItem({
    id: "maternidade-stories",
    contentId: "maternidade-reconhecer",
    title: "Depois da maternidade, muitas mulheres querem se reconhecer",
    pillar: "Maternidade e pós-gestação",
    funnelStage: "TOFU",
    channel: "meta_instagram_stories",
    suggestedDate: "2026-05-15",
    suggestedTime: "11:00",
    publishingStatus: "approved",
    approvalStatus: "approved_by_cadu",
    caption: "Sequência de acolhimento com CTA para conteúdos educativos.",
    titleForPlatform: "Corpo, maternidade e reconhecimento",
    description: "Stories com tom acolhedor, sem indução de procedimento.",
    cta: "Acompanhe conteúdos educativos sobre pós-gestação.",
    hashtags: [],
    mediaType: "mixed",
    sourceFormat: "stories",
    ethicalChecklist: completeChecklist,
    notes: "Manter linguagem acolhedora e sem promessa."
  }),
  makeItem({
    id: "maternidade-reels",
    contentId: "maternidade-reconhecer",
    title: "Depois da maternidade, muitas mulheres querem se reconhecer",
    pillar: "Maternidade e pós-gestação",
    funnelStage: "TOFU",
    channel: "meta_instagram_reels",
    suggestedDate: "2026-05-15",
    suggestedTime: "19:00",
    publishingStatus: "needs_review",
    approvalStatus: "needs_adjustment",
    caption: "Não é sobre apagar a maternidade. É sobre conversar com segurança.",
    titleForPlatform: "Depois da maternidade",
    description: "Reels de conexão para topo de funil.",
    cta: "Envie para uma mãe que precisa ouvir isso com calma.",
    hashtags: ["#maternidade", "#posgestacao", "#cirurgiaplastica"],
    mediaType: "video",
    sourceFormat: "reels",
    ethicalChecklist: needsMedicalReview,
    notes: "Revisar se o CTA não personaliza promessa."
  }),
  makeItem({
    id: "resultado-tres-meses",
    contentId: "resultado-tres-meses",
    title: "Resultado com 3 meses: o que já dá para avaliar",
    pillar: "Naturalidade e segurança",
    funnelStage: "BOFU",
    channel: "meta_instagram_reels",
    suggestedDate: "2026-05-16",
    suggestedTime: "19:30",
    publishingStatus: "blocked",
    approvalStatus: "blocked_by_ethics",
    caption: "Resultado cirúrgico amadurece e não deve ser vendido como garantia.",
    titleForPlatform: "3 meses de pós-operatório: o que observar",
    description: "Conteúdo sensível por mencionar resultado. Precisa revisão ética antes de qualquer agendamento.",
    cta: "Salve para entender a evolução com calma.",
    hashtags: ["#posoperatorio", "#seguranca", "#cirurgiaplastica"],
    mediaType: "video",
    sourceFormat: "shorts",
    ethicalChecklist: beforeAfterRisk,
    notes: "Bloqueado até revisar risco de antes/depois e aprovação médica."
  }),
  makeItem({
    id: "naturalidade-tiktok",
    contentId: "nem-toda-mulher-exagero",
    title: "Nem toda mulher quer exagero",
    pillar: "Naturalidade e segurança",
    funnelStage: "BOFU",
    channel: "tiktok",
    suggestedDate: "2026-05-17",
    suggestedTime: "18:30",
    publishingStatus: "scheduled",
    approvalStatus: "approved_by_cadu",
    caption: "Naturalidade também é escolha e precisa de planejamento técnico.",
    titleForPlatform: "Nem toda cirurgia precisa parecer exagerada",
    description: "Vídeo curto sobre naturalidade, proporção e identidade.",
    cta: "Salve se naturalidade faz parte do resultado que você procura.",
    hashtags: ["#naturalidade", "#cirurgiaplastica", "#tiktoksaude"],
    mediaType: "video",
    sourceFormat: "tiktok",
    ethicalChecklist: completeChecklist,
    notes: "Agendamento simulado para TikTok."
  }),
  makeItem({
    id: "naturalidade-facebook",
    contentId: "nem-toda-mulher-exagero",
    title: "Nem toda mulher quer exagero",
    pillar: "Naturalidade e segurança",
    funnelStage: "BOFU",
    channel: "facebook_page",
    suggestedDate: "2026-05-17",
    suggestedTime: "19:00",
    publishingStatus: "ready_to_schedule",
    approvalStatus: "approved_by_cadu",
    caption: "Naturalidade e proporção também são objetivos legítimos no planejamento.",
    titleForPlatform: "Naturalidade como escolha",
    description: "Adaptação do conteúdo para página do Facebook.",
    cta: "Leia e compartilhe com quem valoriza naturalidade.",
    hashtags: ["#naturalidade", "#seguranca"],
    mediaType: "video",
    sourceFormat: "reels",
    ethicalChecklist: completeChecklist,
    notes: "Distribuição cruzada simulada."
  }),
  makeItem({
    id: "bastidores-stories",
    contentId: "bastidores-autoridade",
    title: "Bastidores e autoridade médica",
    pillar: "Autoridade médica",
    funnelStage: "TOFU",
    channel: "meta_instagram_stories",
    suggestedDate: "2026-05-18",
    suggestedTime: "08:30",
    publishingStatus: "published",
    approvalStatus: "approved_by_cadu",
    caption: "Rotina, educação e bastidores com foco institucional.",
    titleForPlatform: "Bastidores do cuidado",
    description: "Stories simulados já publicados para autoridade médica.",
    cta: "Acompanhe a rotina e conteúdos educativos.",
    hashtags: [],
    mediaType: "mixed",
    sourceFormat: "stories",
    ethicalChecklist: completeChecklist,
    notes: "Publicado simulado, sem integração real."
  }),
  makeItem({
    id: "website-page-ethics",
    contentId: "seguranca-processo",
    title: "Segurança no processo cirúrgico",
    pillar: "Naturalidade e segurança",
    funnelStage: "MOFU",
    channel: "website_page",
    suggestedDate: "2026-05-19",
    suggestedTime: "09:00",
    publishingStatus: "blocked",
    approvalStatus: "blocked_by_ethics",
    caption: "Página institucional sobre segurança e indicação responsável.",
    titleForPlatform: "Segurança em cirurgia plástica",
    description: "Rascunho de página para site, bloqueado por trecho promocional no texto original.",
    cta: "Conheça conteúdos educativos.",
    hashtags: [],
    mediaType: "text",
    sourceFormat: "all",
    ethicalChecklist: promiseRisk,
    notes: "Remover qualquer promessa de transformação antes de aprovar."
  })
];

export function getPublishingItems(items: PublishingItem[] = PUBLISHING_ITEMS): PublishingItem[] {
  return [...items];
}

export function filterPublishingItemsByChannel(items: PublishingItem[], channel: PublishingChannel): PublishingItem[] {
  return items.filter((item) => item.channel === channel);
}

export function filterPublishingItemsByStatus(items: PublishingItem[], status: PublishingStatus): PublishingItem[] {
  return items.filter((item) => item.publishingStatus === status);
}

export function filterPublishingItemsByApproval(items: PublishingItem[], approval: ApprovalStatus): PublishingItem[] {
  return items.filter((item) => item.approvalStatus === approval);
}

export function getItemsReadyForApproval(items: PublishingItem[]): PublishingItem[] {
  return items.filter((item) => item.approvalStatus === "not_reviewed" || item.approvalStatus === "needs_adjustment" || item.publishingStatus === "needs_review");
}

export function getItemsReadyToSchedule(items: PublishingItem[]): PublishingItem[] {
  return items.filter((item) => validateEthicalChecklist(item).recommendedStatus === "ready_to_schedule");
}

export function getBlockedItems(items: PublishingItem[]): PublishingItem[] {
  return items.filter((item) => validateEthicalChecklist(item).recommendedStatus === "blocked" || item.publishingStatus === "blocked");
}

export function validateEthicalChecklist(item: Pick<PublishingItem, "approvalStatus" | "ethicalChecklist">): {
  valid: boolean;
  missing: (keyof EthicalChecklist | "approvalStatus")[];
  recommendedStatus: PublishingStatus;
} {
  const missing: (keyof EthicalChecklist | "approvalStatus")[] = [];
  const required: (keyof EthicalChecklist)[] = [
    "hasMedicalApproval",
    "noPromiseOfResult",
    "noSensationalism",
    "noIrregularBeforeAfter",
    "noPriceOrPromotion",
    "noGuaranteeOfTransformation",
    "hasAppropriateCTA",
    "respectsPatientPrivacy"
  ];

  if (item.approvalStatus !== "approved_by_cadu") missing.push("approvalStatus");
  for (const key of required) {
    if (!item.ethicalChecklist[key]) missing.push(key);
  }

  if (missing.includes("noPromiseOfResult") || missing.includes("noIrregularBeforeAfter") || missing.includes("respectsPatientPrivacy")) {
    return { valid: false, missing, recommendedStatus: "blocked" };
  }

  if (missing.length > 0) return { valid: false, missing, recommendedStatus: "needs_review" };
  return { valid: true, missing, recommendedStatus: "ready_to_schedule" };
}

export function generatePlatformPayload(item: Pick<PublishingItem, "channel" | "titleForPlatform" | "caption" | "description" | "suggestedDate" | "suggestedTime" | "mediaType" | "publishingStatus">): PlatformPayload {
  const scheduledAt = `${item.suggestedDate}T${item.suggestedTime}:00`;
  return {
    platform: channelLabel(item.channel),
    title: item.titleForPlatform,
    caption: item.caption,
    description: item.description,
    scheduledAt,
    mediaType: item.mediaType,
    destination: channelDestination(item.channel),
    status: item.publishingStatus,
    warnings: getPublishingWarnings()
  };
}

export function summarizePublishingHub(items: PublishingItem[]): PublishingHubSummary {
  return {
    totalItems: items.length,
    readyForApproval: getItemsReadyForApproval(items).length,
    approvedByCadu: filterPublishingItemsByApproval(items, "approved_by_cadu").length,
    readyToSchedule: getItemsReadyToSchedule(items).length,
    blockedByChecklist: getBlockedItems(items).length,
    simulatedPublished: filterPublishingItemsByStatus(items, "published").length,
    byPlatform: getPublishingItemsByPlatform(items)
  };
}

export function getPublishingWarnings(): string[] {
  return [
    "Login/API Meta ainda não foi implementado.",
    "Upload de mídia ainda não foi implementado.",
    "Agendamento real ainda não foi implementado.",
    "Publicação real ainda não foi implementada.",
    "Integração com site ainda não foi implementada.",
    "Persistência ainda não foi implementada."
  ];
}

export function getPublishingItemsByPlatform(items: PublishingItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const platform = platformGroup(item.channel);
    acc[platform] = (acc[platform] ?? 0) + 1;
    return acc;
  }, {});
}

export function getNextPublishingQueue(items: PublishingItem[], limit = 5): PublishingItem[] {
  return [...items]
    .filter((item) => item.publishingStatus === "ready_to_schedule" || item.publishingStatus === "scheduled" || item.publishingStatus === "approved")
    .sort((a, b) => `${a.suggestedDate} ${a.suggestedTime}`.localeCompare(`${b.suggestedDate} ${b.suggestedTime}`))
    .slice(0, limit);
}

export function channelLabel(channel: PublishingChannel): string {
  return {
    meta_instagram_feed: "Instagram feed",
    meta_instagram_reels: "Instagram Reels",
    meta_instagram_stories: "Instagram Stories",
    facebook_page: "Facebook",
    youtube_shorts: "YouTube Shorts",
    youtube_video: "YouTube",
    tiktok: "TikTok",
    website_article: "Artigo do site",
    website_page: "Página do site"
  }[channel];
}

export function publishingStatusLabel(status: PublishingStatus): string {
  return {
    draft: "Rascunho",
    needs_review: "Precisa revisão",
    approved: "Aprovado",
    ready_to_schedule: "Pronto para agendar",
    scheduled: "Agendado",
    published: "Publicado simulado",
    blocked: "Bloqueado",
    error: "Erro"
  }[status];
}

export function approvalStatusLabel(status: ApprovalStatus): string {
  return {
    not_reviewed: "Não revisado",
    needs_adjustment: "Precisa ajuste",
    approved_by_cadu: "Aprovado pelo Dr. Cadu",
    blocked_by_ethics: "Bloqueado por ética"
  }[status];
}

export function funnelStageLabel(stage: PublishingFunnelStage): string {
  return {
    TOFU: "Topo de funil",
    MOFU: "Meio de funil",
    BOFU: "Fundo de funil"
  }[stage];
}

function platformGroup(channel: PublishingChannel): string {
  if (channel.startsWith("meta_instagram")) return "Instagram";
  if (channel === "facebook_page") return "Facebook";
  if (channel.startsWith("youtube")) return "YouTube";
  if (channel === "tiktok") return "TikTok";
  return "Site";
}

function channelDestination(channel: PublishingChannel): string {
  return {
    meta_instagram_feed: "@drcadugazzinelli/feed",
    meta_instagram_reels: "@drcadugazzinelli/reels",
    meta_instagram_stories: "@drcadugazzinelli/stories",
    facebook_page: "Página Facebook Dr. Cadu",
    youtube_shorts: "Canal YouTube Shorts",
    youtube_video: "Canal YouTube",
    tiktok: "Perfil TikTok",
    website_article: "Blog do site",
    website_page: "Página institucional do site"
  }[channel];
}
