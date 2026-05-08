import { notFound } from "next/navigation";
import { DiagnosisBadge, PriorityBadge, channelLabel, formatCurrency, formatNumber, formatPercent, issueTypeLabel, recommendationCategoryLabel, reportTypeLabel } from "@/components/ui";
import { ANOMALY_EXECUTIVE_DIAGNOSIS_MESSAGE, generateExecutiveDiagnosis } from "@/lib/engine/executiveDiagnosis";
import { buildExecutiveDiagnosisInput } from "@/lib/engine/executiveDiagnosisInput";
import { getReport } from "@/lib/reports";
import { dateLabel } from "@/lib/utils/dates";

const executiveStatusLabels = {
  critical: "Crítico",
  attention: "Atenção",
  stable: "Estável",
  good: "Bom"
};

const executiveStatusClasses = {
  critical: "bg-red-50 text-danger",
  attention: "bg-amber-50 text-amber",
  stable: "bg-cyan-50 text-ocean",
  good: "bg-green-50 text-leaf"
};

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  if (!report) notFound();
  const isOperationalAnomaly = report.isOperationalAnomaly;
  const executiveDiagnosis = isOperationalAnomaly ? null : generateExecutiveDiagnosis(buildExecutiveDiagnosisInput(report));
  const sortedRecommendations = [...report.recommendations].sort((a, b) => {
    const weight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return weight[b.priority] - weight[a.priority];
  });

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm text-slate-500">{dateLabel(report.periodStart, report.periodEnd)} • {reportTypeLabel(report.reportType)} • confiança {formatPercent(report.confidenceScore)}</p>
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
                  <p className="mt-2 text-xs font-semibold uppercase tracking-normal text-slate-500">{issueTypeLabel(issue.issueType)}</p>
                  <p className="mt-1 font-medium">{issue.description}</p>
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
                {isOperationalAnomaly ? null : <DiagnosisBadge value={creative.diagnosis} />}
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
                {isOperationalAnomaly ? null : <DiagnosisBadge value={keyword.diagnosis} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Resumo executivo</h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{isOperationalAnomaly ? ANOMALY_EXECUTIVE_DIAGNOSIS_MESSAGE : executiveDiagnosis?.summary}</p>
          </div>
          {executiveDiagnosis ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 md:text-right">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Score do relatório</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{executiveDiagnosis.healthScore}</p>
            <span className={`badge mt-2 ${executiveStatusClasses[executiveDiagnosis.status]}`}>
              {executiveStatusLabels[executiveDiagnosis.status]}
            </span>
          </div>
          ) : null}
        </div>

        {executiveDiagnosis ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-slate-100 p-4">
            <h4 className="text-sm font-semibold">Alertas críticos</h4>
            {executiveDiagnosis.criticalAlerts.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600">
                {executiveDiagnosis.criticalAlerts.slice(0, 4).map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Nenhum alerta crítico identificado neste relatório.</p>
            )}
          </div>

          <div className="rounded-md border border-slate-100 p-4">
            <h4 className="text-sm font-semibold">Principais vitórias</h4>
            {executiveDiagnosis.topWins.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600">
                {executiveDiagnosis.topWins.slice(0, 4).map((win) => (
                  <li key={win}>{win}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Nenhuma vitória clara detectada pelos dados estruturados.</p>
            )}
          </div>

          <div className="rounded-md border border-slate-100 p-4">
            <h4 className="text-sm font-semibold">Plano da próxima semana</h4>
            {executiveDiagnosis.nextWeekActionPlan.length ? (
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
                {executiveDiagnosis.nextWeekActionPlan.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Manter acompanhamento e importar o próximo relatório para comparar evolução.</p>
            )}
          </div>
        </div>
        ) : null}
      </section>

      {isOperationalAnomaly ? null : (
      <section className="panel">
        <h3 className="text-lg font-semibold">Recomendações detalhadas</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {sortedRecommendations.length ? (
            sortedRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-md border border-slate-100 p-4">
                <PriorityBadge value={recommendation.priority} />
                <p className="mt-2 text-xs font-semibold uppercase tracking-normal text-slate-500">{recommendationCategoryLabel(recommendation.category)}</p>
                <p className="mt-1 font-semibold">{recommendation.title}</p>
                <p className="mt-1 text-sm text-slate-500">{recommendation.evidence}</p>
                <p className="mt-2 text-sm">{recommendation.recommendation}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Nenhuma recomendação detalhada foi gerada para este relatório.</p>
          )}
        </div>
      </section>
      )}

      <section className="panel">
        <h3 className="text-lg font-semibold">Texto bruto</h3>
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-slate-100">{report.rawText}</pre>
      </section>
    </div>
  );
}
