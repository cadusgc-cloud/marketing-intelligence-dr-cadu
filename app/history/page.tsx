import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildDefaultMarketingWorkspace, exportHistoryMarkdown, exportHistoryTSV, filterHistoryEvents, summarizeHistory } from "@/lib/marketing-workspace";

export default function HistoryPage() {
  const workspace = buildDefaultMarketingWorkspace();
  const summary = summarizeHistory(workspace.history);
  const reviewEvents = filterHistoryEvents(workspace.history, { relatedRoute: "/weekly-review" });

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Historico</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Linha do tempo local de ciclos, importacoes, fechamentos, decisoes, snapshots e exportacoes. Usa apenas eventos sanitizados.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={exportHistoryMarkdown(workspace.history)} label="Copiar Markdown" />
            <LocalCopyButton text={exportHistoryTSV(workspace.history)} label="Copiar TSV" />
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Eventos" value={summary.total} />
        <MetricCard label="Criticos" value={summary.critical} />
        <MetricCard label="Exportacoes" value={summary.exports} />
        <MetricCard label="Snapshots" value={summary.snapshots} />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Timeline title="Todos os eventos" events={workspace.history} />
        <Timeline title="Fechamentos e decisoes" events={reviewEvents} />
      </section>
    </div>
  );
}

function Timeline({ title, events }: { title: string; events: ReturnType<typeof buildDefaultMarketingWorkspace>["history"] }) {
  return (
    <section className="panel">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-lg border border-slate-200 p-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-slate-100 text-slate-700">{event.type}</span>
              <span className="badge bg-cyan-50 text-ocean">{event.severity}</span>
            </div>
            <p className="mt-2 font-semibold text-ink">{event.title}</p>
            <p className="mt-1 text-slate-600">{event.description}</p>
            <p className="mt-1 text-xs text-slate-400">{event.timestamp} | {event.relatedRoute}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return <div className="metric-card"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
