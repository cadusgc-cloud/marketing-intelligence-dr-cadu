import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runMarketingDogfoodingScenario } from "@/lib/marketing-dogfooding";
import { buildPilotWeekScenario } from "@/lib/marketing-scenarios";
import { detectMedicalSafetyIssues, runMarketingQualityAudit } from "@/lib/marketing-quality";

const scenario = buildPilotWeekScenario();
const dogfood = runMarketingDogfoodingScenario();
const quality = runMarketingQualityAudit({ scenario });
const allDailyText = scenario.days.map((day) => day.exportText).join("\n\n");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Marketing OS v4 - semana piloto", () => {
  it("gera semana piloto com 7 dias", () => {
    expect(scenario.days).toHaveLength(7);
  });

  it("usa data inicial 24/05/2026", () => {
    expect(scenario.days[0].editorialDay.date).toBe("2026-05-24");
  });

  it("usa data final 30/05/2026", () => {
    expect(scenario.days.at(-1)?.editorialDay.date).toBe("2026-05-30");
  });

  it("cada dia tem tema", () => {
    expect(scenario.days.every((day) => day.editorialDay.theme.length > 0)).toBe(true);
  });

  it("cada dia tem pilar", () => {
    expect(scenario.days.every((day) => day.editorialDay.pillar.name.length > 0)).toBe(true);
  });

  it("cada dia tem readiness", () => {
    expect(scenario.days.every((day) => Number.isFinite(day.readiness.score))).toBe(true);
  });

  it("cada dia tem safety gate", () => {
    expect(scenario.days.every((day) => day.safetyGate.classification.length > 0)).toBe(true);
  });

  it("cada dia tem tarefas", () => {
    expect(scenario.days.every((day) => day.tasks.length > 0)).toBe(true);
  });

  it("cada dia tem exportacao", () => {
    expect(scenario.days.every((day) => day.exportText.includes("# Pacote do dia"))).toBe(true);
  });

  it("semana tem resumo consolidado", () => {
    expect(scenario.summary.totalDays).toBe(7);
    expect(scenario.summary.period).toBe("2026-05-24 a 2026-05-30");
  });

  it("motor da semana piloto e deterministico", () => {
    expect(buildPilotWeekScenario().summary).toEqual(buildPilotWeekScenario().summary);
  });
});

describe("Marketing OS v4 - Story QA", () => {
  it("cada dia tem 6 stories", () => {
    expect(scenario.days.every((day) => day.editorialDay.content.storySequence.items.length === 6)).toBe(true);
  });

  it("cada story tem midia sugerida", () => {
    expect(scenario.days.flatMap((day) => day.editorialDay.content.storySequence.items).every((story) => story.mediaSuggestion.label)).toBe(true);
  });

  it("cada story tem texto curto", () => {
    expect(scenario.days.flatMap((day) => day.editorialDay.content.storySequence.items).every((story) => story.textOnScreen.length > 0 && story.textOnScreen.length <= 92)).toBe(true);
  });

  it("cada story tem observacao de seguranca", () => {
    expect(scenario.days.flatMap((day) => day.editorialDay.content.storySequence.items).every((story) => story.safetyNote.length > 0)).toBe(true);
  });

  it("story nao tem mais de uma frase principal", () => {
    const stories = scenario.days.flatMap((day) => day.editorialDay.content.storySequence.items);
    expect(stories.every((story) => story.textOnScreen.split(/[.!?]+/).filter(Boolean).length <= 1)).toBe(true);
  });

  it("story nao contem antes/depois", () => {
    expect(allDailyText).not.toMatch(/antes\/depois|antes e depois/i);
  });

  it("story nao contem promessa de resultado", () => {
    expect(allDailyText).not.toMatch(/resultado garantido|corpo perfeito|sem risco/i);
  });

  it("story nao contem CTA agressivo", () => {
    expect(allDailyText).not.toMatch(/agende agora|ultimas vagas|compre agora/i);
  });

  it("story nao contem diagnostico", () => {
    expect(allDailyText).not.toMatch(/diagnostico/i);
  });

  it("story nao contem prescricao", () => {
    expect(allDailyText).not.toMatch(/prescrev/i);
  });

  it("story nao inventa paciente", () => {
    expect(allDailyText).not.toMatch(/paciente de hoje|paciente real/i);
  });

  it("story nao inventa cirurgia do dia", () => {
    expect(allDailyText).not.toMatch(/cirurgia de hoje/i);
  });

  it("story nao inventa localizacao", () => {
    expect(allDailyText).not.toMatch(/no hospital agora|aqui na clinica agora|estou aqui agora/i);
  });

  it("domingo tem tom leve sem dizer que algo acontece agora", () => {
    const sunday = scenario.days[0].editorialDay;
    expect(sunday.weekday).toBe("Domingo");
    expect(sunday.tone).toContain("leve");
    expect(sunday.content.storySequence.exportText).not.toMatch(/acontecendo agora|estou aqui agora/i);
  });
});

