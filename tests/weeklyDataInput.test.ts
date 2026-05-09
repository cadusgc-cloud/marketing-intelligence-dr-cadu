import { describe, expect, it } from "vitest";
import {
  WEEKLY_MARKETING_DATA_MOCK,
  calculateConsultationShowRate,
  calculateGoogleConversionRate,
  calculateGoogleCostPerClick,
  calculateMetaCostPerProfileVisit,
  calculateMetaCostPerWhatsapp,
  calculateSurgeryCloseRate,
  convertWeeklyDataToDecisionInputs,
  isMetaPerformingBetterThanGoogle,
  summarizeWeeklyMarketingData,
  validateWeeklyMarketingData
} from "@/lib/weeklyDataInput";

describe("Weekly Data Input", () => {
  it("calcula custo por WhatsApp corretamente", () => {
    expect(calculateMetaCostPerWhatsapp(650, 100)).toBe(6.5);
  });

  it("calcula custo por visita ao perfil corretamente", () => {
    expect(calculateMetaCostPerProfileVisit(700, 5000)).toBe(0.14);
  });

  it("calcula CPC e taxa de conversao do Google corretamente", () => {
    expect(calculateGoogleCostPerClick(240, 48)).toBe(5);
    expect(calculateGoogleConversionRate(6, 48)).toBe(0.125);
  });

  it("calcula taxa de comparecimento e fechamento corretamente", () => {
    expect(calculateConsultationShowRate(8, 10)).toBe(0.8);
    expect(calculateSurgeryCloseRate(2, 8)).toBe(0.25);
  });

  it("valida dados obrigatorios e identifica dados ausentes", () => {
    const validation = validateWeeklyMarketingData(WEEKLY_MARKETING_DATA_MOCK);

    expect(validation.valid).toBe(false);
    expect(validation.missingFields).toContain("consultationsScheduled");
    expect(validation.missingFields).toContain("consultationsAttended");
    expect(validation.missingFields).toContain("surgeriesClosed");
    expect(validation.warnings).toContain("Google Ads esta com conversoes zeradas e deve permanecer diagnostico.");
  });

  it("gera resumo semanal", () => {
    const summary = summarizeWeeklyMarketingData(WEEKLY_MARKETING_DATA_MOCK);

    expect(summary).toContain("Meta gerou 118 conversas");
    expect(summary).toContain("Google registrou 0 conversoes");
    expect(summary).toContain("ainda precisa de dados de consultas");
  });

  it("converte dados semanais em inputs compativeis com DecisionSignalInput", () => {
    const inputs = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK);

    expect(inputs.map((input) => input.metric)).toContain("meta_bofu_whatsapp_cost");
    expect(inputs.map((input) => input.metric)).toContain("google_conversions");
    expect(inputs.map((input) => input.metric)).toContain("scheduled_consults");
    expect(inputs.every((input) => input.periodLabel === WEEKLY_MARKETING_DATA_MOCK.weekLabel)).toBe(true);
  });

  it("preserva Google com conversoes zeradas como sinal diagnostico", () => {
    const googleInput = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK).find((input) => input.metric === "google_conversions");

    expect(googleInput?.channel).toBe("google");
    expect(googleInput?.value).toBe(0);
  });

  it("preserva Meta como canal principal de escala quando performa melhor", () => {
    expect(isMetaPerformingBetterThanGoogle(WEEKLY_MARKETING_DATA_MOCK)).toBe(true);

    const metaInput = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK).find((input) => input.metric === "meta_bofu_whatsapp_cost");
    expect(metaInput?.channel).toBe("meta");
    expect(metaInput?.value).toBe(6.61);
  });
});
