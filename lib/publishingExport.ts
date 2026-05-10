import {
  PUBLISHING_ITEMS,
  approvalStatusLabel,
  channelLabel,
  generatePlatformPayload,
  getPublishingWarnings,
  validateEthicalChecklist,
  type EthicalChecklist,
  type PlatformPayload,
  type PublishingChannel,
  type PublishingItem,
  type PublishingMediaType
} from "@/lib/publishingHub";

export type PublishingExportFormat = "copy_text" | "json" | "markdown" | "platform_brief";
export type PublishingExportStatus = "ready" | "needs_review" | "blocked";

export type PublishingExportPackage = {
  id: string;
  itemId: string;
  channel: PublishingChannel;
  platformName: string;
  title: string;
  caption: string;
  description: string;
  hashtags: string[];
  scheduledAt: string;
  cta: string;
  mediaType: PublishingMediaType;
  destination: string;
  ethicalWarnings: string[];
  platformWarnings: string[];
  copyReadyText: string;
  jsonPayload: Record<string, unknown>;
  markdownBrief: string;
  status: PublishingExportStatus;
  generatedAt: Date;
};

export type PublishingExportSummary = {
  totalPackages: number;
  readyPackages: number;
  packagesNeedingReview: number;
  blockedPackages: number;
  packagesByChannel: Record<string, number>;
  packagesByStatus: Record<PublishingExportStatus, number>;
  mainWarnings: string[];
};

const generatedAt = new Date("2026-05-10T12:00:00.000Z");

export function getExportablePublishingItems(items: PublishingItem[] = PUBLISHING_ITEMS): PublishingItem[] {
  return items.filter((item) => item.publishingStatus !== "error");
}

