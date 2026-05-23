import type { NormalizedReportRow } from "@/lib/report-imports/types";

export function generatePaidMetricsInsights(records: NormalizedReportRow[]): string[] {
  const ads = records.filter((record) => record.channel === "meta_ads" || record.format === "ads" || (record.metrics.spend ?? 0) > 0);
  if (!ads.length) return ["Sem dados pagos manuais nesta semana."];
  const insights: string[] = [];
  ads.forEach((record) => {
    const spend = record.metrics.spend ?? 0;
    const clicks = record.metrics.clicks ?? 0;
    const ctr = record.metrics.ctr ?? (record.metrics.impressions ? clicks / record.metrics.impressions : 0);
    const frequency = record.metrics.frequency ?? 0;
    if (spend > 90 && clicks < 45) insights.push(`${record.title}: leitura manual aponta gasto alto para baixo volume de cliques; revisar criativo manualmente.`);
    if (frequency > 2.2) insights.push(`${record.title}: leitura manual aponta frequencia alta; risco de saturacao.`);
    if (ctr > 0 && ctr < 0.01) insights.push(`${record.title}: leitura manual aponta CTR baixo; testar hook educativo mais claro.`);
    if ((record.metrics.cpm ?? 0) > 18) insights.push(`${record.title}: leitura manual aponta CPM elevado; comparar com criativos de menor risco e melhor clareza.`);
  });
  return insights.length ? insights : ["Leitura manual de dados pagos sem alerta grave; manter avaliacao conservadora e revisao humana."];
}
