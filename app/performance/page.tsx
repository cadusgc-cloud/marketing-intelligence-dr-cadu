import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";

export default function PerformancePage() {
  const review = buildDefaultWeeklyReview();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Performance</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Desempenho consolidado por semana, formato, pilar, tema e esforco. Usa metricas manuais agregadas, com leitura conservadora e sem inferir conduta medica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={review.exports.executiveSummary} label="Copiar resumo" />
            <Link href="/weekly-review" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Fechamento semanal</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Confianca" value={review.quality.confidence} detail={`${review.quality.score}/100`} />
        <MetricCard label="Alcance" value={review.summary.totals.reach} detail="semana atual" />
        <MetricCard label="Salvamentos" value={review.summary.totals.saves} detail="sinal de utilidade" />
        <MetricCard label="Compartilhamentos" value={review.summary.totals.shares} detail="sinal de distribuicao" />
        <MetricCard label="Gasto manual" value={`R$ ${review.summary.totals.spend.toFixed(2)}`} detail="ads manual" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RankingPanel title="Ranking de temas" rows={review.themeSummaries.slice(0, 8)} />
        <RankingPanel title="Ranking de pilares" rows={review.pillarSummaries.slice(0, 8)} />
        <RankingPanel title="Ranking de formatos" rows={review.formatSummaries.slice(0, 8)} />
        <RankingPanel title="Dias da semana" rows={review.weekdaySummaries.slice(0, 8)} />
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Comparacao semana a semana</p>
        <h3 className="mt-1 text-lg font-semibold">Sinais principais</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {review.comparisons.map((item) => (
            <article key={item.metric} className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-ink">{item.metric}</p>
              <p className="mt-2 text-2xl font-semibold">{item.direction}</p>
              <p className="mt-1 text-xs text-slate-500">Atual {item.current} | anterior {item.previous} | delta {Math.round(item.deltaPercent * 100)}%</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Mapa esforco x resultado</p>
          <h3 className="mt-1 text-lg font-semibold">Oportunidades e saturacao</h3>
          <div className="mt-4 space-y-3">
            {review.recommendations.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-cyan-50 text-ocean">{item.type}</span>
                  <span className="badge bg-slate-100 text-slate-700">{item.priority}</span>
                </div>
                <h4 className="mt-3 font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.action}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="text-sm font-medium text-ocean">Ads manual</p>
          <h3 className="mt-1 text-lg font-semibold">Leitura sem API e sem funil agressivo</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {review.paidInsights.map((insight) => <li key={insight}>- {insight}</li>)}
          </ul>
        </section>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

function RankingPanel({ title, rows }: { title: string; rows: Array<{ key: string; label: string; score: number; records: number; signal: string }> }) {
  return (
    <section className="panel">
      <p className="text-sm font-medium text-ocean">Ranking</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 text-sm">
            <div>
              <p className="font-semibold text-ink">{row.label}</p>
              <p className="text-xs text-slate-500">{row.records} registros | {row.signal}</p>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{row.score}/100</span>
          </div>
        ))}
      </div>
    </section>
  );
}
