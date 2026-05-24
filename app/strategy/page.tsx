import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildIntelligenceDashboard, formatLabels, pillarLabels } from "@/lib/marketing-intelligence";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";

export default function StrategyPage() {
  const dashboard = buildIntelligenceDashboard();
  const roadmap = dashboard.roadmap;
  const weekly = buildDefaultWeeklyReview();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Estrategia</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Roadmap adaptativo de 30, 60 e 90 dias a partir do learning loop. Usa metricas manuais agregadas e recomenda proximas acoes sem decidir pelo humano.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={roadmap.exportText} label="Copiar roadmap" />
            <Link href="/weekly-review" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechamento v7</Link>
            <Link href="/workspace" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Workspace</Link>
            <Link href="/studio" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Abrir Studio</Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Plano semanal V7</p>
        <h3 className="mt-1 text-lg font-semibold">Proxima semana baseada no fechamento</h3>
        <p className="mt-2 text-sm text-slate-600">
          Periodo {weekly.nextWeekPlan.period.label}, {weekly.nextWeekPlan.days.length} dias, {weekly.tasks.length} tarefas e confianca {weekly.quality.confidence}.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {weekly.nextWeekPlan.days.slice(0, 4).map((day) => (
            <article key={day.date} className="rounded-lg border border-slate-200 p-4">
              <span className="badge bg-slate-100 text-slate-700">{day.date}</span>
              <h4 className="mt-3 font-semibold">{day.theme}</h4>
              <p className="mt-2 text-sm text-slate-600">{day.format} | readiness {day.readiness}/100</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Prioridades" value={roadmap.priorities.length} detail="pilares e formatos" />
        <MetricCard label="Acoes" value={roadmap.nextBestActions.length} detail="ordenadas por sinal" />
        <MetricCard label="Calendario" value={roadmap.adaptiveCalendar.length} detail="proximos 7 dias" />
        <MetricCard label="Score QA" value={`${dashboard.report.quality.score}/100`} detail={dashboard.report.quality.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <RoadmapPanel title="30 dias" items={roadmap.thirtyDays} />
        <RoadmapPanel title="60 dias" items={roadmap.sixtyDays} />
        <RoadmapPanel title="90 dias" items={roadmap.ninetyDays} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Calendario adaptativo</p>
            <h3 className="mt-1 text-lg font-semibold">Proximos 7 dias sugeridos</h3>
          </div>
          <LocalCopyButton text={dashboard.exports.googleAgenda} label="Copiar Google Agenda" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roadmap.adaptiveCalendar.map((day) => (
            <article key={day.date} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{day.date}</span>
                <span className="badge bg-slate-100 text-slate-700">{day.weekday}</span>
                <span className="badge bg-green-50 text-leaf">risco {day.safety}</span>
              </div>
              <h4 className="mt-3 font-semibold">{day.theme}</h4>
              <p className="mt-2 text-sm text-slate-600">{pillarLabels[day.pillar]} | {formatLabels[day.format]}</p>
              <p className="mt-2 text-sm text-slate-500">{day.rationale}</p>
              <div className="mt-3">
                <LocalCopyButton text={day.exportText} label="Copiar dia" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Next Best Actions</p>
            <h3 className="mt-1 text-lg font-semibold">O que fazer no proximo ciclo</h3>
          </div>
          <LocalCopyButton text={dashboard.exports.nextActionsMarkdown} label="Copiar acoes" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {roadmap.nextBestActions.map((action) => (
            <article key={action.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-cyan-50 text-ocean">{action.priority}</span>
                <span className="badge bg-slate-100 text-slate-700">{action.suggestedFormat}</span>
                <span className="badge bg-slate-100 text-slate-700">impacto {action.expectedImpact}</span>
              </div>
              <h4 className="mt-3 font-semibold">{action.order}. {action.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{action.rationale}</p>
              <Link href={action.relatedRoute} className="mt-3 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir fluxo</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function RoadmapPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="panel">
      <p className="text-sm font-medium text-ocean">Roadmap</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </section>
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
