import { describe, expect, it } from "vitest";
import {
  INTEGRATION_PROVIDERS,
  createIntegrationSimulationJobs,
  filterIntegrationJobsByProvider,
  filterIntegrationJobsByStatus,
  getIntegrationChannels,
  getIntegrationProviderByName,
  getIntegrationProviders,
  getIntegrationRisks,
  getIntegrationWarnings,
  getManualPublishingInstructions,
  getManualReadyProviders,
  getNextIntegrationSetupSteps,
  mapPublishingChannelToIntegrationChannel,
  summarizeIntegrationReadiness,
  validateIntegrationJobReadiness
} from "@/lib/integrationReadiness";
import { generatePublishingExportBundle } from "@/lib/publishingExport";

describe("Integration Readiness", () => {
  it("possui provedores Meta, YouTube, TikTok e Site", () => {
    expect(new Set(getIntegrationProviders().map((provider) => provider.provider))).toEqual(new Set(["meta", "youtube", "tiktok", "website"]));
  });

  it("cada provedor possui canais", () => {
    expect(getIntegrationProviders().every((provider) => provider.channels.length > 0)).toBe(true);
    expect(getIntegrationChannels()).toEqual(expect.arrayContaining(["instagram_reels", "youtube_shorts", "tiktok_video", "website_article"]));
  });

  it("resumo calcula total de provedores", () => {
    const summary = summarizeIntegrationReadiness();

    expect(summary.totalProviders).toBe(4);
    expect(summary.missingCredentialProviders).toBe(4);
    expect(summary.totalRisks).toBeGreaterThan(0);
  });

  it("provedores sem credenciais não ficam prontos para API real", () => {
    expect(getIntegrationProviders().every((provider) => provider.credentialStatus === "not_configured")).toBe(true);
    expect(getIntegrationProviders().some((provider) => provider.mode === "api_ready_future")).toBe(false);
  });

  it("getManualReadyProviders retorna provedores que podem usar exportação manual", () => {
    const providers = getManualReadyProviders();

    expect(providers.map((provider) => provider.provider)).toEqual(expect.arrayContaining(["meta", "youtube", "tiktok", "website"]));
  });

  it("identifica riscos high ou critical", () => {
    const risks = getIntegrationRisks();

    expect(risks.some((risk) => risk.severity === "critical")).toBe(true);
    expect(risks.some((risk) => risk.severity === "high")).toBe(true);
  });

  it("getNextIntegrationSetupSteps retorna próximos passos", () => {
    const steps = getNextIntegrationSetupSteps();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.join(" ")).toContain("Credenciais");
  });

  it("createIntegrationSimulationJobs cria jobs a partir dos pacotes de exportação", () => {
    const packages = generatePublishingExportBundle();
    const jobs = createIntegrationSimulationJobs(packages);

    expect(jobs.length).toBe(packages.length);
    expect(jobs.every((job) => job.exportPackageId.endsWith("-export"))).toBe(true);
  });

  it("job sem aprovação/checklist adequado fica blocked", () => {
    const jobs = createIntegrationSimulationJobs();
    const blocked = jobs.find((job) => job.status === "blocked" && !job.hasEthicalApproval);

    expect(blocked).toBeTruthy();
    expect(validateIntegrationJobReadiness(blocked!).ready).toBe(false);
  });

  it("job com pacote válido fica ready_for_manual_action", () => {
    const jobs = createIntegrationSimulationJobs();
    const ready = jobs.find((job) => job.status === "ready_for_manual_action");

    expect(ready).toBeTruthy();
    expect(validateIntegrationJobReadiness(ready!).ready).toBe(true);
  });

  it("filtra jobs por provedor e status", () => {
    const jobs = createIntegrationSimulationJobs();

    expect(filterIntegrationJobsByProvider(jobs, "meta").length).toBeGreaterThan(0);
    expect(filterIntegrationJobsByStatus(jobs, "blocked").every((job) => job.status === "blocked")).toBe(true);
  });

  it("instruções manuais existem para Meta, YouTube, TikTok e Site", () => {
    expect(getManualPublishingInstructions("meta").join(" ")).toContain("Meta Business Suite");
    expect(getManualPublishingInstructions("youtube").join(" ")).toContain("YouTube Studio");
    expect(getManualPublishingInstructions("tiktok").join(" ")).toContain("Publicar manualmente");
    expect(getManualPublishingInstructions("website").join(" ")).toContain("CMS/site");
  });

  it("warnings deixam claro que não há publicação real", () => {
    const warnings = getIntegrationWarnings();

    expect(warnings).toContain("Nesta fase, nenhuma integração real é executada.");
    expect(warnings.join(" ")).toContain("OAuth");
    expect(warnings.join(" ")).toContain("publicação automática");
  });

  it("busca provider por nome", () => {
    expect(getIntegrationProviderByName("meta")?.displayName).toBe("Meta / Instagram / Facebook");
    expect(getIntegrationProviderByName("website")?.mode).toBe("manual");
    expect(getIntegrationProviderByName("meta", [])).toBeNull();
  });

  it("mapeia canais de publicação para canais de integração tipados", () => {
    expect(mapPublishingChannelToIntegrationChannel("meta_instagram_reels")).toBe("instagram_reels");
    expect(mapPublishingChannelToIntegrationChannel("youtube_shorts")).toBe("youtube_shorts");
    expect(mapPublishingChannelToIntegrationChannel("tiktok")).toBe("tiktok_video");
    expect(mapPublishingChannelToIntegrationChannel("website_article")).toBe("website_article");
  });

  it("resumo inclui riscos altos/críticos e próximos passos", () => {
    const summary = summarizeIntegrationReadiness(INTEGRATION_PROVIDERS);

    expect(summary.highOrCriticalRisks).toBeGreaterThan(0);
    expect(summary.nextSetupSteps.length).toBeGreaterThan(0);
  });
});
