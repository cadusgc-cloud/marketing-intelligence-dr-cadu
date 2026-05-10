import {
  generatePublishingExportBundle,
  getExportInstructionsByChannel,
  type PublishingExportPackage
} from "@/lib/publishingExport";
import type { PublishingChannel } from "@/lib/publishingHub";

export type IntegrationProvider = "meta" | "youtube" | "tiktok" | "website";
export type IntegrationChannel =
  | "instagram_feed"
  | "instagram_reels"
  | "instagram_stories"
  | "facebook_page"
  | "youtube_shorts"
  | "youtube_video"
  | "tiktok_video"
  | "website_article"
  | "website_page";
export type IntegrationMode = "manual" | "simulated" | "api_ready_future" | "blocked";
export type CredentialStatus = "not_configured" | "missing" | "simulated_only" | "pending_review" | "ready_future" | "blocked";
export type IntegrationReadinessStatus = "ready_for_manual_export" | "simulated_only" | "needs_setup" | "needs_approval" | "blocked" | "future_api_candidate";
export type IntegrationRequirementStatus = "pending" | "done" | "blocked" | "not_applicable";
export type IntegrationRiskSeverity = "low" | "medium" | "high" | "critical";
export type IntegrationJobStatus = "draft" | "ready_for_manual_action" | "blocked" | "simulated_success" | "simulated_error";

export type IntegrationRequirement = {
  id: string;
  provider: IntegrationProvider;
  title: string;
  description: string;
  requiredFor: IntegrationChannel[];
  status: IntegrationRequirementStatus;
  isSensitive: boolean;
  notes: string;
};

export type IntegrationRisk = {
  id: string;
  provider: IntegrationProvider;
  channel: IntegrationChannel;
  severity: IntegrationRiskSeverity;
  title: string;
  description: string;
  mitigation: string;
};

