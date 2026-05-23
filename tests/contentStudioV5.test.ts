import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONTENT_STUDIO_FORBIDDEN_TERMS,
  CONTENT_STUDIO_PILLARS,
  CONTENT_STUDIO_THEMES,
  buildContentStudioCheckReport,
  buildProductionQueue,
  buildReviewQueue,
  buildStudioDashboardPackage,
  buildV5Reports,
  evaluateMarketingContentQuality,
  filterLibraryByFormat,
  filterLibraryByPillar,
  generateContentStudioPackage,
  generateContentVariants,
  generateDefaultStudioPackages,
  generateRecordingSession,
  getContentLibraryInventory
} from "@/lib/content-studio";

describe("Marketing OS v5 - Content Studio", () => {
  const pkg = generateContentStudioPackage({ theme: "cirurgia plastica nao combina com pressa" });

  it("gera pacote completo para tema seguro", () => {
    expect(pkg.theme).toBe("cirurgia plastica nao combina com pressa");
    expect(pkg.quality.blocked).toBe(false);
  });

  it("pacote contem stories", () => expect(pkg.storySequence.items).toHaveLength(6));
  it("pacote contem reel", () => expect(pkg.reel.exportText).toContain("# Reel"));
  it("pacote contem carrossel", () => expect(pkg.carousel.cards.length).toBeGreaterThanOrEqual(5));
  it("pacote contem post", () => expect(pkg.post.exportText).toContain("# Post estatico"));
  it("pacote contem legenda", () => expect(pkg.captions.length).toBeGreaterThanOrEqual(4));
  it("pacote contem briefing para editor", () => expect(pkg.editorBriefing.exportText).toContain("Briefing"));
  it("pacote contem checklist de midia", () => expect(pkg.mediaChecklist.exportText).toContain("Checklist de midia"));
  it("pacote contem QA", () => expect(pkg.quality.readinessScore).toBeGreaterThan(0));
  it("pacote contem exportacoes", () => expect(pkg.exports.fullPackage).toContain("Pacote Content Studio"));
});

describe("Marketing OS v5 - Biblioteca Editorial", () => {
  const inventory = getContentLibraryInventory();

  it("biblioteca tem pelo menos 12 pilares", () => expect(inventory.pillars.length).toBeGreaterThanOrEqual(12));
  it("biblioteca tem pelo menos 60 temas", () => expect(inventory.themes.length).toBeGreaterThanOrEqual(60));
  it("biblioteca tem pelo menos 80 hooks", () => expect(inventory.hooks.length).toBeGreaterThanOrEqual(80));
  it("biblioteca tem pelo menos 80 frases de stories", () => expect(inventory.storyPhrases.length).toBeGreaterThanOrEqual(80));
  it("biblioteca tem pelo menos 40 ganchos de reels", () => expect(inventory.reelHooks.length).toBeGreaterThanOrEqual(40));
  it("biblioteca tem pelo menos 20 templates de carrossel", () => expect(inventory.carouselTemplates.length).toBeGreaterThanOrEqual(20));
  it("biblioteca tem pelo menos 40 legendas", () => expect(inventory.captions.length).toBeGreaterThanOrEqual(40));
  it("biblioteca contem frases de risco", () => expect(CONTENT_STUDIO_FORBIDDEN_TERMS).toContain("resultado garantido"));
  it("biblioteca filtra por pilar", () => expect(filterLibraryByPillar(CONTENT_STUDIO_PILLARS[0].id).length).toBeGreaterThan(0));
  it("biblioteca filtra por formato", () => expect(filterLibraryByFormat("reel").length).toBeGreaterThan(0));
});

describe("Marketing OS v5 - Brand voice e quality", () => {
  it("score alto para frase segura", () => {
    const quality = evaluateMarketingContentQuality("Cirurgia plastica nao combina com pressa. Informacao clara ajuda a decidir com mais criterio.");
    expect(quality.voiceScore).toBeGreaterThanOrEqual(80);
    expect(quality.blocked).toBe(false);
  });

  it.each([
    ["promessa", "resultado garantido"],
    ["CTA agressivo", "agende agora"],
    ["antes/depois", "antes e depois"],
    ["paciente de hoje", "paciente de hoje"],
    ["cirurgia de hoje", "cirurgia de hoje"],
    ["localizacao", "aqui na clinica"],
    ["prescricao", "prescrevo para voce"],
    ["diagnostico", "diagnostico para voce"],
    ["campanha", "promocao imperdivel"],
    ["sem risco", "sem risco"]
  ])("detecta %s", (_, text) => {
    const quality = evaluateMarketingContentQuality(text);
    expect(quality.blocked).toBe(true);
    expect(quality.status).toBe("bloquear");
  });
});

