import { notFound } from "next/navigation";
import { DiagnosisBadge, PriorityBadge, channelLabel, formatCurrency, formatNumber, formatPercent } from "@/components/ui";
import { getReport } from "@/lib/reports";
import { dateLabel } from "@/lib/utils/dates";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  if (!report) notFound();
  const sortedRecommendations = report.recommendations.sort((a, b) => {
    const weight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return weight[b.priority] - weight[a.priority];
  });

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm text-slate-500">{dateLabel(report.periodStart, report.periodEnd)} • confiança {formatPercent(report.confidenceScore)}</p>
        <h2 className="mt-1 text-2xl font-semibold">{report.title}</h2>
        {report.isOperationalAnomaly ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-medium text-danger">{report.anomalyReason}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Dados extraídos por canal</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-3">Canal</th>
                  <th className="py-2 pr-3">Investimento</th>
                  <th className="py-2 pr-3">Oportunidades</th>
                  <th className="py-2 pr-3">CPL/CPA</th>
                  <th className="py-2 pr-3">Audiência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.channelSummaries.map((channel) => (
                  <tr key={channel.id}>
                    <td className="py-2 pr-3 font-medium">{channelLabel(channel.channel)}</td>
                    <td className="py-2 pr-3">{formatCurrency(channel.investment)}</td>
                    <td className="py-2 pr-3">{formatNumber(channel.opportunities)}</td>
                    <td className="py-2 pr-3">{channel.channel === "google_ads" ? formatCurrency(channel.cpa) : formatCurrency(channel.cpl)}</td>
                    <td className="py-2 pr-3">{formatNumber(channel.reach)} alcance<br /><span className="text-slate-500">{formatNumber(channel.newFollowers)} seguidores</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Validações e inconsistências</h3>
          <div className="mt-4 space-y-3">
            {report.dataIssues.length ? (
              report.dataIssues.map((issue) => (
                <div key={issue.id} className="rounded-md border border-slate-100 p-3">
                  <PriorityBadge value={issue.severity} />
                  <p className="mt-2 font-medium">{issue.description}</p>
                  <p className="text-sm text-slate-500">{issue.fieldName ?? "campo"}: esperado {issue.expectedValue ?? "-"}; encontrado {issue.foundValue ?? "-"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhuma inconsistência relevante detectada.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Criativos</h3>
          <div className="mt-4 space-y-3">
            {report.creatives.map((creative) => (
              <div key={creative.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-medium">{creative.name}</p>
                  <p className="text-sm text-slate-500">{formatNumber(creative.leads ?? creative.conversations)} leads • {formatCurrency(creative.cpl)} • {formatCurrency(creative.investment)}</p>
                </div>
                <DiagnosisBadge value={creative.diagnosis} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Keywords</h3>
          <div className="mt-4 space-y-3">
            {report.keywords.map((keyword) => (
              <div key={keyword.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-medium">{keyword.keyword}</p>
                  <p className="text-sm text-slate-500">{formatNumber(keyword.conversions)} conversões • {formatCurrency(keyword.cpa)}</p>
                </div>
                <DiagnosisBadge value={keyword.diagnosis} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Diagnóstico executivo</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {sortedRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-md border border-slate-100 p-4">
              <PriorityBadge value={recommendation.priority} />
              <p className="mt-2 font-semibold">{recommendation.title}</p>
              <p className="mt-1 text-sm text-slate-500">{recommendation.evidence}</p>
              <p className="mt-2 text-sm">{recommendation.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Texto bruto</h3>
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-slate-100">{report.rawText}</pre>
      </section>
    </div>
  );
}
