import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildIntelligenceDashboard, formatLabels, pillarLabels } from "@/lib/marketing-intelligence";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";

export default function InsightsPage() {
  const dashboard = buildIntelligenceDashboard();
  const report = dashboard.report;
  const weekly = buildDefaultWeeklyReview();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Insights</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Aprendizado editorial local a partir de metricas manuais agregadas. O sistema prioriza repeticao, variacao, pausa e experimentos sem API externa, sem publicacao automatica e sem dados sensiveis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={dashboard.exports.insightsMarkdown} label="Copiar insights" />
            <Link href="/metrics" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Metricas</Link>
            <Link href="/weekly-review" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechamento v7</Link>
            <Link href="/strategy" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Estrategia</Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
        <h3 className="mt-1 text-lg font-semibold">Aprendizado semanal integrado</h3>
        <p className="mt-2 text-sm text-slate-600">
          O fechamento semanal atual usa {weekly.currentRecords.length} registros agregados, confianca {weekly.quality.confidence} e gera {weekly.tasks.length} tarefas para a proxima semana.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {weekly.recommendations.slice(0, 3).map((item) => (
            <article key={item.title} className="rounded-lg border border-slate-200 p-4">
              <span className="badge bg-cyan-50 text-ocean">{item.type}</span>
              <h4 className="mt-3 font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{item.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Score editorial" value={`${dashboard.intelligenceScore}/100`} detail={report.quality.status} />
        <MetricCard label="Registros" value={dashboard.recordCount} detail="dataset ficticio seguro" />
        <MetricCard label="Recomendacoes" value={report.recommendations.length} detail="next best actions" />
        <MetricCard label="Experimentos" value={dashboard.experiments.length} detail="sem automacao externa" />
        <MetricCard label="Calendario" value={dashboard.roadmap.adaptiveCalendar.length} detail="proximos 7 dias" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Top conteudos</p>
          <h3 className="mt-1 text-lg font-semibold">O que merece repeticao com variacao</h3>
          <div className="mt-4 space-y-3">
            {report.topContents.slice(0, 6).map((item) => (
              <article key={item.record.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-green-50 text-leaf">{item.score.overallPerformanceScore}/100</span>
                  <span className="badge bg-slate-100 text-slate-700">{formatLabels[item.record.normalizedFormat]}</span>
                  <span className="badge bg-slate-100 text-slate-700">{pillarLabels[item.record.normalizedPillar]}</span>
                </div>
                <h4 className="mt-3 font-semibold">{item.record.theme}</h4>
                <p className="mt-1 text-sm text-slate-600">{item.recommendation}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Pausar ou ajustar</p>
          <h3 className="mt-1 text-lg font-semibold">Baixo retorno, alto esforco ou risco</h3>
          <div className="mt-4 space-y-3">
            {report.weakContents.slice(0, 6).map((item) => (
              <article key={item.record.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-amber-50 text-amber">{item.score.overallPerformanceScore}/100</span>
                  <span className="badge bg-slate-100 text-slate-700">esforco {item.record.effort}/5</span>
                  <span className="badge bg-slate-100 text-slate-700">{item.score.classification}</span>
                </div>
                <h4 className="mt-3 font-semibold">{item.record.theme}</h4>
                <p className="mt-1 text-sm text-slate-600">{item.recommendation}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Pilares</p>
          <h3 className="mt-1 text-lg font-semibold">Onde reforcar autoridade</h3>
          <div className="mt-4 space-y-3">
            {report.pillarInsights.map((pillar) => (
              <div key={pillar.pillar} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-ink">{pillar.label}</span>
                  <span className="badge bg-slate-100 text-slate-700">{pillar.averageScore}/100</span>
                </div>
                <p className="mt-2 text-slate-600">{pillar.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Formatos</p>
          <h3 className="mt-1 text-lg font-semibold">O que aumentar com cautela</h3>
          <div className="mt-4 space-y-3">
            {report.formatInsights.map((format) => (
              <div key={format.format} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-ink">{format.label}</span>
                  <span className="badge bg-slate-100 text-slate-700">{format.averageScore}/100</span>
                </div>
                <p className="mt-2 text-slate-600">{format.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Mapa de oportunidades</p>
        <h3 className="mt-1 text-lg font-semibold">Desempenho x esforco x risco</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {report.opportunities.map((bucket) => (
            <article key={bucket.bucket} className="rounded-lg border border-slate-200 p-4">
              <h4 className="font-semibold">{bucket.label}</h4>
              <p className="mt-2 text-sm text-slate-600">{bucket.recommendation}</p>
              <p className="mt-3 text-xs text-slate-500">{bucket.items.length} itens classificados</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Proximas melhores acoes</p>
            <h3 className="mt-1 text-lg font-semibold">Prioridade editorial segura</h3>
          </div>
          <LocalCopyButton text={dashboard.exports.nextActionsMarkdown} label="Copiar acoes" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {report.recommendations.map((action) => (
            <article key={action.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-cyan-50 text-ocean">{action.priority}</span>
                <span className="badge bg-slate-100 text-slate-700">{action.suggestedFormat}</span>
                <span className="badge bg-slate-100 text-slate-700">risco {action.risk}</span>
              </div>
              <h4 className="mt-3 font-semibold">{action.order}. {action.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{action.rationale}</p>
              <Link href={action.relatedRoute} className="mt-3 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir rota relacionada</Link>
            </article>
          ))}
        </div>
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