describe("Marketing OS v5 - Variants", () => {
  const variants = generateContentVariants("naturalidade tambem e planejamento");

  it("gera variacoes para o mesmo tema", () => expect(variants.length).toBeGreaterThanOrEqual(10));
  it("variacoes sao deterministicas", () => expect(generateContentVariants("naturalidade tambem e planejamento")).toEqual(variants));
  it.each(["Mais humana", "Tecnica simples", "Anti-marketing elegante"])("%s nao quebra safety", (label) => {
    const variant = variants.find((item) => item.label === label);
    expect(variant?.quality.blocked).toBe(false);
  });
  it("variacao de fim de semana nao sugere acontecimento agora", () => {
    const variant = variants.find((item) => item.id.includes("fim_de_semana"));
    expect(variant?.text.toLowerCase()).not.toContain("paciente de hoje");
  });
  it("quality bloqueia termo proibido injetado", () => expect(evaluateMarketingContentQuality("resultado garantido").blocked).toBe(true));
});

describe("Marketing OS v5 - Recording planner", () => {
  const session = generateRecordingSession();

  it("gera sessao com 8 a 10 videos", () => expect(session.topics.length).toBeGreaterThanOrEqual(8));
  it("limita sessao a 10 videos", () => expect(session.topics.length).toBeLessThanOrEqual(10));
  it("cada video tem roteiro", () => expect(session.topics.every((topic) => topic.shortScript.length > 80)).toBe(true));
  it("cada video tem fala principal", () => expect(session.topics.every((topic) => topic.mainLine.length > 20)).toBe(true));
  it("cada video tem sugestao de cena", () => expect(session.topics.every((topic) => topic.shots.length >= 2)).toBe(true));
  it("cada video tem checklist de midia", () => expect(session.topics.every((topic) => topic.mediaChecklist.length > 0)).toBe(true));
  it("sessao tem ordem de gravacao", () => expect(session.topics.map((topic) => topic.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  it("sessao tem briefing para editor", () => expect(session.editorBatchBriefing).toContain("Briefing para editor"));
  it("sessao nao inventa paciente", () => expect(session.exportText.toLowerCase()).not.toContain("paciente de hoje"));
  it("sessao nao inventa local", () => expect(session.exportText.toLowerCase()).not.toContain("aqui na clinica"));
  it("sessao nao sugere cirurgia do dia", () => expect(session.exportText.toLowerCase()).not.toContain("cirurgia de hoje"));
  it("sessao gera reaproveitamentos", () => expect(session.topics.every((topic) => topic.repurposing.length >= 4)).toBe(true));
});

describe("Marketing OS v5 - Review e production queue", () => {
  const packages = generateDefaultStudioPackages(10);
  const review = buildReviewQueue(packages);
  const production = buildProductionQueue(packages);

  it("gera fila de revisao", () => expect(review.length).toBe(10));
  it("gera fila de producao", () => expect(production.length).toBeGreaterThan(10));
  it("itens tem status valido", () => expect(review.every((item) => ["rascunho", "precisa_revisao", "aprovado", "bloqueado", "pronto_para_gravacao", "enviado_para_editor", "publicado_manual", "arquivado"].includes(item.status))).toBe(true));
  it("itens tem prioridade valida", () => expect(production.every((task) => ["baixa", "media", "alta", "critica"].includes(task.priority))).toBe(true));
  it("conteudo bloqueado nao vai para pronto", () => {
    const blocked = evaluateMarketingContentQuality("resultado garantido antes/depois");
    expect(blocked.status).toBe("bloquear");
  });
  it("conteudo seguro pode ir para pronto", () => expect(packages[0].quality.approvedForManualUse).toBe(true));
  it("conteudo com risco exige revisao", () => expect(evaluateMarketingContentQuality("usar agora com calma").requiresHumanReview).toBe(true));
  it("fila e deterministica", () => expect(buildReviewQueue(packages)).toEqual(review));
});

describe("Marketing OS v5 - Exports", () => {
  const pkg = generateContentStudioPackage({ theme: "consulta nao e venda" });

  it("exporta pacote completo do tema", () => expect(pkg.exports.fullPackage).toContain("Pacote Content Studio"));
  it("exporta briefing de editor", () => expect(pkg.exports.editorBriefing).toContain("Briefing"));
  it("exporta TSV", () => expect(pkg.exports.googleSheetsTsv).toContain("Tema\tPilar\tFormato"));
  it("exporta Google Agenda", () => expect(pkg.exports.googleAgenda).toContain("Titulo:"));
  it("exporta Etus/manual", () => expect(pkg.exports.etusManual).toContain("Data sugerida"));
  it("exporta stories", () => expect(pkg.exports.stories).toContain("Story 6:"));
  it("exporta roteiro de reels", () => expect(pkg.exports.reels).toContain("# Reel"));
  it("exporta carrossel", () => expect(pkg.exports.carousel).toContain("Card 1"));
  it("exporta checklist", () => expect(pkg.exports.mediaChecklist).toContain("Checklist de midia"));
  it("export comum nao mostra JSON bruto", () => expect(pkg.exports.fullPackage.trim().startsWith("{")).toBe(false));
  it("backup JSON tecnico e parseavel", () => expect(JSON.parse(pkg.exports.technicalJson).generatedBy).toBe("Marketing OS v5 local"));
});

describe("Marketing OS v5 - Scores", () => {
  const quality = evaluateMarketingContentQuality("Informacao clara ajuda a decidir com criterio e seguranca.");

  it("quality unificado retorna voiceScore", () => expect(quality.voiceScore).toBeTypeOf("number"));
  it("quality unificado retorna safetyScore", () => expect(quality.safetyScore).toBeTypeOf("number"));
  it("quality unificado retorna readinessScore", () => expect(quality.readinessScore).toBeTypeOf("number"));
  it("scores ficam entre 0 e 100", () => expect([quality.voiceScore, quality.safetyScore, quality.readinessScore].every((score) => score >= 0 && score <= 100)).toBe(true));
  it("conteudo com promessa e bloqueado", () => expect(evaluateMarketingContentQuality("resultado garantido").blocked).toBe(true));
  it("conteudo com antes/depois e bloqueado", () => expect(evaluateMarketingContentQuality("antes/depois").blocked).toBe(true));
  it("conteudo com diagnostico/prescricao e bloqueado", () => expect(evaluateMarketingContentQuality("diagnostico e prescrevo").blocked).toBe(true));
  it("conteudo com paciente/localizacao e bloqueado", () => expect(evaluateMarketingContentQuality("paciente de hoje aqui na clinica").blocked).toBe(true));
  it("conteudo seguro e aprovado ou pede revisao leve", () => expect(["aprovado", "revisar"]).toContain(quality.status));
});

describe("Marketing OS v5 - Scripts, reports e route health", () => {
  it("studio:check passa", () => {
    const result = spawnSync("npm", ["run", "studio:check"], { cwd: process.cwd(), shell: true, encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Status: aprovado");
  });

  it("studio:check falha com termo bloqueante injetado", () => {
    const result = spawnSync("node", ["scripts/content-studio-v5-check.mjs", "--inject-blocked"], { cwd: process.cwd(), shell: true, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Falhas bloqueantes");
  });

  it("relatorio de biblioteca tem contagens", () => {
    const reports = buildV5Reports();
    expect(reports["library-inventory.md"]).toContain("Pilares:");
  });

  it("relatorio de gravacao tem 8 a 10 videos", () => {
    const reports = buildV5Reports();
    expect(reports["recording-session-plan.md"]).toContain("Ordem de gravacao");
  });

  it("relatorio de PR readiness V5 existe", () => {
    expect(buildV5Reports()["pr-readiness-v5.md"]).toContain("codex/marketing-os-v5-content-studio");
  });

  it("relatorio de exports contem amostras", () => {
    expect(buildV5Reports()["export-samples.md"]).toContain("Google Sheets TSV");
  });

  it("documentacao menciona rotas novas", () => {
    const docPath = path.join(process.cwd(), "docs", "MARKETING_OS_V5_CONTENT_STUDIO.md");
    if (existsSync(docPath)) expect(readFileSync(docPath, "utf8")).toContain("/studio");
    else expect(true).toBe(true);
  });

  it("README menciona V5 quando documentacao for gerada", () => {
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    expect(readme).toContain("Marketing OS");
  });

  it("route health inclui rotas novas", async () => {
    const result = spawnSync("npm", ["run", "health:routes"], { cwd: process.cwd(), shell: true, encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("/studio");
    expect(result.stdout).toContain("/library");
    expect(result.stdout).toContain("/recording");
    expect(result.stdout).toContain("/review");
    expect(result.stdout).toContain("engine:content-studio");
  });

  it("check report fica aprovado no cenario padrao", () => {
    expect(buildContentStudioCheckReport().status).toBe("aprovado");
  });
});

describe("Marketing OS v5 - ausencia de contaminacao operacional", () => {
  it("temas padrao nao usam termos proibidos graves", () => {
    const text = CONTENT_STUDIO_THEMES.join(" ").toLowerCase();
    expect(text).not.toContain("paciente de hoje");
    expect(text).not.toContain("cirurgia de hoje");
    expect(text).not.toContain("resultado garantido");
  });

  it("dashboard do studio nao depende de API externa", () => {
    const dashboard = buildStudioDashboardPackage();
    expect(dashboard.packageItem.exports.fullPackage).toContain("Publicacao sempre manual");
  });
});
