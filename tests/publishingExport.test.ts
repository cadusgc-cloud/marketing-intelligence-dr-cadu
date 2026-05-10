import { describe, expect, it } from "vitest";
import { PUBLISHING_ITEMS } from "@/lib/publishingHub";
import {
  generateCopyReadyText,
  generateJsonPayload,
  generateMarkdownBrief,
  generatePlatformExportPackage,
  generatePublishingExportBundle,
  getBlockedExportPackages,
  getExportInstructionsByChannel,
  getExportWarnings,
  getExportablePublishingItems,
  getPackagesNeedingReview,
  getReadyExportPackages,
  summarizePublishingExports,
  validateExportPackage
} from "@/lib/publishingExport";

describe("Publishing Export Kit", () => {
  it("gera pacotes de exportação a partir dos itens publicáveis", () => {
    const exportableItems = getExportablePublishingItems(PUBLISHING_ITEMS);
    const packages = generatePublishingExportBundle(PUBLISHING_ITEMS);

    expect(exportableItems.length).toBeGreaterThan(0);
    expect(packages.length).toBe(exportableItems.length);
  });

  it("pacote aprovado e eticamente válido fica ready", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-reels");
    expect(item).toBeTruthy();

    const pkg = generatePlatformExportPackage(item!);

    expect(pkg.status).toBe("ready");
    expect(validateExportPackage(pkg).valid).toBe(true);
  });

  it("pacote sem aprovação médica fica needs_review", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "lipo-reels");
    expect(item).toBeTruthy();

    const pkg = generatePlatformExportPackage(item!);

    expect(pkg.status).toBe("needs_review");
    expect(pkg.ethicalWarnings.some((warning) => warning.includes("aprovação médica"))).toBe(true);
  });

  it("pacote com checklist crítico incompleto fica blocked", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "website-page-ethics");
    expect(item).toBeTruthy();

    const pkg = generatePlatformExportPackage(item!);

    expect(pkg.status).toBe("blocked");
    expect(pkg.ethicalWarnings.some((warning) => warning.includes("sem promessa de resultado"))).toBe(true);
  });

  it("generateCopyReadyText retorna texto utilizável", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-reels");
    expect(item).toBeTruthy();

    const text = generateCopyReadyText(item!);

    expect(text).toContain("Título:");
    expect(text).toContain("CTA:");
    expect(text).toContain(item!.caption);
  });

  it("generateJsonPayload retorna plataforma, título, legenda, CTA e status", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-reels");
    expect(item).toBeTruthy();

    const payload = generateJsonPayload(item!);

    expect(payload.platform).toBe("Instagram Reels");
    expect(payload.title).toBe(item!.titleForPlatform);
    expect(payload.caption).toBe(item!.caption);
    expect(payload.cta).toBe(item!.cta);
    expect(payload.status).toBe("ready");
  });

  it("generateMarkdownBrief retorna briefing em Markdown", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-youtube-shorts");
    expect(item).toBeTruthy();

    const markdown = generateMarkdownBrief(item!);

    expect(markdown).toContain("# ");
    expect(markdown).toContain("## Legenda");
    expect(markdown).toContain("YouTube Shorts");
  });

  it("filtra pacotes ready, blocked e needs_review", () => {
    const packages = generatePublishingExportBundle(PUBLISHING_ITEMS);

    expect(getReadyExportPackages(packages).every((pkg) => pkg.status === "ready")).toBe(true);
    expect(getBlockedExportPackages(packages).every((pkg) => pkg.status === "blocked")).toBe(true);
    expect(getPackagesNeedingReview(packages).every((pkg) => pkg.status === "needs_review")).toBe(true);
    expect(getReadyExportPackages(packages).length).toBeGreaterThan(0);
    expect(getBlockedExportPackages(packages).length).toBeGreaterThan(0);
    expect(getPackagesNeedingReview(packages).length).toBeGreaterThan(0);
  });

  it("summarizePublishingExports calcula totais corretamente", () => {
    const packages = generatePublishingExportBundle(PUBLISHING_ITEMS);
    const summary = summarizePublishingExports(packages);

    expect(summary.totalPackages).toBe(packages.length);
    expect(summary.readyPackages + summary.packagesNeedingReview + summary.blockedPackages).toBe(packages.length);
    expect(summary.packagesByStatus.ready).toBe(summary.readyPackages);
    expect(summary.mainWarnings).toContain("Exportação simulada; nenhuma publicação real foi enviada.");
  });

  it("retorna instruções para Instagram/Reels, YouTube Shorts, TikTok e site", () => {
    expect(getExportInstructionsByChannel("meta_instagram_reels").join(" ")).toContain("Instagram Reels");
    expect(getExportInstructionsByChannel("youtube_shorts").join(" ")).toContain("YouTube Shorts");
    expect(getExportInstructionsByChannel("tiktok").join(" ")).toContain("TikTok");
    expect(getExportInstructionsByChannel("website_article").join(" ")).toContain("site");
  });

  it("informa que não há publicação real", () => {
    const warnings = getExportWarnings();

    expect(warnings).toContain("Exportação simulada; nenhuma publicação real foi enviada.");
    expect(warnings).toContain("Revisar manualmente antes de publicar.");
    expect(warnings).toContain("Confirmar mídia final antes de agendar.");
    expect(warnings).toContain("Verificar regras da plataforma antes da publicação real.");
  });
});
