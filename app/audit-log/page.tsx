import { LocalCopyButton } from "@/components/LocalCopyButton";
import { auditWorkspace, buildDefaultMarketingWorkspace, buildWorkspaceExports } from "@/lib/marketing-workspace";
import { buildFlowHistoryEvents, createFlowRun } from "@/lib/guided-flows";

export default function AuditLogPage() {
  const workspace = buildDefaultMarketingWorkspace();
  const audit = auditWorkspace(workspace);
  const exports = buildWorkspaceExports(workspace);
  const flowEvents = buildFlowHistoryEvents(createFlowRun("auditoria-seguranca", { completedStepIds: ["abrir-safety", "abrir-qa", "revisar-bloqueios"] }));
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Registro Operacional</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Auditoria local de eventos, severidade, modulos e integridade do workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={exports.integrityMarkdown} label="Copiar auditoria" />
            <LocalCopyButton text={exports.historyTsv} label="Copiar TSV" />
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Status" value={audit.status} />
        <MetricCard label="Score" value={`${audit.score}/100`} />
        <MetricCard label="Issues" value={audit.issues.length} />
      </section>
      <section className="panel">
        <h3 className="text-lg font-semibold">Eventos auditaveis</h3>
        <div className="mt-4 space-y-3">
          {workspace.auditTrail.map((event) => (
            <article key={event.id} className="rounded-lg border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{event.sourceModule}</span>
                <span className="badge bg-cyan-50 text-ocean">{event.severity}</span>
              </div>
              <p className="mt-2 font-semibold text-ink">{event.title}</p>
              <p className="mt-1 text-slate-600">{event.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3 className="text-lg font-semibold">Eventos de fluxo V9</h3>
        <div className="mt-4 space-y-3">
          {flowEvents.map((event) => (
            <article key={`${event.type}-${event.description}`} className="rounded-lg border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">guided-flows</span>
                <span className="badge bg-cyan-50 text-ocean">{event.type}</span>
              </div>
              <p className="mt-2 font-semibold text-ink">{event.title}</p>
              <p className="mt-1 text-slate-600">{event.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return <div className="metric-card"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
