import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildDefaultMarketingWorkspace, generateWeeklyRunbook } from "@/lib/marketing-workspace";
import { getGuidedFlowCatalog } from "@/lib/guided-flows";

export default function RunbookPage() {
  const workspace = buildDefaultMarketingWorkspace();
  const runbook = generateWeeklyRunbook({ workspace });
  const flows = getGuidedFlowCatalog();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Runbook Semanal</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Roteiro operacional para executar a semana sem improviso: coleta, revisao, producao, exportacao, backup e snapshot.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={runbook.exportMarkdown} label="Copiar runbook" />
            <LocalCopyButton text={runbook.checklistText} label="Copiar checklist" />
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Dias" value={runbook.days.length} />
        <MetricCard label="Tempo estimado" value={`${runbook.totalEstimatedMinutes} min`} />
        <MetricCard label="Status" value={runbook.status} />
      </section>
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Marketing OS v9</p>
        <h3 className="mt-1 text-lg font-semibold">Runbook conectado aos fluxos guiados</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {flows.filter((flow) => ["fechamento-semanal-completo", "produzir-conteudo-semana", "backup-local"].includes(flow.id)).map((flow) => (
            <article key={flow.id} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{flow.name}</p>
              <p className="mt-1 text-slate-600">{flow.estimatedMinutes} min | {flow.complexity}</p>
              <Link href={`/flows/${flow.id}`} className="mt-2 inline-block font-semibold text-ocean hover:underline">Executar fluxo</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        {runbook.days.map((day) => (
          <article key={day.date} className="panel">
            <p className="text-sm font-medium text-ocean">{day.weekday} | {day.date}</p>
            <h3 className="mt-1 text-lg font-semibold">{day.objective}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {day.tasks.map((task) => (
                <li key={task.id} className="rounded-md bg-slate-50 p-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-slate-100 text-slate-700">{task.priority}</span>
                    <span className="badge bg-cyan-50 text-ocean">{task.relatedRoute}</span>
                  </div>
                  <p className="mt-2 font-semibold">{task.title}</p>
                  <p className="mt-1 text-slate-600">{task.description}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return <div className="metric-card"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
