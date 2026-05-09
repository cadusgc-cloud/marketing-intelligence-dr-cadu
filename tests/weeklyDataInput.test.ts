import { describe, expect, it } from "vitest";
import {
  WEEKLY_MARKETING_DATA_MOCK,
  calculateConsultationShowRate,
  calculateDailyStoriesAverage,
  calculateGoogleConversionRate,
  calculateGoogleCostPerClick,
  calculateMetaCostPerProfileVisit,
  calculateMetaCostPerWhatsapp,
  calculateSurgeryCloseRate,
  convertWeeklyDataToDecisionInputs,
  createEmptyWeeklyMarketingData,
  createWeeklyMarketingDataFromEditableFields,
  getCalculatedWeeklyMetrics,
  isMetaPerformingBetterThanGoogle,
  summarizeWeeklyMarketingData,
  updateWeeklyMarketingDataField,
  validateWeeklyMarketingData
} from "@/lib/weeklyDataInput";

describe("Weekly Data Input", () => {
  it("calcula custo por WhatsApp corretamente", () => {
    expect(calculateMetaCostPerWhatsapp(650, 100)).toBe(6.5);
  });

  it("calcula custo por visita ao perfil corretamente", () => {
    expect(calculateMetaCostPerProfileVisit(700, 5000)).toBe(0.14);
  });

  it("calcula CPC e taxa de conversão do Google corretamente", () => {
    expect(calculateGoogleCostPerClick(240, 48)).toBe(5);
    expect(calculateGoogleConversionRate(6, 48)).toBe(0.125);
  });

  it("calcula taxa de comparecimento e fechamento corretamente", () => {
    expect(calculateConsultationShowRate(8, 10)).toBe(0.8);
    expect(calculateSurgeryCloseRate(2, 8)).toBe(0.25);
  });

  it("calcula média diária de Stories a partir do total semanal", () => {
    expect(calculateDailyStoriesAverage(24)).toBe(3.4286);
    expect(calculateDailyStoriesAverage(42)).toBe(6);
  });

  it("não gera NaN ou Infinity em divisões por zero", () => {
    const metrics = getCalculatedWeeklyMetrics(createEmptyWeeklyMarketingData());

    expect(metrics.metaCostPerWhatsapp).toBeNull();
    expect(metrics.metaCostPerProfileVisit).toBeNull();
    expect(metrics.googleCostPerClick).toBeNull();
    expect(metrics.googleConversionRate).toBeNull();
    expect(metrics.consultationShowRate).toBeNull();
    expect(metrics.surgeryCloseRate).toBeNull();
  });

  it("valida dados obrigatórios e identifica dados ausentes", () => {
    const validation = validateWeeklyMarketingData(WEEKLY_MARKETING_DATA_MOCK);

    expect(validation.valid).toBe(false);
    expect(validation.missingFields).toContain("consultationsScheduled");
    expect(validation.missingFields).toContain("consultationsAttended");
    expect(validation.missingFields).toContain("surgeriesClosed");
    expect(validation.warnings).toContain("Google Ads está com conversões zeradas e deve permanecer em diagnóstico.");
    expect(validation.warnings).toContain("Stories abaixo do mínimo operacional de 42 por semana.");
    expect(validation.warnings).toContain("Reels/Shorts abaixo do mínimo semanal de 3.");
    expect(validation.warnings).toContain("Meta Ads está mais confiável que Google Ads para leitura operacional nesta semana.");
  });

  it("dados vazios funcionam como rascunho e geram alertas", () => {
    const draft = createEmptyWeeklyMarketingData();
    const validation = validateWeeklyMarketingData(draft);

    expect(draft.weekLabel).toBe("");
    expect(validation.valid).toBe(false);
    expect(validation.missingFields).toEqual(expect.arrayContaining(["weekLabel", "startDate", "endDate", "consultationsScheduled"]));
  });

  it("cria dados semanais a partir de campos editáveis e recalcula métricas", () => {
    const data = createWeeklyMarketingDataFromEditableFields({
      weekLabel: "Semana editada",
      metaSpend: 500,
      metaWhatsappConversations: 100,
      googleSpend: 300,
      googleClicks: 60,
      googleConversions: 3,
      consultationsScheduled: 10,
      consultationsAttended: 8,
      surgeriesClosed: 2
    });

    expect(data.metaCostPerWhatsapp).toBe(5);
    expect(data.googleCostPerClick).toBe(5);
    expect(data.googleConversionRate).toBe(0.05);
    expect(getCalculatedWeeklyMetrics(data).consultationShowRate).toBe(0.8);
    expect(getCalculatedWeeklyMetrics(data).surgeryCloseRate).toBe(0.25);
  });

  it("atualiza apenas o campo esperado", () => {
    const updated = updateWeeklyMarketingDataField(WEEKLY_MARKETING_DATA_MOCK, "metaWhatsappConversations", 100);

    expect(updated.metaWhatsappConversations).toBe(100);
    expect(updated.googleClicks).toBe(WEEKLY_MARKETING_DATA_MOCK.googleClicks);
    expect(updated.metaCostPerWhatsapp).toBe(7.8);
  });

  it("restaurar dados simulados mantém os valores originais", () => {
    const restored = createWeeklyMarketingDataFromEditableFields(WEEKLY_MARKETING_DATA_MOCK);

    expect(restored.weekLabel).toBe(WEEKLY_MARKETING_DATA_MOCK.weekLabel);
    expect(restored.metaWhatsappConversations).toBe(118);
    expect(restored.googleConversions).toBe(0);
  });

  it("gera resumo semanal", () => {
    const summary = summarizeWeeklyMarketingData(WEEKLY_MARKETING_DATA_MOCK);

    expect(summary).toContain("Meta Ads gerou 118 conversas");
    expect(summary).toContain("Google Ads registrou 0 conversões");
    expect(summary).toContain("ainda precisa de dados de consultas");
  });

  it("converte dados semanais em inputs compatíveis com DecisionSignalInput", () => {
    const inputs = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK);

    expect(inputs.map((input) => input.metric)).toContain("meta_bofu_whatsapp_cost");
    expect(inputs.map((input) => input.metric)).toContain("google_conversions");
    expect(inputs.map((input) => input.metric)).toContain("scheduled_consults");
    expect(inputs.every((input) => input.periodLabel === WEEKLY_MARKETING_DATA_MOCK.weekLabel)).toBe(true);
  });

  it("converte total semanal de Stories em média diária para sinais de decisão", () => {
    const data = createWeeklyMarketingDataFromEditableFields({
      ...WEEKLY_MARKETING_DATA_MOCK,
      instagramStories: 24
    });
    const storiesInput = convertWeeklyDataToDecisionInputs(data).find((input) => input.metric === "instagram_daily_stories");

    expect(storiesInput?.value).toBe(3.4286);
    expect(storiesInput?.unit).toBe("stories/day");
  });

  it("converte 42 Stories semanais em média diária igual a 6", () => {
    const data = createWeeklyMarketingDataFromEditableFields({
      ...WEEKLY_MARKETING_DATA_MOCK,
      instagramStories: 42
    });
    const storiesInput = convertWeeklyDataToDecisionInputs(data).find((input) => input.metric === "instagram_daily_stories");

    expect(storiesInput?.value).toBe(6);
  });

  it("preserva Google Ads com conversões zeradas como sinal diagnóstico", () => {
    const googleInput = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK).find((input) => input.metric === "google_conversions");

    expect(googleInput?.channel).toBe("google");
    expect(googleInput?.value).toBe(0);
  });

  it("preserva Meta como canal principal de escala quando performa melhor", () => {
    expect(isMetaPerformingBetterThanGoogle(WEEKLY_MARKETING_DATA_MOCK)).toBe(true);

    const metaInput = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK).find((input) => input.metric === "meta_bofu_whatsapp_cost");
    expect(metaInput?.channel).toBe("meta");
    expect(metaInput?.value).toBe(6.6102);
  });
});