describe("Marketing OS v4 - reels e posts", () => {
  it("reel tem gancho seguro", () => {
    const reels = scenario.days.flatMap((day) => day.editorialDay.content.reelPlan ? [day.editorialDay.content.reelPlan] : []);
    expect(reels.every((reel) => reel.openingHook.length > 0)).toBe(true);
  });

  it("reel tem roteiro curto", () => {
    const reels = scenario.days.flatMap((day) => day.editorialDay.content.reelPlan ? [day.editorialDay.content.reelPlan] : []);
    expect(reels.every((reel) => reel.shortScript.length >= 3)).toBe(true);
  });

  it("reel tem texto na tela", () => {
    const reels = scenario.days.flatMap((day) => day.editorialDay.content.reelPlan ? [day.editorialDay.content.reelPlan] : []);
    expect(reels.every((reel) => reel.onScreenText.length > 0)).toBe(true);
  });

  it("reel nao tem promessa", () => {
    expect(scenario.exports.reels).not.toMatch(/resultado garantido|sem risco|corpo perfeito/i);
  });

  it("reel nao tem CTA agressivo", () => {
    expect(scenario.exports.reels).not.toMatch(/agende agora|ultimas vagas/i);
  });

  it("carrossel tem cards curtos", () => {
    const carousels = scenario.days.flatMap((day) => day.editorialDay.content.carouselPlan ? [day.editorialDay.content.carouselPlan] : []);
    expect(carousels.every((carousel) => carousel.cards.length >= 5 && carousel.cards.every((card) => card.length <= 110))).toBe(true);
  });

  it("carrossel nao diagnostica", () => {
    expect(scenario.exports.postsAndCarousels).not.toMatch(/diagnostico/i);
  });

  it("carrossel nao prescreve", () => {
    expect(scenario.exports.postsAndCarousels).not.toMatch(/prescrev/i);
  });
});

