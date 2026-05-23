import type { WeeklyMarketingWeek } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  mapWeeklyMarketingWeekToData,
  mapWeeklyMarketingWeekToSummary,
  isWeeklyMarketingWeekRecordExcludedFromNormalAnalysis,
  selectPreviousWeeklyMarketingWeekRecord,
  selectPreviousValidWeeklyMarketingWeekRecords,
  validateWeeklyMarketingWeekInput,
  type WeeklyMarketingWeekInput
} from "@/lib/weeklyMarketingWeeks";

const validInput: WeeklyMarketingWeekInput = {
  weekLabel: "Semana salva",
  startDate: "2026-05-11",
  endDate: "2026-05-17",
  metaSpend: 500,
  metaWhatsappConversations: 100,
  metaProfileVisits: 4000,
  googleSpend: 200,
  googleClicks: 50,
  googleConversions: 5,
  instagramStories: 42,
  instagramReels: 3,
  instagramPosts: 2,
  instagramProfileVisits: 900,
  whatsappTotal: 120,
  qualifiedConversations: 40,
  consultationsScheduled: 12,
  consultationsAttended: 9,
  surgeriesClosed: 2,
  notes: "Semana completa sem dados pessoais."
};

describe("Weekly Marketing Weeks", () => {
  const createdAt = new Date("2026-05-17T12:00:00.000Z");
  const updatedAt = new Date("2026-05-18T12:00:00.000Z");

  it("mapeia registro persistido para WeeklyMarketingData e recalcula metricas derivadas", () => {
    const record: WeeklyMarketingWeek = {
      id: "weekly-db-id",
      createdAt,
      updatedAt,
      ...validInput,
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    };

    const data = mapWeeklyMarketingWeekToData(record);

    expect(data.id).toBe("weekly-db-id");
    expect(data.metaCostPerWhatsapp).toBe(5);
    expect(data.metaCostPerProfileVisit).toBe(0.125);
    expect(data.googleCostPerClick).toBe(4);
    expect(data.googleConversionRate).toBe(0.1);
    expect(data.consultationsScheduled).toBeNull();
    expect(data.updatedAt).toBe(updatedAt);
  });

  it("mapeia resumo para seletor de historico semanal", () => {
    const summary = mapWeeklyMarketingWeekToSummary({
      id: "weekly-summary-id",
      createdAt,
      updatedAt,
      ...validInput
    });

    expect(summary).toEqual(
      expect.objectContaining({
        id: "weekly-summary-id",
        weekLabel: "Semana salva",
        startDate: "2026-05-11",
        endDate: "2026-05-17",
        operationalSnapshot: "100 conversas Meta, 5 conversoes Google, 42 Stories, 12 consultas marcadas.",
        updatedAt
      })
    );
  });

  it("valida datas, numeros negativos e campos inteiros", () => {
    const errors = validateWeeklyMarketingWeekInput({
      ...validInput,
      weekLabel: "",
      startDate: "2026-05-20",
      endDate: "2026-05-19",
      metaSpend: -1,
      googleClicks: 10.5
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "Informe o rotulo da semana.",
        "A data de fim nao pode ser anterior a data de inicio.",
        "O campo investimento Meta Ads nao pode ser negativo.",
        "O campo cliques Google Ads precisa ser um numero inteiro."
      ])
    );
  });

  it("aceita campos nullable do funil como null", () => {
    const errors = validateWeeklyMarketingWeekInput({
      ...validInput,
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    });

    expect(errors).toEqual([]);
  });

  it("seleciona a semana imediatamente anterior por data de fim", () => {
    const records = [
      makeRecord("older-week", "2026-04-27", "2026-05-03"),
      makeRecord("previous-week", "2026-05-04", "2026-05-10"),
      makeRecord("current-week", "2026-05-11", "2026-05-17"),
      makeRecord("future-week", "2026-05-18", "2026-05-24")
    ];

    const previous = selectPreviousWeeklyMarketingWeekRecord(records, {
      id: "current-week",
      startDate: "2026-05-11",
      endDate: "2026-05-17"
    });

    expect(previous?.id).toBe("previous-week");
  });

  it("exclui dezembro de 2025 da semana anterior usada em comparacao normal", () => {
    const records = [
      makeRecord("valid-previous-week", "2025-11-17", "2025-11-23"),
      makeRecord("december-anomaly-week", "2025-12-08", "2025-12-14"),
      makeRecord("current-week", "2026-01-05", "2026-01-11")
    ];

    const previous = selectPreviousWeeklyMarketingWeekRecord(records, {
      id: "current-week",
      startDate: "2026-01-05",
      endDate: "2026-01-11"
    });

    expect(isWeeklyMarketingWeekRecordExcludedFromNormalAnalysis(records[1])).toBe(true);
    expect(previous?.id).toBe("valid-previous-week");
  });

  it("seleciona uma janela de semanas anteriores validas excluindo anomalias", () => {
    const records = [
      makeRecord("current-week", "2026-01-26", "2026-02-01"),
      makeRecord("valid-week-1", "2026-01-19", "2026-01-25"),
      makeRecord("valid-week-2", "2026-01-12", "2026-01-18"),
      makeRecord("valid-week-3", "2026-01-05", "2026-01-11"),
      makeRecord("december-anomaly-week", "2025-12-08", "2025-12-14"),
      makeRecord("valid-week-4", "2025-11-24", "2025-11-30")
    ];

    const previousWeeks = selectPreviousValidWeeklyMarketingWeekRecords(
      records,
      {
        id: "current-week",
        startDate: "2026-01-26",
        endDate: "2026-02-01"
      },
      4
    );

    expect(previousWeeks.map((week) => week.id)).toEqual(["valid-week-1", "valid-week-2", "valid-week-3", "valid-week-4"]);
  });
});

function makeRecord(id: string, startDate: string, endDate: string): WeeklyMarketingWeek {
  const createdAt = new Date(`${endDate}T12:00:00.000Z`);
  const updatedAt = new Date(`${endDate}T13:00:00.000Z`);

  return {
    id,
    createdAt,
    updatedAt,
    ...validInput,
    weekLabel: id,
    startDate,
    endDate
  };
}
