import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklyCollectionDecisionGate } from "@/lib/weeklyCollectionDecisionGate";
import { buildWeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import { buildWeeklyCollectionSaveHandoff } from "@/lib/weeklyCollectionSaveHandoff";
import {
  buildWeeklyCollectionWorkspace,
  createInitialWorkspaceState,
  type WeeklyCollectionWorkspace,
  type WeeklyCollectionWorkspaceState
} from "@/lib/weeklyCollectionWorkspace";
import { buildWeeklyManualReviewTrail } from "@/lib/weeklyManualReviewTrail";
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

function stateWith(
  workspace: WeeklyCollectionWorkspace,
  getStatus: (item: WeeklyCollectionWorkspace["items"][number]) => WeeklyCollectionWorkspaceState["statuses"][string]
): WeeklyCollectionWorkspaceState {
  return {
    statuses: Object.fromEntries(workspace.items.map((item) => [item.id, getStatus(item)])),
    updatedAt: "2026-05-17T12:00:00.000Z"
  };
}

function buildTrail(data: WeeklyMarketingData, stateFactory: (workspace: WeeklyCollectionWorkspace) => WeeklyCollectionWorkspaceState) {
  const collectionReadiness = buildWeeklyCollectionReadinessBoard(data);
  const workspace = buildWeeklyCollectionWorkspace(buildWeeklyNextCollectionPlan(data, collectionReadiness));
  const state = stateFactory(workspace);
  const decisionGate = buildWeeklyCollectionDecisionGate(workspace, state);
  const saveReadiness = buildWeeklySaveReadinessReport(data);
  const saveHandoff = buildWeeklyCollectionSaveHandoff(decisionGate, saveReadiness);

  return buildWeeklyManualReviewTrail({
    workspace,
    state,
    decisionGate,
    saveHandoff,
    saveReadiness,
    collectionReadiness
  });
}

describe("Weekly Manual Review Trail", () => {
  it("gera trilha pronta quando coleta, formulario e fontes estao prontos", () => {
    const trail = buildTrail(makeWeek(), (workspace) => stateWith(workspace, () => "done"));

    expect(trail.status).toBe("ready");
    expect(trail.summary).toContain("salvamento manual");
    expect(trail.copyMarkdown).toContain("# Trilha de revisao manual da semana");
    expect(trail.copyMarkdown).toContain("Decisao humana");
    expect(trail.copyMarkdown).toContain("Salvar semana manualmente em /data");
  });

  it("marca coleta pendente quando o workspace ainda nao foi concluido", () => {
    const trail = buildTrail(makeWeek(), (workspace) => createInitialWorkspaceState(workspace));

    expect(trail.status).toBe("collecting");
    expect(trail.copyMarkdown.toLocaleLowerCase("pt-BR")).toContain("coleta pendente");
    expect(trail.sections.find((section) => section.id === "collection-progress")?.lines.join(" ")).toContain("Primeira pendencia");
  });

  it("marca revisao quando formulario ou fonte ainda pedem conferencia", () => {
    const trail = buildTrail(makeWeek({ consultationsScheduled: null, consultationsAttended: null, surgeriesClosed: null }), (workspace) =>
      stateWith(workspace, () => "done")
    );

    expect(trail.status).toBe("review");
    expect(trail.copyMarkdown.toLocaleLowerCase("pt-BR")).toContain("revisao humana pendente");
    expect(trail.copyMarkdown).toContain("Funil comercial");
  });

  it("bloqueia quando ha risco de privacidade ou item bloqueado", () => {
    const trail = buildTrail(makeWeek({ notes: "CPF e telefone individual apareceram no rascunho." }), (workspace) =>
      stateWith(workspace, (item) => (item.id === workspace.items[0].id ? "blocked" : "done"))
    );

    expect(trail.status).toBe("blocked");
    expect(trail.copyMarkdown.toLocaleLowerCase("pt-BR")).toContain("bloqueada");
    expect(trail.copyMarkdown).toContain("Primeiro bloqueio");
  });

  it("mantem guardrails de privacidade, dezembro de 2025 e ausencia de API externa", () => {
    const trail = buildTrail(makeWeek(), (workspace) => stateWith(workspace, () => "done"));
    const text = trail.copyMarkdown.toLocaleLowerCase("pt-BR");

    expect(text).toContain("dados pessoais");
    expect(text).toContain("api externa");
    expect(text).toContain("nao salva automaticamente");
    expect(text).toContain("dezembro/2025");
    expect(text).not.toMatch(/publicacao automatica liberada|api liberada|dados de paciente/);
  });

  it("integra trilha no painel, rota, documentos e README", () => {
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyCollectionWorkspacePanel.tsx"), "utf8");
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const workspaceRoute = readFileSync(path.join(process.cwd(), "app", "data", "collection-workspace", "page.tsx"), "utf8");
    const workspaceLib = readFileSync(path.join(process.cwd(), "lib", "weeklyCollectionWorkspace.ts"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_MANUAL_REVIEW_TRAIL_V3_4.md"), "utf8");
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const routePath = path.join(process.cwd(), "app", "data", "manual-review-trail", "page.tsx");

    expect(panel).toContain("buildWeeklyManualReviewTrail");
    expect(panel).toContain("Trilha de revisao manual da semana");
    expect(panel).toContain("Copiar trilha");
    expect(panel).not.toContain("<textarea");
    expect(dataClient).toContain("collectionReadiness={collectionReadiness}");
    expect(dataClient).toContain('id="weekly-fields-identity"');
    expect(workspaceRoute).toContain("collectionReadiness={collectionReadiness}");
    expect(workspaceLib).toContain("/data/manual-review-trail");
    expect(existsSync(routePath)).toBe(true);
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("v3.4");
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("trilha de revisao manual");
  });
});
