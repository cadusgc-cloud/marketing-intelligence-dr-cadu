import type { WeeklyMarketingWeek } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  mapWeeklyMarketingWeekToData,
  mapWeeklyMarketingWeekToSummary,
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
});
