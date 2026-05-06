import { describe, expect, it } from "vitest";
import { mapBenchmarkSettingsToRecommendationBenchmarks } from "@/lib/benchmarks";

describe("mapBenchmarkSettingsToRecommendationBenchmarks", () => {
  it("mapeia keys monetárias para valores diretos", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([
      { key: "meta_cpl_excelente", value: 5, unit: "BRL" },
      { key: "meta_cpl_atencao", value: 21, unit: "BRL" },
      { key: "google_cpa_critico", value: 32, unit: "BRL" }
    ]);

    expect(benchmarks).toMatchObject({ metaCplExcellent: 5, metaCplAttention: 21, googleCpaCritical: 32 });
  });

  it("mapeia keys percentuais para decimal", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([
      { key: "stories_retention_good", value: 75, unit: "%" },
      { key: "reach_drop_attention", value: 10, unit: "%" },
      { key: "google_conversion_drop_critical", value: 30, unit: "%" },
      { key: "creative_concentration_risk", value: 70, unit: "%" }
    ]);

    expect(benchmarks).toMatchObject({
      storiesRetentionGood: 0.75,
      reachDropAttention: 0.1,
      googleConversionDropCritical: 0.3,
      creativeConcentrationRisk: 0.7
    });
  });

  it("ignora key desconhecida", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([{ key: "unknown", value: 10, unit: "%" }]);

    expect(benchmarks).toEqual({});
  });

  it("ignora valor null, NaN e infinito", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([
      { key: "reach_drop_attention", value: null, unit: "%" },
      { key: "google_conversion_drop_critical", value: Number.NaN, unit: "%" },
      { key: "creative_concentration_risk", value: Number.POSITIVE_INFINITY, unit: "%" }
    ]);

    expect(benchmarks).toEqual({});
  });

  it("ignora valor menor ou igual a zero", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([
      { key: "meta_cpl_excelente", value: 0, unit: "BRL" },
      { key: "reach_drop_attention", value: -10, unit: "%" }
    ]);

    expect(benchmarks).toEqual({});
  });

  it("ignora unidade incompatível", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([
      { key: "meta_cpl_excelente", value: 6, unit: "%" },
      { key: "reach_drop_attention", value: 10, unit: "BRL" }
    ]);

    expect(benchmarks).toEqual({});
  });

  it("retorna objeto parcial sem valores ausentes", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([{ key: "google_cpa_critico", value: 30, unit: "BRL" }]);

    expect(benchmarks).toEqual({ googleCpaCritical: 30 });
  });

  it("não aplica conversão mágica para percentual salvo como decimal", () => {
    const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks([{ key: "stories_retention_good", value: 0.75, unit: "%" }]);

    expect(benchmarks.storiesRetentionGood).toBe(0.0075);
  });
});
