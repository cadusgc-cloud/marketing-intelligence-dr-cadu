import { LocalCopyButton } from "@/components/LocalCopyButton";
import { AppShell, ChecklistPanel, MetricCard, PageHeader, ProgressBar, SectionHeader, StatusBadge } from "@/components/product";
import { buildReleasePolishReport } from "@/lib/release-polish";
import { buildLocalChangelog, buildDefaultReleaseReadinessReport } from "@/lib/release-readiness";

export default function ReleasePage() {
  const report = buildDefaultReleaseReadinessReport();
  const polish = buildReleasePolishReport();
  const changelog = buildLocalChangelog();
  const polishAreas = [polish.productReadiness, polish.uxReadiness, polish.routeReadiness, polish.qaReadiness, polish.docsReadiness, polish.safetyReadiness, polish.localOnlyCompliance];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Release polish V10"
        title="Release Candidate"
        description="Prontidao local para push/PR/merge manual, sem executar GitHub API, push, merge ou tag. Use como checklist antes de abrir PR."
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <LocalCopyButton text={report.reportMarkdown} label="Copiar release" />
          <LocalCopyButton text={report.prDraft.markdown} label="Copiar PR draft" />
        </div>
      </PageHeader>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Status" value={report.status} />
        <MetricCard label="Rotas" value={report.routes.length} />
        <MetricCard label="Scripts" value={report.commands.length} />
        <MetricCard label="Docs" value={report.docs.length} />
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Release polish V10" title="Readiness do produto" description="Pontuacao consolidada de produto, UX, rotas, QA, docs, safety e compliance local-only." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {polishAreas.map((area) => (
            <article key={area.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={area.status} tone={area.status === "aprovado" ? "success" : area.status === "revisar" ? "warning" : "danger"} />
                <span className="text-sm font-semibold text-slate-700">{area.score}/100</span>
              </div>
              <h3 className="mt-3 font-semibold text-ink">{area.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{area.evidence}</p>
            </article>
          ))}
        </div>
        <div className="mt-5">
          <ProgressBar value={polish.releaseScore} label="Release score V10" />
        </div>
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
          <h2 className="mt-1 text-lg font-semibold">{report.prDraft.title}</h2>
          <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{report.prDraft.markdown}</pre>
        </section>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Comando futuro</p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-sm text-slate-50">{polish.pushCommandText}</pre>
        <p className="mt-3 text-sm text-slate-500">O sistema apenas sugere o comando. Nenhum push foi ou sera executado automaticamente.</p>
      </section>

      <ChecklistPanel title="Checklist para merge manual" items={polish.manualMergeChecklist} />

      <section className="panel">
        <SectionHeader eyebrow="Changelog local" title="Resumo de release" description={polish.prSummary} />
        <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{changelog}</pre>
      </section>
    </AppShell>
  );
}
