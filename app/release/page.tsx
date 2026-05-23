import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildLocalChangelog, buildDefaultReleaseReadinessReport } from "@/lib/release-readiness";

export default function ReleasePage() {
  const report = buildDefaultReleaseReadinessReport();
  const changelog = buildLocalChangelog();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v9</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Release Candidate</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Prontidao local para push/PR, sem executar GitHub API, push, merge ou tag. Use como checklist antes de abrir PR.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={report.reportMarkdown} label="Copiar release" />
            <LocalCopyButton text={report.prDraft.markdown} label="Copiar PR draft" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Status" value={report.status} />
        <MetricCard label="Rotas" value={report.routes.length} />
        <MetricCard label="Scripts" value={report.commands.length} />
        <MetricCard label="Docs" value={report.docs.length} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Checklist</p>
          <div className="mt-4 space-y-3">
            {report.checklist.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <span className={`badge ${item.status === "aprovado" ? "bg-green-50 text-leaf" : "bg-amber-50 text-amber"}`}>{item.status}</span>
                <p className="mt-2 font-semibold text-ink">{item.label}</p>
                <p className="mt-1 text-slate-600">{item.evidence}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <p className="text-sm font-medium text-ocean">PR draft</p>
          <h3 className="mt-1 text-lg font-semibold">{report.prDraft.title}</h3>
          <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{report.prDraft.markdown}</pre>
        </section>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Comando futuro</p>
        <pre className="mt-3 rounded-md bg-slate-950 p-3 text-sm text-slate-50">{report.pushCommandText}</pre>
        <p className="mt-3 text-sm text-slate-500">O sistema apenas sugere o comando. Nenhum push foi ou sera executado automaticamente.</p>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Changelog local</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{changelog}</pre>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
    </div>
  );
}