export type IntegrationProviderConfig = {
  provider: IntegrationProvider;
  displayName: string;
  mode: IntegrationMode;
  credentialStatus: CredentialStatus;
  readinessStatus: IntegrationReadinessStatus;
  channels: IntegrationChannel[];
  requirements: IntegrationRequirement[];
  risks: IntegrationRisk[];
  manualInstructions: string[];
  futureApiNotes: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type IntegrationSimulationJob = {
  id: string;
  publishingItemId: string;
  exportPackageId: string;
  provider: IntegrationProvider;
  channel: IntegrationChannel;
  title: string;
  status: IntegrationJobStatus;
  readinessStatus: IntegrationReadinessStatus;
  ethicalApprovalRequired: boolean;
  hasEthicalApproval: boolean;
  payloadPreview: Record<string, unknown>;
  warnings: string[];
  nextManualStep: string;
  createdAt: Date;
  updatedAt: Date;
};

export type IntegrationReadinessSummary = {
  totalProviders: number;
  readyForManualExport: number;
  simulatedOnly: number;
  blockedProviders: number;
  futureApiCandidates: number;
  totalRisks: number;
  highOrCriticalRisks: number;
  missingCredentialProviders: number;
  nextSetupSteps: string[];
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");

function requirement(
  provider: IntegrationProvider,
  id: string,
  title: string,
  description: string,
  requiredFor: IntegrationChannel[],
  status: IntegrationRequirementStatus,
  isSensitive: boolean,
  notes: string
): IntegrationRequirement {
  return { id, provider, title, description, requiredFor, status, isSensitive, notes };
}

function risk(
  provider: IntegrationProvider,
  channel: IntegrationChannel,
  id: string,
  severity: IntegrationRiskSeverity,
  title: string,
  description: string,
  mitigation: string
): IntegrationRisk {
  return { id, provider, channel, severity, title, description, mitigation };
}

export const INTEGRATION_PROVIDERS: IntegrationProviderConfig[] = [
  {
    provider: "meta",
    displayName: "Meta / Instagram / Facebook",
    mode: "simulated",
    credentialStatus: "not_configured",
    readinessStatus: "ready_for_manual_export",
    channels: ["instagram_feed", "instagram_reels", "instagram_stories", "facebook_page"],
    requirements: [
      requirement("meta", "meta-credentials", "Credenciais Meta", "OAuth, permissões e tokens ainda não foram configurados.", ["instagram_feed", "instagram_reels", "instagram_stories", "facebook_page"], "pending", true, "Não criar tokens nesta fase."),
      requirement("meta", "meta-approval-flow", "Fluxo de aprovação", "Publicação médica exige aprovação do Dr. Cadu antes de qualquer ação real.", ["instagram_feed", "instagram_reels", "instagram_stories", "facebook_page"], "done", true, "Checklist ético já orienta a fila manual."),
      requirement("meta", "meta-error-log", "Plano de fallback e logs", "Automação futura precisa registrar erros e manter alternativa manual.", ["instagram_feed", "instagram_reels", "instagram_stories", "facebook_page"], "pending", false, "Definir antes de API real.")
    ],
    risks: [
      risk("meta", "instagram_reels", "meta-medical-approval", "critical", "Publicação sem aprovação médica", "Conteúdo pode ir ao ar sem validação final.", "Bloquear automação real sem aprovação do Dr. Cadu."),
      risk("meta", "instagram_reels", "meta-before-after", "critical", "Antes/depois irregular", "Risco ético em conteúdo de resultado.", "Aplicar checklist e revisão manual antes de publicar."),
      risk("meta", "instagram_stories", "meta-final-media", "high", "Mídia final não conferida", "Stories podem sair com link, corte ou CTA incorreto.", "Conferir mídia final no Meta Business Suite.")
    ],
    manualInstructions: [
      "Usar os textos e payloads da Central de Publicação.",
      "Revisar checklist ético e aprovação médica.",
      "Publicar ou agendar manualmente no Meta Business Suite.",
      "Registrar resultado depois da publicação."
    ],
    futureApiNotes: [
      "Configurar OAuth Meta apenas em fase futura.",
      "Validar permissões por canal antes de qualquer publicação automática.",
      "Manter fallback manual obrigatório."
    ],
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    provider: "youtube",
    displayName: "YouTube / Shorts",
    mode: "simulated",
    credentialStatus: "not_configured",
    readinessStatus: "simulated_only",
    channels: ["youtube_shorts", "youtube_video"],
    requirements: [
      requirement("youtube", "youtube-credentials", "Credenciais YouTube", "OAuth e permissões do YouTube Studio não foram configurados.", ["youtube_shorts", "youtube_video"], "pending", true, "Somente uso manual nesta fase."),
      requirement("youtube", "youtube-media-review", "Revisão de vídeo", "Vídeo vertical e privacidade precisam ser conferidos antes do upload manual.", ["youtube_shorts", "youtube_video"], "done", false, "Usar briefing de exportação.")
    ],
    risks: [
      risk("youtube", "youtube_shorts", "youtube-privacy", "high", "Privacidade/agendamento não conferidos", "Short pode ficar público fora do momento planejado.", "Conferir privacidade e agendamento no YouTube Studio."),
      risk("youtube", "youtube_shorts", "youtube-title-claim", "medium", "Título com promessa implícita", "Título curto pode soar como promessa clínica.", "Revisar título antes do upload.")
    ],
    manualInstructions: [
      "Usar título, descrição e briefing do pacote de exportação.",
      "Revisar vídeo vertical.",
      "Subir manualmente no YouTube Studio.",
      "Conferir privacidade e agendamento.",
      "Registrar resultado depois."
    ],
    futureApiNotes: [
      "OAuth YouTube fica reservado para fase futura.",
      "Upload de mídia não será automatizado nesta fase."
    ],
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    provider: "tiktok",
    displayName: "TikTok",
    mode: "simulated",
    credentialStatus: "not_configured",
    readinessStatus: "simulated_only",
    channels: ["tiktok_video"],
    requirements: [
      requirement("tiktok", "tiktok-credentials", "Credenciais TikTok", "Credenciais, permissões e fluxo de publicação real não existem nesta fase.", ["tiktok_video"], "pending", true, "Não criar tokens."),
      requirement("tiktok", "tiktok-tone-review", "Revisão de linguagem", "Gancho forte não pode virar sensacionalismo.", ["tiktok_video"], "done", true, "Revisar manualmente antes de publicar.")
    ],
    risks: [
      risk("tiktok", "tiktok_video", "tiktok-sensationalism", "high", "Gancho sensacionalista", "TikTok incentiva abertura forte, mas marketing médico precisa controle ético.", "Manter linguagem direta, sem promessa ou exagero."),
      risk("tiktok", "tiktok_video", "tiktok-context-loss", "medium", "Perda de contexto educativo", "Vídeo curto pode simplificar demais o tema.", "Usar descrição e CTA educativo.")
    ],
    manualInstructions: [
      "Usar gancho e legenda do pacote de exportação.",
      "Adaptar linguagem sem sensacionalismo.",
      "Publicar manualmente.",
      "Registrar resultado depois."
    ],
    futureApiNotes: [
      "API real deve ficar bloqueada até validação ética e técnica.",
      "Manter revisão manual mesmo com futura automação."
    ],
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    provider: "website",
    displayName: "Site",
    mode: "manual",
    credentialStatus: "not_configured",
    readinessStatus: "ready_for_manual_export",
    channels: ["website_article", "website_page"],
    requirements: [
      requirement("website", "website-cms-access", "Acesso ao CMS/site", "Credenciais e fluxo editorial do site não estão configurados no sistema.", ["website_article", "website_page"], "pending", true, "Manter publicação manual."),
      requirement("website", "website-medical-copy", "Revisão médica do texto", "Conteúdo institucional precisa manter linguagem educativa.", ["website_article", "website_page"], "done", true, "Usar briefing Markdown.")
    ],
    risks: [
      risk("website", "website_article", "website-seo-overpromise", "high", "SEO com promessa indevida", "Texto pode usar termos comerciais demais.", "Revisar linguagem médica e remover promessa."),
      risk("website", "website_page", "website-url-tracking", "medium", "Resultado sem URL registrada", "Publicação manual pode não registrar link para auditoria.", "Registrar URL após publicação.")
    ],
    manualInstructions: [
      "Usar briefing Markdown.",
      "Transformar em post ou página.",
      "Revisar linguagem médica.",
      "Publicar manualmente no CMS/site.",
      "Registrar URL depois."
    ],
    futureApiNotes: [
      "Integração com CMS/site depende da plataforma escolhida.",
      "Persistência e logs devem existir antes de automação real."
    ],
    createdAt: baseDate,
    updatedAt: baseDate
  }
];

export function getIntegrationProviders(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationProviderConfig[] {
  return [...providers];
}

export function getIntegrationProviderByName(provider: IntegrationProvider, providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationProviderConfig | null {
  return providers.find((item) => item.provider === provider) ?? null;
}

export function getIntegrationChannels(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationChannel[] {
  return providers.flatMap((provider) => provider.channels);
}

export function getIntegrationRequirements(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationRequirement[] {
  return providers.flatMap((provider) => provider.requirements);
}

export function getIntegrationRisks(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationRisk[] {
  return providers.flatMap((provider) => provider.risks);
}

export function getBlockedIntegrationProviders(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationProviderConfig[] {
  return providers.filter((provider) => provider.readinessStatus === "blocked" || provider.credentialStatus === "blocked");
}

export function getManualReadyProviders(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationProviderConfig[] {
  return providers.filter((provider) => provider.readinessStatus === "ready_for_manual_export" || provider.readinessStatus === "simulated_only");
}

export function summarizeIntegrationReadiness(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): IntegrationReadinessSummary {
  const risks = getIntegrationRisks(providers);
  return {
    totalProviders: providers.length,
    readyForManualExport: providers.filter((provider) => provider.readinessStatus === "ready_for_manual_export").length,
    simulatedOnly: providers.filter((provider) => provider.mode === "simulated" || provider.readinessStatus === "simulated_only").length,
    blockedProviders: getBlockedIntegrationProviders(providers).length,
    futureApiCandidates: providers.filter((provider) => provider.mode === "api_ready_future" || provider.readinessStatus === "future_api_candidate").length,
    totalRisks: risks.length,
    highOrCriticalRisks: risks.filter((risk) => risk.severity === "high" || risk.severity === "critical").length,
    missingCredentialProviders: providers.filter((provider) => provider.credentialStatus === "not_configured" || provider.credentialStatus === "missing").length,
    nextSetupSteps: getNextIntegrationSetupSteps(providers)
  };
}

export function getNextIntegrationSetupSteps(providers: IntegrationProviderConfig[] = INTEGRATION_PROVIDERS): string[] {
  const pendingRequirements = getIntegrationRequirements(providers).filter((requirement) => requirement.status === "pending");
  return [
    ...pendingRequirements.slice(0, 5).map((requirement) => `${providerLabel(requirement.provider)}: ${requirement.title}`),
    "Definir fluxo de aprovação antes de qualquer API real.",
    "Criar plano de logs, erros e fallback manual antes de automação."
  ];
}

export function createIntegrationSimulationJobs(packages: PublishingExportPackage[] = generatePublishingExportBundle()): IntegrationSimulationJob[] {
  return packages.map(mapPublishingExportToIntegrationJob);
}

export function validateIntegrationJobReadiness(job: IntegrationSimulationJob): { ready: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (job.status === "blocked") reasons.push("Job bloqueado por aprovação, checklist ou pacote inválido.");
  if (!job.nextManualStep.trim()) reasons.push("Instrução manual ausente.");
  if (!job.payloadPreview || Object.keys(job.payloadPreview).length === 0) reasons.push("Payload simulado ausente.");
  if (job.ethicalApprovalRequired && !job.hasEthicalApproval) reasons.push("Aprovação ética/médica pendente.");

  return {
    ready: reasons.length === 0 && job.status === "ready_for_manual_action",
    reasons
  };
}

export function filterIntegrationJobsByProvider(jobs: IntegrationSimulationJob[], provider: IntegrationProvider): IntegrationSimulationJob[] {
  return jobs.filter((job) => job.provider === provider);
}

export function filterIntegrationJobsByStatus(jobs: IntegrationSimulationJob[], status: IntegrationJobStatus): IntegrationSimulationJob[] {
  return jobs.filter((job) => job.status === status);
}

export function getIntegrationWarnings(): string[] {
  return [
    "Nesta fase, nenhuma integração real é executada.",
    "Não há OAuth, tokens, credenciais, upload de mídia ou publicação automática.",
    "Publicação real futura exige aprovação do Dr. Cadu e checklist ético.",
    "Credenciais, permissões, logs, tratamento de erro e persistência ainda não foram implementados."
  ];
}

export function getManualPublishingInstructions(provider: IntegrationProvider): string[] {
  return getIntegrationProviderByName(provider)?.manualInstructions ?? [];
}

export function mapPublishingExportToIntegrationJob(pkg: PublishingExportPackage): IntegrationSimulationJob {
  const provider = mapPublishingChannelToProvider(pkg.channel);
  const providerConfig = getIntegrationProviderByName(provider);
  const channel = mapPublishingChannelToIntegrationChannel(pkg.channel);
  const status = pkg.status === "ready" ? "ready_for_manual_action" : "blocked";

  return {
    id: `${pkg.id}-integration-job`,
    publishingItemId: pkg.itemId,
    exportPackageId: pkg.id,
    provider,
    channel,
    title: pkg.title,
    status,
    readinessStatus: status === "ready_for_manual_action" ? "ready_for_manual_export" : "needs_approval",
    ethicalApprovalRequired: true,
    hasEthicalApproval: pkg.status === "ready",
    payloadPreview: pkg.jsonPayload,
    warnings: [...pkg.ethicalWarnings, ...pkg.platformWarnings, ...getIntegrationWarnings()],
    nextManualStep: getExportInstructionsByChannel(pkg.channel)[0] ?? providerConfig?.manualInstructions[0] ?? "Revisar pacote manualmente.",
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function providerLabel(provider: IntegrationProvider): string {
  return {
    meta: "Meta / Instagram / Facebook",
    youtube: "YouTube / Shorts",
    tiktok: "TikTok",
    website: "Site"
  }[provider];
}

export function integrationChannelLabel(channel: IntegrationChannel): string {
  return {
    instagram_feed: "Instagram feed",
    instagram_reels: "Instagram Reels",
    instagram_stories: "Instagram Stories",
    facebook_page: "Facebook",
    youtube_shorts: "YouTube Shorts",
    youtube_video: "YouTube",
    tiktok_video: "TikTok",
    website_article: "Artigo do site",
    website_page: "Página do site"
  }[channel];
}

export function readinessStatusLabel(status: IntegrationReadinessStatus): string {
  return {
    ready_for_manual_export: "Pronto para exportação manual",
    simulated_only: "Apenas simulado",
    needs_setup: "Precisa configuração",
    needs_approval: "Precisa aprovação",
    blocked: "Bloqueado",
    future_api_candidate: "Candidato a API futura"
  }[status];
}

export function credentialStatusLabel(status: CredentialStatus): string {
  return {
    not_configured: "Não configurado",
    missing: "Ausente",
    simulated_only: "Somente simulado",
    pending_review: "Pendente revisão",
    ready_future: "Pronto no futuro",
    blocked: "Bloqueado"
  }[status];
}

export function integrationModeLabel(mode: IntegrationMode): string {
  return {
    manual: "Manual",
    simulated: "Simulado",
    api_ready_future: "API futura",
    blocked: "Bloqueado"
  }[mode];
}

function mapPublishingChannelToProvider(channel: PublishingChannel): IntegrationProvider {
  if (channel.startsWith("meta_instagram") || channel === "facebook_page") return "meta";
  if (channel.startsWith("youtube")) return "youtube";
  if (channel === "tiktok") return "tiktok";
  return "website";
}

const publishingToIntegrationChannelMap = {
  meta_instagram_feed: "instagram_feed",
  meta_instagram_reels: "instagram_reels",
  meta_instagram_stories: "instagram_stories",
  facebook_page: "facebook_page",
  youtube_shorts: "youtube_shorts",
  youtube_video: "youtube_video",
  tiktok: "tiktok_video",
  website_article: "website_article",
  website_page: "website_page"
} satisfies Record<PublishingChannel, IntegrationChannel>;

export function mapPublishingChannelToIntegrationChannel(channel: PublishingChannel): IntegrationChannel {
  return publishingToIntegrationChannelMap[channel];
}