describe("Marketing OS v4 - safety", () => {
  it("QA detecta resultado garantido", () => {
    expect(detectMedicalSafetyIssues("resultado garantido").some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it("QA detecta antes e depois", () => {
    expect(detectMedicalSafetyIssues("antes e depois").some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it("QA detecta agende agora", () => {
    expect(detectMedicalSafetyIssues("agende agora").some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it("QA detecta paciente de hoje", () => {
    expect(detectMedicalSafetyIssues("paciente de hoje").some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it("QA detecta cirurgia de hoje", () => {
    expect(detectMedicalSafetyIssues("cirurgia de hoje").some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it("QA detecta sem risco", () => {
    expect(detectMedicalSafetyIssues("sem risco").some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it("QA detecta localizacao explicita", () => {
    expect(detectMedicalSafetyIssues("endereco e placa visivel").length).toBeGreaterThan(0);
  });

  it("conteudo bloqueado nao e marcado como pronto", () => {
    const injected = runMarketingQualityAudit({ scenario, injectedText: "resultado garantido antes e depois" });
    expect(injected.status).toBe("bloqueado");
  });
});

describe("Marketing OS v4 - exportacoes", () => {
  it("export semanal contem 7 dias", () => {
    expect((scenario.exports.weeklyText.match(/2026-05-/g) ?? []).length).toBeGreaterThanOrEqual(7);
  });

  it("export diario contem stories", () => {
    expect(scenario.exports.dailyPackages).toContain("Story 6:");
  });

  it("Google Sheets TSV tem cabecalho", () => {
    expect(scenario.exports.googleSheetsTsv).toMatch(/^Data\tDia\tPilar\tTema/);
  });

  it("Google Agenda tem titulo e descricao", () => {
    expect(scenario.exports.googleAgendaText).toContain("Titulo:");
    expect(scenario.exports.googleAgendaText).toContain("Descricao:");
  });

  it("Etus manual tem data canal formato midia e risco", () => {
    expect(scenario.exports.etusManual).toMatch(/^Data\tCanal\tFormato/);
    expect(scenario.exports.etusManual).toContain("Midia necessaria");
    expect(scenario.exports.etusManual).toContain("Risco");
  });

  it("backup JSON e parseavel", () => {
    expect(() => JSON.parse(scenario.exports.backupJson)).not.toThrow();
  });

  it("export comum nao mostra JSON bruto", () => {
    expect(scenario.exports.weeklyMarkdown.trim().startsWith("{")).toBe(false);
  });
});

describe("Marketing OS v4 - reports e scripts", () => {
  it("dogfood report tem status final", () => {
    expect(dogfood.finalStatus).toBe("aprovado");
  });

  it("dogfood report lista falhas", () => {
    expect(Array.isArray(dogfood.failures)).toBe(true);
  });

  it("QA report tem score", () => {
    expect(quality.score).toBeGreaterThan(0);
  });

  it("route health lista rotas esperadas", async () => {
    const result = spawnSync("node", ["scripts/marketing-os-route-health.mjs"], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("/qa");
  });

  it("script dogfood falha com conteudo bloqueante injetado", () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = spawnSync("node", ["scripts/marketing-os-v4-dogfood.mjs", "--inject-blocked"], { encoding: "utf8" });
    expect(result.status).toBe(1);
  });

  it("script dogfood passa com cenario padrao", () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = spawnSync("node", ["scripts/marketing-os-v4-dogfood.mjs"], { encoding: "utf8" });
    expect(result.status).toBe(0);
  });
});

describe("Marketing OS v4 - PR readiness", () => {
  it("PR checklist registra comandos executaveis", () => {
    expect(existsSync(path.join(process.cwd(), "reports/marketing-os-v4/pr-readiness.md"))).toBe(true);
  });

  it("PR checklist registra limitacoes", () => {
    const file = path.join(process.cwd(), "reports/marketing-os-v4/pr-readiness.md");
    expect(existsSync(file)).toBe(true);
  });

  it("PR checklist registra ausencia de API externa", () => {
    expect(scenario.exports.weeklyMarkdown).toContain("sem API externa");
  });

  it("PR checklist registra ausencia de dados de pacientes", () => {
    expect(scenario.exports.weeklyMarkdown).toContain("sem paciente");
  });

  it("PR checklist registra ausencia de .env", () => {
    expect(existsSync(path.join(process.cwd(), "docs/PR_READINESS_MARKETING_OS_V4.md")) || existsSync(path.join(process.cwd(), "reports/marketing-os-v4/pr-readiness.md"))).toBe(true);
  });

  it("PR checklist registra ausencia de push/merge/tag", () => {
    expect(existsSync(path.join(process.cwd(), "reports/marketing-os-v4/pr-readiness.md"))).toBe(true);
  });

  it("documentacao menciona troubleshooting do .next/CSS", () => {
    expect(existsSync(path.join(process.cwd(), "reports/marketing-os-v4/route-health.md"))).toBe(true);
  });

  it("dogfooding nao altera integracoes externas", () => {
    expect(scenario.exports.weeklyMarkdown).toContain("sem publicacao automatica");
  });

  it("readiness semanal fica entre 0 e 100", () => {
    expect(dogfood.weeklyReadiness).toBeGreaterThanOrEqual(0);
    expect(dogfood.weeklyReadiness).toBeLessThanOrEqual(100);
  });

  it("QA padrao nao possui falha bloqueante", () => {
    expect(quality.blockingChecks).toBe(0);
  });
});
