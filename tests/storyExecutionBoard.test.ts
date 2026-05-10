import { describe, expect, it } from "vitest";
import { buildStoryWeekExportPackage } from "@/lib/storyWeekExport";
import {
  buildStoryDayExecutionBoard,
  buildStoryExecutionBoardFromExportPackage,
  calculateStoryExecutionProgress,
  filterStoryExecutionItemsByDay,
  filterStoryExecutionItemsByPriority,
  filterStoryExecutionItemsByStatus,
  generateStoryExecutionChecklist,
  getBlockedStoryItems,
  getItemsNeedingReview,
  getManuallyPublishedItems,
  getPendingStoryItems,
  getReadyToPublishItems,
  summarizeStoryExecution,
  updateStoryExecutionNotes,
  updateStoryExecutionStatus,
  updateStoryPublishedUrl,
  validateStoryDayExecutionBoard,
  validateStoryExecutionItem
} from "@/lib/storyExecutionBoard";

describe("Story Execution Board", () => {
  it("buildStoryDayExecutionBoard cria board diario", () => {
    const board = buildStoryDayExecutionBoard();

    expect(board.dayLabel).toBe("Segunda-feira");
    expect(board.totalStories).toBe(10);
  });

  it("board diario contem 10 stories", () => {
    expect(buildStoryExecutionBoardFromExportPackage().items).toHaveLength(10);
  });

  it("summarizeStoryExecution calcula pendentes, revisao, prontos e publicados", () => {
    const board = buildStoryDayExecutionBoard();
    const publishedItems = updateStoryExecutionStatus(board.items, board.items[0].id, "manually_published");
    const updatedBoard = { ...board, items: publishedItems, manuallyPublishedCount: 1 };
    const summary = summarizeStoryExecution(updatedBoard);

    expect(summary.totalStories).toBe(10);
    expect(summary.needsReviewCount).toBeGreaterThan(0);
    expect(summary.manuallyPublishedCount).toBe(1);
    expect(summary.readyCount).toBeGreaterThanOrEqual(0);
  });

  it("calculateStoryExecutionProgress calcula progresso", () => {
    const board = buildStoryDayExecutionBoard();
    const items = updateStoryExecutionStatus(board.items, board.items[0].id, "manually_published");

    expect(calculateStoryExecutionProgress(items)).toBe(10);
  });

  it("itens com risco etico ficam needs_review ou blocked", () => {
    const board = buildStoryExecutionBoardFromExportPackage(buildStoryWeekExportPackage(), "Sexta-feira");
    const riskyItems = board.items.filter((item) => item.privacyRisk === "high" || /paciente|resultado|depoimento|antes-depois/.test(item.suggestedFilename));

    expect(riskyItems.length).toBeGreaterThan(0);
    expect(riskyItems.every((item) => item.executionStatus === "needs_review" || item.executionStatus === "blocked")).toBe(true);
  });

  it("updateStoryExecutionStatus altera status de item", () => {
    const board = buildStoryDayExecutionBoard();
    const [first] = board.items;
    const updated = updateStoryExecutionStatus(board.items, first.id, "approved");

    expect(updated.find((item) => item.id === first.id)?.executionStatus).toBe("approved");
  });

  it("updateStoryExecutionNotes altera observacao", () => {
    const board = buildStoryDayExecutionBoard();
    const [first] = board.items;
    const updated = updateStoryExecutionNotes(board.items, first.id, "Ajustar legenda antes de publicar.");

    expect(updated.find((item) => item.id === first.id)?.notes).toContain("Ajustar legenda");
  });

  it("updateStoryPublishedUrl registra URL simulada", () => {
    const board = buildStoryDayExecutionBoard();
    const [first] = board.items;
    const updated = updateStoryPublishedUrl(board.items, first.id, "https://instagram.com/stories/exemplo");

    expect(updated.find((item) => item.id === first.id)?.publishedUrl).toContain("instagram.com");
  });

  it("getPendingStoryItems filtra pendentes", () => {
    const board = buildStoryDayExecutionBoard();
    const pendingItem = { ...board.items[0], executionStatus: "pending" as const };

    expect(getPendingStoryItems([pendingItem, ...board.items.slice(1)])).toHaveLength(1);
  });

  it("getItemsNeedingReview filtra revisao", () => {
    expect(getItemsNeedingReview(buildStoryDayExecutionBoard().items).length).toBeGreaterThan(0);
  });

  it("getReadyToPublishItems filtra prontos", () => {
    const board = buildStoryDayExecutionBoard();
    const readyItem = { ...board.items[0], executionStatus: "ready_for_manual_publish" as const };

    expect(getReadyToPublishItems([readyItem, ...board.items.slice(1)]).length).toBeGreaterThan(0);
  });

  it("getManuallyPublishedItems filtra publicados", () => {
    const board = buildStoryDayExecutionBoard();
    const items = updateStoryExecutionStatus(board.items, board.items[0].id, "manually_published");

    expect(getManuallyPublishedItems(items)).toHaveLength(1);
  });

  it("getBlockedStoryItems filtra bloqueados", () => {
    const board = buildStoryDayExecutionBoard();
    const items = updateStoryExecutionStatus(board.items, board.items[0].id, "blocked");

    expect(getBlockedStoryItems(items)).toHaveLength(1);
  });

  it("generateStoryExecutionChecklist inclui revisao, CTA, midia final, publicacao manual e registro", () => {
    const checklist = generateStoryExecutionChecklist(buildStoryDayExecutionBoard()).map((item) => `${item.label} ${item.description}`).join(" ");

    expect(checklist).toContain("Revisar");
    expect(checklist).toContain("CTA");
    expect(checklist).toContain("midia");
    expect(checklist).toContain("Publicar");
    expect(checklist).toContain("Registrar");
  });

  it("validateStoryExecutionItem bloqueia ou exige revisao para risco alto", () => {
    const riskyItem = buildStoryExecutionBoardFromExportPackage(buildStoryWeekExportPackage(), "Sexta-feira").items.find((item) => item.privacyRisk === "high");

    expect(riskyItem).toBeTruthy();
    expect(validateStoryExecutionItem(riskyItem!).join(" ")).toContain("risco alto");
  });

  it("filtros por status, prioridade e dia funcionam", () => {
    const board = buildStoryDayExecutionBoard();
    const riskBoard = buildStoryExecutionBoardFromExportPackage(buildStoryWeekExportPackage(), "Sexta-feira");

    expect(filterStoryExecutionItemsByStatus(board.items, "needs_review").length).toBeGreaterThan(0);
    expect(filterStoryExecutionItemsByPriority(riskBoard.items, "high").length).toBeGreaterThan(0);
    expect(filterStoryExecutionItemsByDay(board.items, "Segunda-feira")).toHaveLength(10);
  });

  it("validateStoryDayExecutionBoard gera avisos operacionais", () => {
    const warnings = validateStoryDayExecutionBoard(buildStoryDayExecutionBoard());

    expect(warnings.join(" ")).toContain("Status local");
  });
});
