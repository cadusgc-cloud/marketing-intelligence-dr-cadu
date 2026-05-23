import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWeeklyCollectionWorkspace,
  buildWeeklyCollectionWorkspaceSummaryText,
  calculateWeeklyCollectionWorkspaceProgress,
  createInitialWorkspaceState,
  normalizeWorkspaceState
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

describe("Weekly Collection Workspace", () => {
  it("transforma plano de coleta em checklist local", () => {
    const workspace = buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(makeWeek()));

    expect(workspace.title).toBe("Workspace local de coleta semanal");
    expect(workspace.storageKey).toContain("marketing-os:weekly-collection-workspace");
    expect(workspace.items.map((item) => item.kind)).toEqual(expect.arrayContaining(["task", "daily", "weekly_close", "review_gate"]));
    expect(workspace.nextRoutes.map((route) => route.href)).toEqual(expect.arrayContaining(["/data", "/data/next-collection-plan", "/data/manual-review-trail", "/weekly"]));
  });

  it("calcula progresso sem persistir dados reais", () => {
    const workspace = buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(makeWeek()));
    const initial = createInitialWorkspaceState(workspace);
    const firstTask = workspace.items[0];
    const secondTask = workspace.items[1];
    const state = normalizeWorkspaceState(workspace, {
      statuses: {
        ...initial.statuses,
        [firstTask.id]: "done",
        [secondTask.id]: "blocked"
      },
      updatedAt: "2026-05-16T12:00:00.000Z"
    });
    const progress = calculateWeeklyCollectionWorkspaceProgress(workspace, state);

    expect(progress.done).toBe(1);
    expect(progress.blocked).toBe(1);
    expect(progress.status).toBe("blocked");
    expect(progress.summary).toContain("bloqueio");
  });

  it("normaliza estado local invalido para pendente", () => {
    const workspace = buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(makeWeek()));
    const state = normalizeWorkspaceState(workspace, {
      statuses: {
        [workspace.items[0].id]: "done",
        [workspace.items[1].id]: "sensitive-note" as never
      },
      updatedAt: 123 as never
    });

    expect(state.statuses[workspace.items[0].id]).toBe("done");
    expect(state.statuses[workspace.items[1].id]).toBe("pending");
    expect(state.updatedAt).toBeNull();
  });

  it("gera resumo copiavel apenas com status e guardrails", () => {
    const workspace = buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(makeWeek()));
    const state = createInitialWorkspaceState(workspace);
    const summary = buildWeeklyCollectionWorkspaceSummaryText(workspace, state).toLocaleLowerCase("pt-BR");

    expect(summary).toContain("workspace local de coleta semanal");
    expect(summary).toContain("[pending]");
    expect(summary).toContain("guardrails");
    expect(summary).not.toMatch(/nome do paciente|telefone do paciente|dm privada|print privado obrigatorio/);
  });

  it("integra painel e rota dedicada no fluxo de /data", () => {
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyCollectionWorkspacePanel.tsx"), "utf8");
    const route = readFileSync(path.join(process.cwd(), "app", "data", "collection-workspace", "page.tsx"), "utf8");
    const plan = readFileSync(path.join(process.cwd(), "lib", "weeklyNextCollectionPlan.ts"), "utf8");
    const packet = readFileSync(path.join(process.cwd(), "lib", "weeklyNextCollectionPacket.ts"), "utf8");

    expect(dataClient).toContain("WeeklyCollectionWorkspacePanel");
    expect(dataClient).toContain("buildWeeklyCollectionWorkspace");
    expect(panel).toContain("localStorage");
    expect(panel).toContain("Copiar status");
    expect(panel).toContain("Copiar gate");
    expect(panel).toContain("Gate de decisao da coleta");
    expect(panel).toContain("Copiar handoff");
    expect(panel).toContain("Handoff pre-salvamento da semana");
    expect(panel).toContain("Copiar trilha");
    expect(panel).toContain("Trilha de revisao manual da semana");
    expect(panel).toContain("Primeiro foco");
    expect(panel).toContain("Ir para foco");
    expect(panel).not.toContain("<textarea");
    expect(route).toContain("WeeklyCollectionWorkspacePanel");
    expect(route).toContain("buildWeeklySaveReadinessReport");
    expect(plan).toContain("/data/collection-workspace");
    expect(packet).toContain("/data/collection-workspace");
  });

  it("documenta a v3.0 sem API, banco ou dados pessoais", () => {
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_COLLECTION_WORKSPACE_V3_0.md"), "utf8");
    const text = `${readme}\n${docs}`.toLocaleLowerCase("pt-BR");

    expect(text).toContain("v3.0 - workspace local de coleta");
    expect(text).toContain("localstorage");
    expect(text).toContain("nao salva progresso no banco");
    expect(text).toContain("nao conecta apis");
    expect(text).toContain("dados pessoais");
  });
});
