import Link from "next/link";
import { TrendChart } from "@/components/TrendChart";
import { CompactReportTable, DiagnosisBadge, EmptyState, MetricCard, PriorityBadge, formatCurrency, formatNumber } from "@/components/ui";
import { resolveRecommendationBenchmarks } from "@/lib/benchmarks";
import { prisma } from "@/lib/db";
import { getReports } from "@/lib/reports";
import { dateLabel } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [reports, benchmarkSettings] = await Promise.all([
    getReports(),
    prisma.benchmarkSetting.findMany({ select: { key: true, value: true, unit: true } })
  ]);
  const benchmarks = resolveRecommendationBenchmarks(benchmarkSettings);
  const validReports = reports.filter((report) => !report.isOperationalAnomaly);
  const latest = validReports[0];
  const consolidated = latest?.channelSummaries.find((item) => item.channel === "consolidated");
  const meta = latest?.channelSummaries.find((item) => item.channel === "meta_ads");
  const google = latest?.channelSummaries.find((item) => item.channel === "google_ads");
  const criticalAlerts = reports.flatMap((report) => report.dataIssues.filter((issue) => issue.severity === "critical" || issue.severity === "high").map((issue) => ({ ...issue, report }))).slice(0, 6);
  const scaleCreatives = validReports.flatMap((report) => report.creatives.filter((creative) => creative.diagnosis === "scale").map((creative) => ({ ...creative, report }))).slice(0, 6);
  const scaleKeywords = validReports.flatMap((report) => report.keywords.filter((keyword) => keyword.diagnosis === "scale").map((keyword) => ({ ...keyword, report }))).slice(0, 6);
  const recommendations = validReports.flatMap((report) => report.recommendations.map((recommendation) => ({ ...recommendation, report }))).filter((item) => item.priority === "critical" || item.priority === "high").slice(0, 6);
  const chartData = validReports
    .slice()
    .reverse()
    .map((report) => {
      const summary = report.channelSummaries.find((item) => item.channel === "consolidated");
      return {
        period: dateLabel(report.periodStart, report.periodEnd).replace("/2026", ""),
        investimento: summary?.investment ?? 0,
        oportunidades: summary?.opportunities ?? 0,
        alcance: summary?.reach ?? 0
      };
    });

  if (!reports.length) {
    return (
      <EmptyState
        title="Ainda não há relatórios analisados."
        description="Importe um relatório agregado de marketing para preencher o dashboard, gerar alertas e criar recomendações."
        href="/reports/new"
        actionLabel="Importar primeiro relatório"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Investimento total" value={formatCurrency(consolidated?.investment)} />
        <MetricCard label="Oportunidades comerciais" value={formatNumber(consolidated?.opportunities)} />
        <MetricCard label="CPL médio Meta" value={formatCurrency(meta?.cpl)} tone={(meta?.cpl ?? 0) > benchmarks.metaCplAttention ? "bad" : "default"} />
        <MetricCard label="Alcance" value={formatNumber(consolidated?.reach)} />
        <MetricCard label="Impressões" value={formatNumber(consolidated?.impressions)} />
        <MetricCard label="Crescimento de audiência" value={formatNumber(consolidated?.newFollowers)} />
        <MetricCard label="Conversões Google" value={formatNumber(google?.conversions)} />
        <MetricCard label="CPA Google" value={formatCurrency(google?.cpa)} tone={(google?.cpa ?? 0) > benchmarks.googleCpaCritical ? "bad" : "default"} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Evolução por período</h2>
              <p className="text-sm text-slate-500">Dezembro/2025 é excluído automaticamente das médias históricas.</p>
            </div>
          </div>
          <TrendChart data={chartData} />
        </div>

        <div className="panel">
          <h2 className="text-lg font-semibold">Alertas críticos</h2>
          <div className="mt-4 space-y-3">
            {criticalAlerts.length ? (
              criticalAlerts.map((alert) => (
                <div key={alert.id} className="rounded-md border border-slate-100 p-3">
                  <PriorityBadge value={alert.severity} />
                  <p className="mt-2 text-sm font-medium">{alert.description}</p>
                  <p className="text-xs text-slate-500">{alert.report.title}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhuma inconsistência crítica nos relatórios atuais.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h2 className="text-lg font-semibold">Criativos para escalar</h2>
          <div className="mt-4 space-y-3">
            {scaleCreatives.length ? scaleCreatives.map((creative) => (
              <div key={creative.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-medium">{creative.name}</p>
                  <p className="text-sm text-slate-500">{formatNumber(creative.leads ?? creative.conversations)} leads • {formatCurrency(creative.cpl)}</p>
                </div>
                <DiagnosisBadge value={creative.diagnosis} />
              </div>
            )) : (
              <p className="text-sm text-slate-500">Nenhum criativo com diagnóstico de escala ainda.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h2 className="text-lg font-semibold">Keywords vencedoras</h2>
          <div className="mt-4 space-y-3">
            {scaleKeywords.length ? scaleKeywords.map((keyword) => (
              <div key={keyword.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-medium">{keyword.keyword}</p>
                  <p className="text-sm text-slate-500">{formatNumber(keyword.conversions)} conversões • {formatCurrency(keyword.cpa)}</p>
                </div>
                <DiagnosisBadge value={keyword.diagnosis} />
              </div>
            )) : (
              <p className="text-sm text-slate-500">Nenhuma keyword com diagnóstico de escala ainda.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h2 className="text-lg font-semibold">Recomendações da semana</h2>
          <div className="mt-4 space-y-3">
            {recommendations.length ? recommendations.map((recommendation) => (
              <Link key={recommendation.id} href={`/reports/${recommendation.report.id}`} className="block rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                <PriorityBadge value={recommendation.priority} />
                <p className="mt-2 font-medium">{recommendation.title}</p>
                <p className="text-sm text-slate-500">{recommendation.recommendation}</p>
              </Link>
            )) : (
              <p className="text-sm text-slate-500">Nenhuma recomendação de alta prioridade neste momento.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="mb-4 text-lg font-semibold">Relatórios importados</h2>
        <CompactReportTable reports={reports} />
      </section>
    </div>
  );
}
