import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DR_CADU_EDITORIAL_PROFILE } from "@/lib/drCaduEditorialProfile";
import {
  CONTENT_PROMPTS,
  analyzeLocalMarketingDemoData,
  buildContentPackageMarkdown,
  buildPromptLibraryMarkdown,
  buildWeeklyContentCsv,
  buildWeeklyContentJson,
  buildWeeklyContentMarkdown,
  getWeeklyContentPlan,
  validateMedicalMarketingGuardrails
} from "@/lib/drCaduContentPlan";

describe("Dr Cadu internal marketing command center finalization", () => {
  it("mantem o perfil editorial medico, interno e sem integracao real", () => {
    expect(DR_CADU_EDITORIAL_PROFILE.brandIdentity).toContain("Dr. Cadu");
    expect(DR_CADU_EDITORIAL_PROFILE.editorialPillars).toEqual(expect.arrayContaining(["rotina como professor", "seguranca em cirurgia plastica", "Plastica em Evidencia"]));
    expect(DR_CADU_EDITORIAL_PROFILE.safetyRules.join(" ")).toContain("nao usar dados pessoais");
    expect(DR_CADU_EDITORIAL_PROFILE.safetyRules.join(" ")).toContain("nao publicar automaticamente");
    expect(DR_CADU_EDITORIAL_PROFILE.futureIntegrations.every((item) => item.mode !== "local_mock" || item.currentBoundary.length > 0)).toBe(true);
    expect(DR_CADU_EDITORIAL_PROFILE.futureIntegrations.map((item) => item.name)).toEqual(
      expect.arrayContaining(["AnalyticsProvider", "SocialAccountProvider", "PublishingProvider", "AIProvider", "AssetProvider"])
    );
  });

  it("gera uma semana completa com 7 dias, stories diarios e conteudo principal", () => {
    const plan = getWeeklyContentPlan();

    expect(plan.days).toHaveLength(7);
    expect(plan.packages).toHaveLength(7);
    expect(plan.days.every((day) => day.stories.length >= 5 && day.stories.length <= 10)).toBe(true);
    expect(plan.days.every((day) => day.primaryContentId.length > 0)).toBe(true);
    expect(plan.packages.filter((pkg) => pkg.derivedChannels.includes("TikTok") || pkg.derivedChannels.includes("YouTube Shorts")).length).toBeGreaterThanOrEqual(2);
    expect(plan.packages.some((pkg) => pkg.primaryChannel === "YouTube video longo")).toBe(true);
  });

  it("inclui pacotes completos de conteudo para canais e formatos obrigatorios", () => {
    const plan = getWeeklyContentPlan();

    for (const pkg of plan.packages) {
      expect(pkg.strategy.safeEditorialPromise).toContain("sem promessa de resultado");
      expect(pkg.feed.caption.length).toBeGreaterThan(80);
      expect(pkg.feed.hashtags.length).toBeGreaterThanOrEqual(4);
      expect(pkg.carousel.slides.length).toBeGreaterThanOrEqual(6);
      expect(pkg.stories.length).toBeGreaterThanOrEqual(5);
      expect(pkg.shortVideo.script).toContain("contexto");
      expect(pkg.youtubeLong.blockScript.length).toBeGreaterThanOrEqual(4);
      expect(pkg.repurposing.length).toBeGreaterThanOrEqual(4);
      expect(pkg.ethicalChecklist).toEqual(expect.arrayContaining(["nao promete resultado", "nao expoe paciente", "exige revisao humana antes de publicacao real"]));
    }
  });

  it("gera analise deterministica com cadencia versus qualidade, sinais e recomendacoes", () => {
    const analysis = analyzeLocalMarketingDemoData();

    expect(analysis.statusBadge).toContain("Semana");
    expect(analysis.coreMetrics.some((metric) => metric.label === "Alcance" && metric.delta !== null)).toBe(true);
    expect(analysis.cadenceQuality.explanation).toContain("cadencia");
    expect(analysis.signals.map((signal) => signal.type)).toEqual(expect.arrayContaining(["positive", "warning", "anomaly", "insufficient_data"]));
    expect(analysis.signals.some((signal) => `${signal.title} ${signal.detail}`.includes("Dezembro/2025"))).toBe(true);
    expect(analysis.recommendations.length).toBeGreaterThanOrEqual(4);
    expect(analysis.editorialMix.map((item) => item.functionName)).toEqual(
      expect.arrayContaining(["autoridade", "confianca", "educacao", "desejo", "conversao", "distribuicao"])
    );
  });

  it("mantem biblioteca de prompts obrigatoria e copiavel", () => {
    const titles = CONTENT_PROMPTS.map((item) => item.title);
    const markdown = buildPromptLibraryMarkdown();

    expect(titles).toEqual(
      expect.arrayContaining([
        "Gerar legenda",
        "Revisar legenda",
        "Gerar carrossel",
        "Gerar stories",
        "Gerar roteiro de Reels",
        "Gerar roteiro de TikTok",
        "Gerar YouTube Shorts",
        "Gerar video longo",
        "Gerar thumbnail",
        "Transformar video longo em cortes",
        "Revisar riscos eticos",
        "Montar calendario semanal",
        "Transformar desempenho em plano"
      ])
    );
    expect(markdown).toContain("## Gerar legenda");
    expect(markdown).toContain("marketing medico responsavel");
  });

  it("exporta semana e pacote em Markdown, JSON e CSV", () => {
    const plan = getWeeklyContentPlan();
    const pkg = plan.packages[0];

    expect(buildWeeklyContentMarkdown(plan)).toContain("# Semana interna demo");
    expect(buildContentPackageMarkdown(pkg)).toContain(pkg.title);
    expect(JSON.parse(buildWeeklyContentJson(plan)).packages).toHaveLength(7);
    expect(buildWeeklyContentCsv(plan)).toContain("canal_principal");
  });

  it("bloqueia linguagem editorial insegura nas copys liberadas", () => {
    const plan = getWeeklyContentPlan();
    const generatedCopy = plan.packages
      .flatMap((pkg) => [pkg.feed.caption, pkg.feed.shortVersion, pkg.feed.humanVersion, pkg.shortVideo.script, pkg.youtubeLong.description])
      .join("\n");

    expect(validateMedicalMarketingGuardrails(generatedCopy)).toEqual([]);
    expect(validateMedicalMarketingGuardrails("resultado garantido e compre agora")).not.toEqual([]);
  });

  it("integra rotas navegaveis sem chamadas reais a APIs externas", () => {
    const files = [
      path.join(process.cwd(), "app", "page.tsx"),
      path.join(process.cwd(), "app", "plan", "page.tsx"),
      path.join(process.cwd(), "app", "content", "[id]", "page.tsx"),
      path.join(process.cwd(), "app", "prompts", "page.tsx"),
      path.join(process.cwd(), "app", "export", "page.tsx"),
      path.join(process.cwd(), "lib", "drCaduContentPlan.ts"),
      path.join(process.cwd(), "lib", "drCaduEditorialProfile.ts")
    ];
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(source).toContain("/plan");
    expect(source).toContain("Copiar legenda");
    expect(source).toContain("Copiar hashtags");
    expect(source).toContain("Copiar prompts");
    expect(source).toContain("nao chama OpenAI");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/axios/i);
    expect(source).not.toMatch(/api\.instagram|graph\.facebook|tiktokapis|youtube\.googleapis/i);
    expect(source).not.toMatch(/DATABASE_URL|DIRECT_URL|api_key|private key|token\s*=/i);
  });
});
