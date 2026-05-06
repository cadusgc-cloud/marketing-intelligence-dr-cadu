import type { RecommendationBenchmarks } from "@/lib/engine/recommendationEngine";

export type BenchmarkSettingLike = {
  key: string;
  value: number | null;
  unit: string | null;
};

type BenchmarkMapEntry = {
  target: keyof RecommendationBenchmarks;
  unit: "BRL" | "%";
};

const BENCHMARK_MAP: Record<string, BenchmarkMapEntry> = {
  meta_cpl_excelente: { target: "metaCplExcellent", unit: "BRL" },
  meta_cpl_atencao: { target: "metaCplAttention", unit: "BRL" },
  google_cpa_critico: { target: "googleCpaCritical", unit: "BRL" },
  stories_retention_good: { target: "storiesRetentionGood", unit: "%" },
  reach_drop_attention: { target: "reachDropAttention", unit: "%" },
  google_conversion_drop_critical: { target: "googleConversionDropCritical", unit: "%" },
  creative_concentration_risk: { target: "creativeConcentrationRisk", unit: "%" }
};

export function mapBenchmarkSettingsToRecommendationBenchmarks(settings: BenchmarkSettingLike[]): Partial<RecommendationBenchmarks> {
  const benchmarks: Partial<RecommendationBenchmarks> = {};

  for (const setting of settings) {
    const mapEntry = BENCHMARK_MAP[setting.key];
    if (!mapEntry || setting.unit !== mapEntry.unit || setting.value === null || setting.value === undefined) continue;
    if (!Number.isFinite(setting.value) || setting.value <= 0) continue;

    benchmarks[mapEntry.target] = mapEntry.unit === "%" ? setting.value / 100 : setting.value;
  }

  return benchmarks;
}
