import { describe, expect, it } from "vitest";
import { applyWeeklyAssistedImport, parseWeeklyAssistedImport } from "@/lib/weeklyAssistedImport";
import { createEmptyWeeklyMarketingData, getCalculatedWeeklyMetrics } from "@/lib/weeklyDataInput";

const sampleText = `Periodo: 11/05/2026 a 17/05/2026
Rotulo da semana: Semana 11/05 a 17/05/2026
Investimento Meta Ads: R$ 780,00
Conversas Meta: 118
Visitas ao perfil Meta: 6100
Investimento Google Ads: R$ 220,00
Cliques Google Ads: 48
Conversoes Google Ads: 0
Stories publicados: 42
Reels publicados: 3
Posts publicados: 2
Visitas ao perfil Instagram: 1290
WhatsApps totais: 126
Conversas qualificadas: 42
Consultas marcadas: 12
Consultas comparecidas: 9
Cirurgias fechadas: 2
Observacoes: semana agregada sem dados pessoais`;

describe("Weekly Assisted Import", () => {
  it("detecta campos semanais em texto colado com rotulos conhecidos", () => {
    const result = parseWeeklyAssistedImport(sampleText);

    expect(result.sensitiveWarnings).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.fields).toEqual(
      expect.objectContaining({
        weekLabel: "Semana 11/05 a 17/05/2026",
        startDate: "2026-05-11",
        endDate: "2026-05-17",
        metaSpend: 780,
        metaWhatsappConversations: 118,
        googleSpend: 220,
        googleClicks: 48,
        googleConversions: 0,
        instagramStories: 42,
        consultationsScheduled: 12,
        consultationsAttended: 9,
        surgeriesClosed: 2
      })
    );
    expect(result.recognizedFields.length).toBeGreaterThanOrEqual(15);
  });

  it("aceita linhas semicolonadas em formato campo e valor", () => {
    const result = parseWeeklyAssistedImport(`Investimento Meta Ads;1.234,56
Conversas Meta;100
Cliques Google Ads;70
Consultas marcadas;10`);

    expect(result.fields.metaSpend).toBe(1234.56);
    expect(result.fields.metaWhatsappConversations).toBe(100);
    expect(result.fields.googleClicks).toBe(70);
    expect(result.fields.consultationsScheduled).toBe(10);
  });

  it("aplica campos detectados sobre dados existentes e recalcula metricas", () => {
    const result = parseWeeklyAssistedImport(sampleText);
    const data = applyWeeklyAssistedImport(createEmptyWeeklyMarketingData(), result);
    const metrics = getCalculatedWeeklyMetrics(data);

    expect(data.weekLabel).toBe("Semana 11/05 a 17/05/2026");
    expect(data.metaCostPerWhatsapp).toBe(6.6102);
    expect(data.googleCostPerClick).toBe(4.5833);
    expect(metrics.consultationShowRate).toBe(0.75);
    expect(metrics.surgeryCloseRate).toBe(0.2222);
  });

  it("sinaliza linhas com possiveis dados sensiveis para revisao humana", () => {
    const result = parseWeeklyAssistedImport(`Investimento Meta Ads: 500
Paciente Maria perguntou sobre procedimento
CPF: 123.456.789-00`);

    expect(result.fields.metaSpend).toBe(500);
    expect(result.sensitiveWarnings.length).toBe(2);
    expect(result.sensitiveWarnings.join(" ")).toContain("possivel dado sensivel");
  });

  it("nao quebra com texto vazio ou sem campos conhecidos", () => {
    const empty = parseWeeklyAssistedImport("");
    const unknown = parseWeeklyAssistedImport("linha solta sem metrica reconhecida");

    expect(empty.recognizedFields).toEqual([]);
    expect(empty.warnings).toContain("Cole dados agregados antes de gerar a previa.");
    expect(unknown.recognizedFields).toEqual([]);
    expect(unknown.warnings).toContain("Nenhum campo conhecido foi identificado. Use linhas no formato 'campo: valor' ou uma tabela com campo e valor.");
  });

  it("gera aviso para valor invalido sem impedir outros campos validos", () => {
    const result = parseWeeklyAssistedImport(`Cliques Google Ads: abc
Stories publicados: 42`);

    expect(result.fields.googleClicks).toBeUndefined();
    expect(result.fields.instagramStories).toBe(42);
    expect(result.warnings).toContain("Cliques Google Ads: numero nao reconhecido.");
  });
});
