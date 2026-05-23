import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklyCollectionDecisionGate } from "@/lib/weeklyCollectionDecisionGate";
import {
  buildWeeklyCollectionWorkspace,
  createInitialWorkspaceState,
  type WeeklyCollectionWorkspace,
  type WeeklyCollectionWorkspaceState
} from "@/lib/weeklyCollectionWorkspace";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import { createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

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
    googleConversions: 0,
    instagramStories: 12,
    instagramReels: 1,
    instagramPosts: 2,
    instagramProfileVisits: 1290,
    whatsappTotal: 126,
    qualifiedConversations: 42,
    consultationsScheduled: null,
    consultationsAttended: null,
    surgeriesClosed: null,
    notes: "Semana agregada com tracking em revisao e sem dados pessoais.",
    ...overrides
  });
}

function makeWorkspace(): WeeklyCollectionWorkspace {
  return buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(makeWeek()));
}

function stateWith(
  workspace: WeeklyCollectionWorkspace,
  getStatus: (item: WeeklyCollectionWorkspace["items"][number]) => WeeklyCollectionWorkspaceState["statuses"][string]
): WeeklyCollectionWorkspaceState {
  return {
    statuses: Object.fromEntries(workspace.items.map((item) => [item.id, getStatus(item)])),
    updatedAt: "2026-05-16T12:00:00.000Z"
  };
}

describe("Weekly Collection Decision Gate", () => {
  it("marca a coleta completa como pronta para salvamento manual", () => {
    const workspace = makeWorkspace();
    const gate = buildWeeklyCollectionDecisionGate(workspace, stateWith(workspace, () => "done"));

    expect(gate.status).toBe("ready_to_save");
    expect(gate.severity).toBe("success");
    expect(gate.canRecommendSave).toBe(true);
    expect(gate.summary).toContain("pronta");
    expect(gate.copyText.toLocaleLowerCase("pt-BR")).toContain("pronto para salvar");
    expect(gate.copyText.toLocaleLowerCase("pt-BR")).toContain("revisao humana");
  });

  it("mantem coleta pendente quando ainda ha tarefas nao concluidas", () => {
    const workspace = makeWorkspace();
    const initial = createInitialWorkspaceState(workspace);
    const gate = buildWeeklyCollectionDecisionGate(workspace, initial);

    expect(gate.status).toBe("needs_collection");
    expect(gate.canRecommendSave).toBe(false);
    expect(gate.pendingItems.length).toBeGreaterThan(0);
    expect(gate.nextActions.join(" ")).toContain("Completar coleta");
  });

  it("separa revisao final quando faltam apenas gates humanos", () => {
    const workspace = makeWorkspace();
    const gate = buildWeeklyCollectionDecisionGate(
      workspace,
      stateWith(workspace, (item) => (item.kind === "review_gate" ? "pending" : "done"))
    );

    expect(gate.status).toBe("review_required");
    expect(gate.severity).toBe("warning");
    expect(gate.canRecommendSave).toBe(false);
    expect(gate.nextActions.join(" ")).toContain("Concluir gate");
  });

  it("bloqueia conclusao forte quando existe item bloqueado", () => {
    const workspace = makeWorkspace();
    const blockedItem = workspace.items[0];
    const gate = buildWeeklyCollectionDecisionGate(workspace, stateWith(workspace, (item) => (item.id === blockedItem.id ? "blocked" : "done")));

    expect(gate.status).toBe("blocked");
    expect(gate.severity).toBe("critical");
    expect(gate.canRecommendSave).toBe(false);
    expect(gate.blockedItems).toContain(blockedItem.title);
    expect(gate.nextActions.join(" ")).toContain("Resolver bloqueio");
  });

  it("gera texto copiavel conservador e sem autorizacao externa", () => {
    const workspace = makeWorkspace();
    const gate = buildWeeklyCollectionDecisionGate(workspace, createInitialWorkspaceState(workspace));
    const text = gate.copyText.toLocaleLowerCase("pt-BR");

    expect(text).toContain("somente metricas agregadas");
    expect(text).toContain("sem dados pessoais");
    expect(text).toContain("sem api externa");
    expect(text).toContain("dezembro/2025");
    expect(text).toContain("revisao humana");
    expect(text).not.toMatch(/api liberada|envio automatico liberado|publicacao automatica liberada|dados de paciente/);
  });

  it("integra gate ao painel e documentacao v3.1", () => {
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyCollectionWorkspacePanel.tsx"), "utf8");
    const route = readFileSync(path.join(process.cwd(), "app", "data", "collection-workspace", "page.tsx"), "utf8");
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_COLLECTION_DECISION_GATE_V3_1.md"), "utf8");
    const text = `${readme}\n${docs}`.toLocaleLowerCase("pt-BR");

    expect(panel).toContain("buildWeeklyCollectionDecisionGate");
    expect(panel).toContain("Gate de decisao da coleta");
    expect(panel).toContain("Copiar gate");
    expect(panel).not.toContain("<textarea");
    expect(route).toContain("gate de decisao");
    expect(text).toContain("v3.1 - gate de decisao da coleta");
    expect(text).toContain("nao salva automaticamente");
    expect(text).toContain("sem api externa");
    expect(text).toContain("dezembro/2025");
  });
});