export function generateCopyReadyText(item: PublishingItem): string {
  const hashtags = item.hashtags.length > 0 ? `\n\n${item.hashtags.join(" ")}` : "";
  return [
    `Título: ${item.titleForPlatform}`,
    "",
    item.caption,
    "",
    `CTA: ${item.cta}`,
    hashtags.trim()
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateJsonPayload(item: PublishingItem): Record<string, unknown> {
  const payload = generatePlatformPayload(item);
  return {
    platform: payload.platform,
    title: payload.title,
    caption: payload.caption,
    description: payload.description,
    cta: item.cta,
    hashtags: item.hashtags,
    scheduledAt: payload.scheduledAt,
    mediaType: payload.mediaType,
    destination: payload.destination,
    status: getExportStatus(item),
    warnings: [...getEthicalWarnings(item), ...getExportWarnings(item)]
  };
}

export function generateMarkdownBrief(item: PublishingItem): string {
  return [
    `# ${item.titleForPlatform}`,
    "",
    `- Plataforma: ${channelLabel(item.channel)}`,
    `- Destino: ${generatePlatformPayload(item).destination}`,
    `- Data sugerida: ${item.suggestedDate} ${item.suggestedTime}`,
    `- Formato: ${item.mediaType}`,
    `- CTA: ${item.cta}`,
    "",
    "## Legenda",
    item.caption,
    "",
    "## Descrição",
    item.description,
    "",
    "## Observações",
    item.notes
  ].join("\n");
}

export function generatePlatformExportPackage(item: PublishingItem): PublishingExportPackage {
  const payload: PlatformPayload = generatePlatformPayload(item);
  const status = getExportStatus(item);

  return {
    id: `${item.id}-export`,
    itemId: item.id,
    channel: item.channel,
    platformName: payload.platform,
    title: item.titleForPlatform,
    caption: item.caption,
    description: item.description,
    hashtags: item.hashtags,
    scheduledAt: payload.scheduledAt,
    cta: item.cta,
    mediaType: item.mediaType,
    destination: payload.destination,
    ethicalWarnings: getEthicalWarnings(item),
    platformWarnings: getExportWarnings(item),
    copyReadyText: generateCopyReadyText(item),
    jsonPayload: generateJsonPayload(item),
    markdownBrief: generateMarkdownBrief(item),
    status,
    generatedAt
  };
}

export function generatePublishingExportBundle(items: PublishingItem[] = PUBLISHING_ITEMS): PublishingExportPackage[] {
  return getExportablePublishingItems(items).map(generatePlatformExportPackage);
}

export function getReadyExportPackages(packages: PublishingExportPackage[]): PublishingExportPackage[] {
  return packages.filter((item) => item.status === "ready");
}

export function getBlockedExportPackages(packages: PublishingExportPackage[]): PublishingExportPackage[] {
  return packages.filter((item) => item.status === "blocked");
}

export function getPackagesNeedingReview(packages: PublishingExportPackage[]): PublishingExportPackage[] {
  return packages.filter((item) => item.status === "needs_review");
}

export function summarizePublishingExports(packages: PublishingExportPackage[]): PublishingExportSummary {
  const packagesByChannel = packages.reduce<Record<string, number>>((acc, item) => {
    acc[item.platformName] = (acc[item.platformName] ?? 0) + 1;
    return acc;
  }, {});

  const packagesByStatus: Record<PublishingExportStatus, number> = {
    ready: getReadyExportPackages(packages).length,
    needs_review: getPackagesNeedingReview(packages).length,
    blocked: getBlockedExportPackages(packages).length
  };

  return {
    totalPackages: packages.length,
    readyPackages: packagesByStatus.ready,
    packagesNeedingReview: packagesByStatus.needs_review,
    blockedPackages: packagesByStatus.blocked,
    packagesByChannel,
    packagesByStatus,
    mainWarnings: getExportWarnings()
  };
}

export function validateExportPackage(pkg: PublishingExportPackage): { valid: boolean; warnings: string[] } {
  const warnings = [...pkg.ethicalWarnings, ...pkg.platformWarnings];
  if (!pkg.title.trim()) warnings.push("Título ausente.");
  if (!pkg.caption.trim()) warnings.push("Legenda ausente.");
  if (!pkg.cta.trim()) warnings.push("CTA ausente.");

  return {
    valid: pkg.status === "ready" && warnings.every((warning) => warning.startsWith("Exportação simulada") || warning.startsWith("Revisar manualmente") || warning.startsWith("Confirmar mídia") || warning.startsWith("Verificar regras")),
    warnings
  };
}

export function getExportInstructionsByChannel(channel: PublishingChannel): string[] {
  if (channel === "meta_instagram_reels") {
    return ["Copiar legenda e CTA.", "Conferir capa e mídia final.", "Agendar manualmente no Instagram Reels após aprovação."];
  }
  if (channel === "meta_instagram_stories") {
    return ["Separar blocos de Stories.", "Conferir CTA para WhatsApp.", "Publicar manualmente após aprovação."];
  }
  if (channel === "youtube_shorts") {
    return ["Copiar título e descrição.", "Anexar vídeo vertical.", "Conferir regras do YouTube Shorts antes de publicar."];
  }
  if (channel === "tiktok") {
    return ["TikTok: usar gancho forte sem sensacionalismo, manter linguagem direta e revisar o conteúdo antes da publicação manual.", "Conferir legenda e hashtags.", "Publicar manualmente após revisão."];
  }
  if (channel === "website_article" || channel === "website_page") {
    return ["Copiar briefing Markdown.", "Revisar SEO e tom institucional.", "Publicar manualmente no site após aprovação."];
  }
  if (channel === "facebook_page") {
    return ["Adaptar legenda para Facebook.", "Conferir mídia final.", "Agendar manualmente após aprovação."];
  }
  return ["Revisar pacote.", "Confirmar mídia final.", "Publicar manualmente após aprovação."];
}

export function getExportWarnings(item?: PublishingItem): string[] {
  const warnings = [
    "Exportação simulada; nenhuma publicação real foi enviada.",
    "Revisar manualmente antes de publicar.",
    "Confirmar mídia final antes de agendar.",
    "Verificar regras da plataforma antes da publicação real."
  ];

  if (item?.channel.startsWith("website")) warnings.push("Conferir formatação no CMS/site antes de publicar.");
  if (item?.channel === "meta_instagram_stories") warnings.push("Conferir sequência de Stories e links antes de publicar.");
  return warnings;
}

function getExportStatus(item: PublishingItem): PublishingExportStatus {
  const validation = validateEthicalChecklist(item);
  const missingContent = !item.titleForPlatform.trim() || !item.caption.trim() || !item.cta.trim();

  if (isCriticalEthicalFailure(item.ethicalChecklist) || item.approvalStatus === "blocked_by_ethics" || validation.recommendedStatus === "blocked") {
    return "blocked";
  }

  if (item.approvalStatus !== "approved_by_cadu" || !validation.valid || missingContent || item.publishingStatus === "needs_review" || item.publishingStatus === "draft") {
    return "needs_review";
  }

  return "ready";
}

function getEthicalWarnings(item: PublishingItem): string[] {
  const warnings: string[] = [];
  const validation = validateEthicalChecklist(item);

  if (item.approvalStatus !== "approved_by_cadu") warnings.push(`Aprovação pendente: ${approvalStatusLabel(item.approvalStatus)}.`);
  for (const missing of validation.missing) {
    if (missing !== "approvalStatus") warnings.push(`Checklist pendente: ${ethicalChecklistLabel(missing)}.`);
  }

  return warnings;
}

function isCriticalEthicalFailure(checklist: EthicalChecklist): boolean {
  return (
    !checklist.noPromiseOfResult ||
    !checklist.noIrregularBeforeAfter ||
    !checklist.noPriceOrPromotion ||
    !checklist.noGuaranteeOfTransformation ||
    !checklist.respectsPatientPrivacy
  );
}

function ethicalChecklistLabel(key: keyof EthicalChecklist): string {
  return {
    hasMedicalApproval: "aprovação médica",
    noPromiseOfResult: "sem promessa de resultado",
    noSensationalism: "sem sensacionalismo",
    noIrregularBeforeAfter: "sem antes/depois irregular",
    noPriceOrPromotion: "sem preço ou promoção",
    noGuaranteeOfTransformation: "sem garantia de transformação",
    hasAppropriateCTA: "CTA apropriado",
    respectsPatientPrivacy: "privacidade do paciente",
    isEducationalOrInformational: "conteúdo educativo ou informativo"
  }[key];
}
