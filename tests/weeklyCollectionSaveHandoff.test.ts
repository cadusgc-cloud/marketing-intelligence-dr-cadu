import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklyCollectionDecisionGate } from "@/lib/weeklyCollectionDecisionGate";
import { buildWeeklyCollectionSaveHandoff } from "@/lib/weeklyCollectionSaveHandoff";
import {
  buildWeeklyCollectionWorkspace,
  createInitialWorkspaceState,
  type WeeklyCollectionWorkspace,
  type WeeklyCollectionWorkspaceState
} from "@/lib/weeklyCollectionWorkspace";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import { buildWeeklySaveReadinessReport, createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

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

function makeWorkspace(data: WeeklyMarketingData): WeeklyCollectionWorkspace {
  return buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(data));
}

function stateWith(
  workspace: WeeklyCollectionWorkspace,
  getStatus: (item: WeeklyCollectionWorkspace["items"][number]) => WeeklyCollectionWorkspaceState["statuses"][string]
): WeeklyCollectionWorkspaceState {
  return {
    statuses: Object.fromEntries(workspace.items.map((item) => [item.id, getStatus(item)])),
    updatedAt: "2026-05-17T12:00:00.000Z"
  };
}

describe("Weekly Collection Save Handoff", () => {
  it("marca como pronto quando gate e formulario estao prontos", () => {
    const data = makeWeek();
    const workspace = makeWorkspace(data);
    const gate = buildWeeklyCollectionDecisionGate(workspace, stateWith(workspace, () => "done"));
    const handoff = buildWeeklyCollectionSaveHandoff(gate, buildWeeklySaveReadinessReport(data));

    expect(handoff.status).toBe("ready_to_save");
    expect(handoff.severity).toBe("success");
    expect(handoff.manualSaveAllowed).toBe(true);
    expect(handoff.summary).toContain("prontos");
    expect(handoff.copyText.toLocaleLowerCase("pt-BR")).toContain("pronto para salvar");
  });

  it("bloqueia quando o formulario tem campos essenciais ausentes", () => {
    const data = makeWeek({ weekLabel: "", startDate: "", endDate: "" });
    const workspace = makeWorkspace(makeWeek());
    const gate = buildWeeklyCollectionDecisionGate(workspace, stateWith(workspace, () => "done"));
    const handoff = buildWeeklyCollectionSaveHandoff(gate, buildWeeklySaveReadinessReport(data));

    expect(handoff.status).toBe("blocked");
    expect(handoff.severity).toBe("critical");
    expect(handoff.manualSaveAllowed).toBe(false);
    expect(handoff.nextActions.join(" ")).toContain("rotulo da semana");
  });

  it("pede coleta antes de salvar quando o workspace ainda tem pendencias", () => {
    const data = makeWeek();
    const workspace = makeWorkspace(data);
    const gate = buildWeeklyCollectionDecisionGate(workspace, createInitialWorkspaceState(workspace));
    const handoff = buildWeeklyCollectionSaveHandoff(gate, buildWeeklySaveReadinessReport(data));

    expect(handoff.status).toBe("collect_first");
    expect(handoff.manualSaveAllowed).toBe(false);
    expect(handoff.nextActions.join(" ")).toContain("Completar coleta");
  });

  it("permite salvamento manual com cautela quando o formulario exige revisao", () => {
    const data = makeWeek({ consultationsScheduled: null, consultationsAttended: null, surgeriesClosed: null, googleConversions: 0, instagramStories: 24 });
    const workspace = makeWorkspace(data);
    const gate = buildWeeklyCollectionDecisionGate(workspace, stateWith(workspace, () => "done"));
    const handoff = buildWeeklyCollectionSaveHandoff(gate, buildWeeklySaveReadinessReport(data));

    expect(handoff.status).toBe("review_before_save");
    expect(handoff.severity).toBe("warning");
    expect(handoff.manualSaveAllowed).toBe(true);
    expect(handoff.nextActions.join(" ")).toContain("Funil comercial incompleto");
  });

  it("gera texto copiavel com guardrails e sem autorizacao externa", () => {
    const data = makeWeek();
    const workspace = makeWorkspace(data);
    const gate = buildWeeklyCollectionDecisionGate(workspace, stateWith(workspace, () => "done"));
    const handoff = buildWeeklyCollectionSaveHandoff(gate, buildWeeklySaveReadinessReport(data));
    const text = handoff.copyText.toLocaleLowerCase("pt-BR");

    expect(text).toContain("nao salva automaticamente");
    expect(text).toContain("usar somente metricas agregadas");
    expect(text).toContain("nao usa api externa");
    expect(text).toContain("dezembro/2025");
    expect(text).not.toMatch(/api liberada|envio automatico liberado|publicacao automatica liberada|dados de paciente/);
  });

  it("integra handoff ao painel, rota e documentacao v3.2", () => {
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyCollectionWorkspacePanel.tsx"), "utf8");
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const route = readFileSync(path.join(process.cwd(), "app", "data", "collection-workspace", "page.tsx"), "utf8");
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_COLLECTION_SAVE_HANDOFF_V3_2.md"), "utf8");
    const text = `${readme}\n${docs}`.toLocaleLowerCase("pt-BR");

    expect(panel).toContain("buildWeeklyCollectionSaveHandoff");
    expect(panel).toContain("Handoff pre-salvamento da semana");
    expect(panel).toContain("Copiar handoff");
    expect(panel).not.toContain("<textarea");
    expect(dataClient).toContain("saveReadiness={saveReadiness}");
    expect(route).toContain("buildWeeklySaveReadinessReport");
    expect(text).toContain("v3.2 - handoff pre-salvamento");
    expect(text).toContain("nao salva automaticamente");
    expect(text).toContain("sem api externa");
  });
});
