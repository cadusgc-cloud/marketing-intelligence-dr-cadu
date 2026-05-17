import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import { buildWeeklySaveConfirmationGate } from "@/lib/weeklySaveConfirmationGate";
import { buildWeeklySourceEvidenceLedger } from "@/lib/weeklySourceEvidenceLedger";
import { buildWeeklySaveReadinessReport, createEmptyWeeklyMarketingData, createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

function makeWeek(overrides: Partial<WeeklyMarketingData> = {}): WeeklyMarketingData {
  return createWeeklyMarketingDataFromEditableFields({
    id: "week-current",
    weekLabel: "Semana atual",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    metaSpend: 780,
    metaWhatsappConversations: 118,
    metaProfileVisits: 6100,
    googleSpend: 220,
    googleClicks: 48,
    googleConversions: 4,
    instagramStories: 42,
    instagramReels: 3,
    instagramPosts: 2,
    instagramProfileVisits: 1290,
    whatsappTotal: 126,
    qualifiedConversations: 42,
    consultationsScheduled: 12,
    consultationsAttended: 9,
    surgeriesClosed: 2,
    notes: "Semana agregada completa e sem dados pessoais.",
    ...overrides
  });
}

function buildGate(data: WeeklyMarketingData) {
  return buildWeeklySaveConfirmationGate({
    saveReadiness: buildWeeklySaveReadinessReport(data),
    collectionReadiness: buildWeeklyCollectionReadinessBoard(data),
    sourceEvidenceLedger: buildWeeklySourceEvidenceLedger(data)
  });
}

describe("Weekly Save Confirmation Gate", () => {
  it("marca semana completa como pronta para salvar manualmente", () => {
    const gate = buildGate(makeWeek());

    expect(gate.status).toBe("ready_to_save");
    expect(gate.severity).toBe("success");
    expect(gate.canSubmit).toBe(true);
    expect(gate.submitLabel).toBe("Salvar semana");
    expect(gate.checks.every((check) => check.status === "ok")).toBe(true);
    expect(gate.copyMarkdown).toContain("Conferencia final antes de salvar");
  });

  it("bloqueia quando campos essenciais do formulario estao ausentes", () => {
    const gate = buildGate(createEmptyWeeklyMarketingData());

    expect(gate.status).toBe("blocked");
    expect(gate.severity).toBe("critical");
    expect(gate.canSubmit).toBe(false);
    expect(gate.submitLabel).toBe("Resolver bloqueio");
    expect(gate.checks.find((check) => check.id === "form-readiness")?.status).toBe("blocked");
  });

  it("bloqueia quando o mapa de origem indica risco de privacidade", () => {
    const gate = buildGate(makeWeek({ notes: "CPF 000 e telefone individual apareceram no rascunho." }));

    expect(gate.status).toBe("blocked");
    expect(gate.canSubmit).toBe(false);
    expect(gate.checks.find((check) => check.id === "source-evidence")?.status).toBe("blocked");
    expect(gate.checks.find((check) => check.id === "privacy-safety")?.status).toBe("blocked");
  });

  it("permite salvar com cautela quando ha lacunas operacionais nao bloqueadoras", () => {
    const gate = buildGate(
      makeWeek({
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null,
        instagramStories: 12,
        instagramReels: 1
      })
    );

    expect(gate.status).toBe("review_before_save");
    expect(gate.severity).toBe("warning");
    expect(gate.canSubmit).toBe(true);
    expect(gate.summary).toContain("cautela");
    expect(gate.nextActions.join(" ")).toContain("leitura limitada");
  });

  it("preserva guardrails de seguranca e ausencia de automacao externa", () => {
    const gate = buildGate(makeWeek());
    const text = gate.copyMarkdown.toLocaleLowerCase("pt-BR");

    expect(text).toContain("metricas agregadas");
    expect(text).toContain("nao salvar nomes");
    expect(text).toContain("api externa");
    expect(text).toContain("dezembro/2025");
    expect(text).not.toMatch(/api obrigatoria|oauth obrigatorio|scraping liberado|publicacao automatica liberada/);
  });

  it("integra gate final na tela /data, docs e README", () => {
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklySaveConfirmationGatePanel.tsx"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_SAVE_CONFIRMATION_GATE_V3_6.md"), "utf8");
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");

    expect(dataClient).toContain("buildWeeklySaveConfirmationGate");
    expect(dataClient).toContain("WeeklySaveConfirmationGatePanel");
    expect(dataClient).toContain("blocked={!saveConfirmationGate.canSubmit}");
    expect(dataClient).toContain("id=\"weekly-collection-readiness\"");
    expect(panel).toContain("weekly-save-confirmation-gate");
    expect(panel).toContain("Copiar conferencia");
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("v3.6");
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("conferencia final antes de salvar");
  });
});
