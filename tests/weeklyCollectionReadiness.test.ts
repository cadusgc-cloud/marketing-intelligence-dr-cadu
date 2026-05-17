import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWeeklyCollectionReadinessBoard,
  getBlockingCollectionSources,
  getSourcesNeedingCollection
} from "@/lib/weeklyCollectionReadiness";
import { createEmptyWeeklyMarketingData, createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

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
    notes: "Semana agregada com feriado leve e sem dados pessoais.",
    ...overrides
  });
}

describe("Weekly Collection Readiness", () => {
  it("marca coleta completa como pronta por fonte", () => {
    const board = buildWeeklyCollectionReadinessBoard(makeWeek());

    expect(board.status).toBe("ready");
    expect(board.score).toBe(100);
    expect(board.sources.map((source) => source.id)).toEqual([
      "week-identity",
      "instagram-organic",
      "meta-ads",
      "google-ads",
      "commercial-funnel",
      "execution-context"
    ]);
    expect(board.sources.every((source) => source.status === "ready")).toBe(true);
  });

  it("bloqueia rascunho sem identidade da semana", () => {
    const board = buildWeeklyCollectionReadinessBoard(createEmptyWeeklyMarketingData());

    expect(board.status).toBe("blocked");
    expect(getBlockingCollectionSources(board).map((source) => source.id)).toContain("week-identity");
    expect(board.summary).toContain("bloqueio");
    expect(board.priorityActions.join(" ")).toContain("Identidade da semana");
  });

  it("classifica fontes ausentes e incompletas sem impedir revisao humana", () => {
    const board = buildWeeklyCollectionReadinessBoard(
      makeWeek({
        instagramStories: 12,
        instagramReels: 1,
        googleConversions: 0,
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null
      })
    );

    expect(board.status).toBe("needs_review");
    expect(getSourcesNeedingCollection(board).map((source) => source.id)).toEqual(
      expect.arrayContaining(["instagram-organic", "google-ads", "commercial-funnel"])
    );
    expect(board.priorityActions.join(" ")).toContain("Google Ads");
    expect(board.priorityActions.join(" ")).toContain("funil");
  });

  it("mantem dezembro de 2025 como anomalia fora de benchmark normal", () => {
    const board = buildWeeklyCollectionReadinessBoard(
      makeWeek({
        weekLabel: "Semana Dezembro 2025",
        startDate: "2025-12-08",
        endDate: "2025-12-14"
      })
    );
    const identity = board.sources.find((source) => source.id === "week-identity");

    expect(board.status).toBe("needs_review");
    expect(identity?.status).toBe("needs_review");
    expect(identity?.reviewNotes.join(" ")).toContain("Dezembro/2025");
    expect(board.privacyGuardrails.join(" ")).toContain("Nao usar Dezembro/2025 como benchmark normal");
  });

  it("bloqueia observacoes com indicio de dado identificavel", () => {
    const board = buildWeeklyCollectionReadinessBoard(makeWeek({ notes: "CPF 000 e telefone individual aparecem no rascunho." }));

    expect(board.status).toBe("blocked");
    expect(getBlockingCollectionSources(board).map((source) => source.id)).toContain("execution-context");
    expect(board.sources.find((source) => source.id === "execution-context")?.nextAction).toContain("Remover");
  });

  it("preserva diretriz manual, interna e sem API obrigatoria", () => {
    const text = JSON.stringify(buildWeeklyCollectionReadinessBoard(makeWeek())).toLocaleLowerCase("pt-BR");

    expect(text).toContain("metricas agregadas");
    expect(text).toContain("revisao humana");
    expect(text).toContain("/data/collection-packet");
    expect(text).not.toMatch(/api obrigatoria|oauth obrigatorio|scraping liberado|envio automatico/);
  });

  it("integra o painel de prontidao por fonte na tela /data", () => {
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const readiness = readFileSync(path.join(process.cwd(), "lib", "weeklyCollectionReadiness.ts"), "utf8");

    expect(dataClient).toContain("buildWeeklyCollectionReadinessBoard");
    expect(dataClient).toContain("WeeklyCollectionReadinessBoardPanel");
    expect(dataClient).toContain("Prontidao da coleta por fonte");
    expect(readiness).toContain("buildWeeklyCollectionReadinessBoard");
    expect(readiness).toContain("/data/collection-packet");
    expect(readiness).toContain("/data/source-evidence");
    expect(readiness).toContain("Dezembro/2025");
  });
});
