import { describe, expect, it } from "vitest";
import {
  buildStoryOpsSequence,
  buildStorySafetyChecks,
  exportStorySequence,
  normalizeStoryOpsInput,
  storyOpsSafetyStatusLabel,
  STORYOPS_INITIAL_THEMES,
  STORYOPS_RISK_PHRASES
} from "@/lib/storyops";

describe("StoryOps Diario v2", () => {
  it("gera exatamente 6 stories", () => {
    const sequence = buildStoryOpsSequence({
      date: "2026-05-23",
      theme: "expectativa realista em cirurgia plastica",
      editorialLine: "expectativa_realista"
    });

    expect(sequence.items).toHaveLength(6);
    expect(sequence.exportText.match(/Story \d:/g)).toHaveLength(6);
  });

  it("cada story tem midia sugerida, texto curto e observacao de seguranca", () => {
    const sequence = buildStoryOpsSequence({
      theme: "seguranca em cirurgia plastica",
      editorialLine: "ciencia_e_estudo"
    });

    for (const item of sequence.items) {
      expect(item.mediaSuggestion.label).toBeTruthy();
      expect(item.mediaSuggestion.description).toBeTruthy();
      expect(item.textOnScreen).toBeTruthy();
      expect(item.textOnScreen.length).toBeLessThanOrEqual(92);
      expect(item.safetyNote).toBeTruthy();
      expect(item.editableNote).toContain("Editavel");
    }
  });

  it("bloqueia ou alerta tema vazio", () => {
    const sequence = buildStoryOpsSequence({
      theme: "",
      editorialLine: "educacao_medica_simples"
    });

    expect(sequence.safetyStatus).toBe("block");
    expect(sequence.safetyChecks.some((check) => check.category === "theme" && check.status === "block")).toBe(true);
  });

  it("alerta promessa de resultado", () => {
    const checks = buildStorySafetyChecks(
      normalizeStoryOpsInput({
        theme: "resultado garantido em abdominoplastia",
        editorialLine: "expectativa_realista"
      })
    );

    expect(checks.some((check) => check.category === "promise" && check.status === "block")).toBe(true);
  });

  it("alerta diagnostico ou prescricao", () => {
    const sequence = buildStoryOpsSequence({
      theme: "eu indico para voce o tratamento ideal para voce",
      editorialLine: "educacao_medica_simples"
    });

    expect(sequence.safetyChecks.some((check) => check.category === "diagnosis_prescription" && check.status === "block")).toBe(true);
  });

  it("alerta antes/depois", () => {
    const sequence = buildStoryOpsSequence({
      theme: "antes e depois de cirurgia plastica",
      editorialLine: "estetica_natural"
    });

    expect(sequence.safetyChecks.some((check) => check.category === "before_after" && check.status === "block")).toBe(true);
  });

  it("alerta CTA agressivo", () => {
    const sequence = buildStoryOpsSequence({
      theme: "agende agora ultimas vagas para transformar seu corpo",
      editorialLine: "expectativa_realista"
    });

    expect(sequence.safetyChecks.some((check) => check.category === "aggressive_cta" && check.status === "review")).toBe(true);
  });

  it("alerta bastidor especifico nao informado", () => {
    const sequence = buildStoryOpsSequence({
      theme: "rotina profissional neutra",
      editorialLine: "bastidor_leve",
      neutralContext: ""
    });

    expect(sequence.safetyChecks.some((check) => check.id === "neutral-context-missing")).toBe(true);
  });

  it("bloqueia bastidor especifico inventado ou localizado", () => {
    const sequence = buildStoryOpsSequence({
      theme: "no hospital agora com cirurgia de hoje",
      editorialLine: "rotina_profissional_neutra",
      neutralContext: "aqui na clinica agora"
    });

    expect(sequence.safetyStatus).toBe("block");
    expect(sequence.safetyChecks.some((check) => check.category === "specific_backstage" && check.status === "block")).toBe(true);
  });

  it("mantem linguagem curta e sem cara de campanha", () => {
    const sequence = buildStoryOpsSequence({
      theme: "cirurgia plastica e autoestima sem promessa",
      editorialLine: "estetica_natural"
    });
    const text = sequence.items.map((item) => item.textOnScreen).join(" ").toLowerCase();

    expect(sequence.items.every((item) => item.textOnScreen.length <= 92)).toBe(true);
    expect(text).not.toMatch(/agende agora|ultimas vagas|transforme seu corpo|resultado garantido/);
  });

  it("exporta no formato correto ate Story 6", () => {
    const sequence = buildStoryOpsSequence({
      theme: "limites da cirurgia plastica",
      editorialLine: "expectativa_realista"
    });
    const exported = exportStorySequence(sequence);

    expect(exported).toContain("Story 1:");
    expect(exported).toContain("Story 6:");
    expect(exported).toContain("- foto/vídeo sugerido:");
    expect(exported).toContain("- texto curto na tela:");
    expect(exported).toContain("- observação de segurança:");
    expect(exported.match(/Story \d:/g)).toHaveLength(6);
  });

  it("nao inventa local, paciente ou cirurgia do dia", () => {
    const sequence = buildStoryOpsSequence({
      theme: "planejamento antes da cirurgia",
      editorialLine: "rotina_profissional_neutra"
    });
    const text = sequence.exportText.toLowerCase();

    expect(text).not.toMatch(/paciente de hoje|cirurgia de hoje|no hospital agora|aqui na clinica agora|prontuario/);
  });

  it("reconhece domingo e sugere linha mais leve sem dizer que algo acontece agora", () => {
    const sequence = buildStoryOpsSequence({
      date: "2026-05-24",
      theme: "organizacao da semana",
      editorialLine: "reflexao_fim_de_dia"
    });

    expect(sequence.dayName).toBe("Domingo");
    expect(sequence.dayGuidance).toContain("Domingo");
    expect(sequence.safetyChecks.some((check) => check.id === "sunday-light-line")).toBe(true);
    const onScreenText = sequence.items.map((item) => item.textOnScreen).join(" ").toLowerCase();
    expect(onScreenText).not.toMatch(/agora|hospital|clinica|paciente|cirurgia de hoje/);
  });

  it("exibe bibliotecas iniciais de temas e frases de risco", () => {
    expect(STORYOPS_INITIAL_THEMES.length).toBeGreaterThanOrEqual(18);
    expect(STORYOPS_RISK_PHRASES).toContain("resultado garantido");
    expect(storyOpsSafetyStatusLabel("review")).toContain("Revisar");
  });
});
