import { describe, expect, it } from "vitest";
import {
  buildDailyDataCaptureChecklist,
  buildDailyBriefGuardrails,
  buildStoryDailyBrief,
  buildStoryDailyBriefFromBoard,
  selectStoryDailyBriefDay,
  storyDailyBriefStatusLabel
} from "@/lib/storyDailyBrief";
import { buildStoryDayExecutionBoard, type StoryExecutionItem } from "@/lib/storyExecutionBoard";
import { buildStoryWeekExportPackage } from "@/lib/storyWeekExport";

describe("Story Daily Brief", () => {
  it("cria briefing diario para a data selecionada", () => {
    const brief = buildStoryDailyBrief({ date: "2026-05-16" });

    expect(brief.dayLabel).toContain("bado");
    expect(brief.date).toBe("2026-05-16");
    expect(brief.totalStories).toBe(10);
    expect(brief.sourceLinks.some((link) => link.href === "/stories/execution")).toBe(true);
  });

  it("faz fallback seguro para o primeiro dia quando a data nao existe", () => {
    const pkg = buildStoryWeekExportPackage();
    const selected = selectStoryDailyBriefDay(pkg, { date: "2026-12-25" });

    expect(selected.date).toBe(pkg.dayPackages[0].date);
  });

  it("mantem fila de revisao para itens com risco etico ou privacidade", () => {
    const brief = buildStoryDailyBrief({ date: "2026-05-15" });

    expect(brief.reviewQueue.length).toBeGreaterThan(0);
    expect(brief.topPriorities.some((action) => action.type === "review" || action.type === "privacy")).toBe(true);
  });

  it("classifica o dia como pronto quando nao ha bloqueios nem revisao", () => {
    const pkg = buildStoryWeekExportPackage();
    const dayPackage = pkg.dayPackages[0];
    const board = buildStoryDayExecutionBoard(dayPackage);
    const updatedItems: StoryExecutionItem[] = board.items.map((item) => ({ ...item, privacyRisk: "low" as const, ethicalWarnings: [], executionStatus: "ready_for_manual_publish" as const }));
    const readyBoard = buildStoryDayExecutionBoard({ ...dayPackage, slots: dayPackage.slots.map((slot) => ({ ...slot, ethicalWarnings: [], privacyRisk: "low" as const, status: "ready_for_manual_publish" as const })) });
    const brief = buildStoryDailyBriefFromBoard(pkg, dayPackage, { ...readyBoard, items: updatedItems, needsReviewCount: 0, blockedCount: 0, readyCount: updatedItems.length, status: "ready_for_manual_publish" });

    expect(brief.status).toBe("ready_for_manual_execution");
    expect(brief.manualPublishQueue.length).toBeGreaterThan(0);
  });

  it("checklist de metricas usa apenas dados agregados", () => {
    const checklist = buildDailyDataCaptureChecklist().join(" ");

    expect(checklist).toContain("agregadas");
    expect(checklist).toContain("sem nomes");
    expect(checklist).not.toMatch(/\bCPF\b|\bRG\b|prontuario/i);
  });

  it("guardrails deixam claro que nao ha API nem publicacao automatica", () => {
    const guardrails = buildDailyBriefGuardrails().join(" ");

    expect(guardrails).toContain("Publicacao sempre manual");
    expect(guardrails).toContain("nao chama Instagram");
    expect(guardrails).toContain("APIs externas");
    expect(guardrails).toContain("metricas agregadas");
  });

  it("recomendacoes usam linguagem conservadora e sem promessa de resultado", () => {
    const brief = buildStoryDailyBrief({ date: "2026-05-16" });
    const text = [
      brief.mainWarning,
      ...brief.topPriorities.map((action) => `${action.title} ${action.description}`),
      ...brief.nextActions.map((action) => `${action.title} ${action.description}`),
      ...brief.guardrails
    ].join(" ").toLowerCase();

    expect(text).not.toMatch(/resultado garantido|garante|postar automaticamente|capturar pacientes/);
    expect(text).toContain("manual");
  });

  it("labels de status cobrem leitura limitada, revisao e bloqueio", () => {
    expect(storyDailyBriefStatusLabel("limited_data")).toContain("limitada");
    expect(storyDailyBriefStatusLabel("needs_review")).toContain("revisao");
    expect(storyDailyBriefStatusLabel("blocked")).toContain("Bloqueado");
  });
});
