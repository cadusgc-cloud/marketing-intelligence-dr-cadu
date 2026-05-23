import { describe, expect, it } from "vitest";
import {
  DEFAULT_CAMPAIGN_INPUT,
  EDITORIAL_PILLARS,
  MONTHLY_EDITORIAL_RISK_TERMS,
  buildCampaignExportBundle,
  evaluateMediaText,
  generateMonthlyEditorialPlan,
  runMonthlySafetyGate
} from "@/lib/monthly-editorial";

describe("Maquina Editorial mensal v2", () => {
  it("gera plano com 30 dias por padrao", () => {
    const plan = generateMonthlyEditorialPlan();

    expect(plan.days).toHaveLength(30);
    expect(plan.summary.totalDays).toBe(30);
    expect(plan.name).toBe(DEFAULT_CAMPAIGN_INPUT.name);
  });

  it("aceita duracao customizada", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 14 });

    expect(plan.days).toHaveLength(14);
    expect(plan.summary.totalDays).toBe(14);
  });

  it("agrupa dias em semanas", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 15 });

    expect(plan.weeks).toHaveLength(3);
    expect(plan.weeks[0].days).toHaveLength(7);
    expect(plan.weeks[2].days).toHaveLength(1);
  });

  it("cada dia tem pilar, tema e objetivo", () => {
    const plan = generateMonthlyEditorialPlan();

    expect(plan.days.every((day) => day.pillar.id && day.pillar.name)).toBe(true);
    expect(plan.days.every((day) => day.theme)).toBe(true);
    expect(plan.days.every((day) => day.dailyObjective)).toBe(true);
  });

  it("integra StoryOps em todos os dias", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 10 });

    expect(plan.days.every((day) => day.content.storySequence.items.length === 6)).toBe(true);
    expect(plan.days.every((day) => day.content.storySequence.exportText.includes("Story 6:"))).toBe(true);
  });

  it("stories mantem formato de exportacao do StoryOps", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 1 });
    const exportText = plan.days[0].content.storySequence.exportText;

    expect(exportText).toContain("Story 1:");
    expect(exportText).toContain("- foto/v");
    expect(exportText).toContain("- texto curto na tela:");
    expect(exportText).toContain("- observa");
  });

  it("reels respeitam intensidade leve", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 7, startDate: "2026-05-25", intensity: "leve" });

    expect(plan.summary.totalReels).toBe(2);
  });

  it("reels respeitam intensidade padrao", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 7, startDate: "2026-05-25", intensity: "padrao" });

    expect(plan.summary.totalReels).toBe(3);
  });

  it("reels respeitam intensidade intensa", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 7, startDate: "2026-05-25", intensity: "intensa" });

    expect(plan.summary.totalReels).toBe(5);
  });

  it("posts e carrosseis respeitam intensidade", () => {
    const leve = generateMonthlyEditorialPlan({ durationDays: 7, startDate: "2026-05-25", intensity: "leve" });
    const padrao = generateMonthlyEditorialPlan({ durationDays: 7, startDate: "2026-05-25", intensity: "padrao" });
    const intensa = generateMonthlyEditorialPlan({ durationDays: 7, startDate: "2026-05-25", intensity: "intensa" });

    expect(leve.summary.totalPostsAndCarousels).toBe(2);
    expect(padrao.summary.totalPostsAndCarousels).toBe(3);
    expect(intensa.summary.totalPostsAndCarousels).toBe(4);
  });

  it("finais de semana recebem tom mais leve sem sugerir acontecimento em tempo real", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 2, startDate: "2026-05-23" });
    const weekendText = plan.days.map((day) => `${day.tone} ${day.notes} ${day.dailyObjective}`).join(" ").toLowerCase();

    expect(plan.days[0].weekday).toBe("Sabado");
    expect(plan.days[1].weekday).toBe("Domingo");
    expect(weekendText).toContain("leve");
    expect(weekendText).not.toMatch(/no hospital agora|aqui na clinica agora|paciente de hoje|cirurgia de hoje/);
  });

  it("safety gate detecta promessa de resultado", () => {
    const gate = runMonthlySafetyGate("resultado garantido e corpo perfeito");

    expect(gate.classification).toBe("bloquear");
    expect(gate.issues.some((issue) => issue.category === "promessa_resultado")).toBe(true);
  });

  it("safety gate detecta antes/depois", () => {
    const gate = runMonthlySafetyGate("usar antes e depois como prova");

    expect(gate.classification).toBe("bloquear");
    expect(gate.issues.some((issue) => issue.category === "antes_depois")).toBe(true);
  });

  it("safety gate detecta CTA agressivo", () => {
    const gate = runMonthlySafetyGate("agende agora porque sao ultimas vagas");

    expect(gate.classification).toBe("revisar_antes_de_postar");
    expect(gate.issues.some((issue) => issue.category === "cta_agressivo")).toBe(true);
  });

  it("safety gate detecta diagnostico e prescricao", () => {
    const gate = runMonthlySafetyGate("diagnostico e prescreve tratamento ideal para voce");

    expect(gate.classification).toBe("bloquear");
    expect(gate.issues.some((issue) => issue.category === "diagnostico")).toBe(true);
    expect(gate.issues.some((issue) => issue.category === "prescricao")).toBe(true);
  });

  it("safety gate bloqueia termos graves", () => {
    const gate = runMonthlySafetyGate("paciente de hoje no hospital agora");

    expect(gate.blocks).toBe(true);
    expect(gate.score).toBeLessThan(70);
  });

  it("MediaOps alerta para paciente, prontuario e localizacao", () => {
    const gate = evaluateMediaText("paciente visivel, prontuario e localizacao revelada");

    expect(gate.blocks).toBe(true);
    expect(gate.detectedTerms).toEqual(expect.arrayContaining(["paciente visivel", "prontuario", "localizacao"]));
  });

  it("exportacao mensal contem todos os dias", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 5 });

    for (const day of plan.days) {
      expect(plan.exports.monthly_markdown).toContain(day.date);
    }
  });

  it("exportacao Google Sheets contem cabecalho esperado", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 1 });

    expect(plan.exports.google_sheets_tsv.split("\n")[0]).toBe("Data\tDia da semana\tPilar\tTema\tStories\tReel\tPost\tMidia sugerida\tStatus\tRisco\tObservacoes");
  });

  it("exportacao Google Agenda gera blocos por dia", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 3 });

    expect(plan.exports.google_agenda_text.match(/Titulo:/g)).toHaveLength(3);
    expect(plan.exports.google_agenda_text).toContain("Conteudo Dr. Cadu -");
  });

  it("motor e deterministico para a mesma entrada", () => {
    const input = { durationDays: 10, startDate: "2026-06-01", intensity: "padrao" as const };
    const first = generateMonthlyEditorialPlan(input);
    const second = generateMonthlyEditorialPlan(input);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("nao inventa local, paciente ou cirurgia do dia no conteudo padrao", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 10 });
    const generatedContent = plan.days
      .map((day) => [day.exportText, day.content.reelPlan?.exportText, day.content.postPlan?.exportText, day.content.carouselPlan?.exportText].filter(Boolean).join(" "))
      .join(" ")
      .toLowerCase();

    expect(generatedContent).not.toMatch(/paciente de hoje|cirurgia de hoje|no hospital agora|aqui na clinica agora/);
  });

  it("nao usa frases proibidas em conteudo gerado padrao", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 10 });
    const generatedContent = plan.days.map((day) => day.exportText).join(" ").toLowerCase();

    for (const riskyPhrase of ["resultado garantido", "transformacao completa", "corpo perfeito", "agende agora", "ultimas vagas"]) {
      expect(generatedContent).not.toContain(riskyPhrase);
    }
  });

  it("inclui checklist mensal de midia", () => {
    const plan = generateMonthlyEditorialPlan();

    expect(plan.mediaChecklist.monthlyItems.length).toBeGreaterThanOrEqual(5);
    expect(plan.mediaChecklist.prohibitedItems).toContain("prontuario");
  });

  it("inclui painel de riscos consolidado", () => {
    const plan = generateMonthlyEditorialPlan({ startDate: "2025-12-01", durationDays: 7 });

    expect(plan.safetyGate.issues.some((issue) => issue.id === "dezembro-2025-anomalia")).toBe(true);
    expect(plan.safetyGate.issues.some((issue) => issue.id === "publicacao-manual")).toBe(true);
  });

  it("preserva biblioteca de pilares e termos de risco", () => {
    expect(EDITORIAL_PILLARS).toHaveLength(15);
    expect(MONTHLY_EDITORIAL_RISK_TERMS).toEqual(expect.arrayContaining(["resultado garantido", "agende agora"]));
  });

  it("permite montar bundle de exportacao novamente", () => {
    const plan = generateMonthlyEditorialPlan({ durationDays: 2 });
    const bundle = buildCampaignExportBundle(plan);

    expect(bundle.monthly_markdown).toContain(plan.name);
    expect(bundle.stories).toContain("Story 1:");
    expect(bundle.media_checklist).toContain("Checklist MediaOps");
  });
});
