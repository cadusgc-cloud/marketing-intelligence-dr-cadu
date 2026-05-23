import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildMarketingOpsState } from "@/lib/marketing-ops";
import { buildPilotWeekScenario } from "@/lib/marketing-scenarios";
import { buildStudioDashboardPackage } from "@/lib/content-studio";
import { buildIntelligenceDashboard } from "@/lib/marketing-intelligence";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";

export default function ExportsPage() {
  const state = buildMarketingOpsState();
  const packages = state.dashboard.exports;
  const pilot = buildPilotWeekScenario();
  const studio = buildStudioDashboardPackage();
  const intelligence = buildIntelligenceDashboard();
  const weeklyReview = buildDefaultWeeklyReview();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v3</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Export Center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Pacotes locais e copiaveis para execucao manual: dia, semana, mes, stories, reels, carrosseis, Etus, Google Sheets, Google Agenda, briefing de editor e relatorio de seguranca.
            </p>
          </div>
          <Link href="/operations" className="w-fit rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Voltar para operacoes
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pacotes" value={packages.length} detail="inclui backup tecnico" />
        <MetricCard label="Pacotes de usuario" value={packages.filter((pkg) => pkg.userFacing).length} detail="texto copiavel" />
        <MetricCard label="Dias" value={state.dashboard.days.length} detail={state.dashboard.month.name} />
        <MetricCard label="Readiness mes" value={`${state.dashboard.readiness.month.score}/100`} detail={state.dashboard.readiness.month.status} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v4</p>
            <h3 className="mt-1 text-lg font-semibold">Exportacoes da semana piloto</h3>
            <p className="mt-2 text-sm text-slate-500">
              {pilot.summary.period} | Google Sheets, Google Agenda, Etus/manual, stories, reels, posts e safety audit.
            </p>
          </div>
          <LocalCopyButton text={pilot.exports.weeklyMarkdown} label="Copiar resumo v4" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PilotExportBlock title="Semana piloto" text={pilot.exports.weeklyMarkdown} />
          <PilotExportBlock title="Etus/manual" text={pilot.exports.etusManual} />
          <PilotExportBlock title="Google Sheets TSV" text={pilot.exports.googleSheetsTsv} />
          <PilotExportBlock title="Google Agenda" text={pilot.exports.googleAgendaText} />
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h3 className="mt-1 text-lg font-semibold">Exportacoes do Fechamento Semanal</h3>
            <p className="mt-2 text-sm text-slate-500">
              Relatorio semanal, resumo executivo, TSV, Google Agenda, Etus/manual, tarefas, plano de gravacao, Ads manual e checklist da proxima coleta.
            </p>
          </div>
          <LocalCopyButton text={weeklyReview.exports.weeklyMarkdown} label="Copiar V7" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PilotExportBlock title="Relatorio semanal" text={weeklyReview.exports.weeklyMarkdown} />
          <PilotExportBlock title="Resumo executivo" text={weeklyReview.exports.executiveSummary} />
          <PilotExportBlock title="Google Sheets TSV v7" text={weeklyReview.exports.googleSheetsTsv} />
          <PilotExportBlock title="Google Agenda v7" text={weeklyReview.exports.googleAgenda} />
          <PilotExportBlock title="Etus/manual v7" text={weeklyReview.exports.etusManual} />
          <PilotExportBlock title="Checklist de coleta" text={weeklyReview.exports.nextCollectionChecklist} />
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h3 className="mt-1 text-lg font-semibold">Exportacoes do Content Studio</h3>
            <p className="mt-2 text-sm text-slate-500">
              Pacote completo, gravacao, briefing de editor, TSV, Google Agenda, Etus/manual, stories, reels, carrossel e checklist.
            </p>
          </div>
          <LocalCopyButton text={studio.packageItem.exports.fullPackage} label="Copiar pacote v5" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PilotExportBlock title="Pacote completo do tema" text={studio.packageItem.exports.fullPackage} />
          <PilotExportBlock title="Briefing para editor" text={studio.packageItem.exports.editorBriefing} />
          <PilotExportBlock title="Google Sheets TSV v5" text={studio.packageItem.exports.googleSheetsTsv} />
          <PilotExportBlock title="Etus/manual v5" text={studio.packageItem.exports.etusManual} />
          <PilotExportBlock title="Sessao de gravacao" text={studio.recordingSession.exportText} />
          <PilotExportBlock title="Relatorio de QA do pacote" text={studio.packageItem.exports.qualityReport} />
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h3 className="mt-1 text-lg font-semibold">Exportacoes do Intelligence Loop</h3>
            <p className="mt-2 text-sm text-slate-500">
              Insights, metricas TSV, Google Agenda, Etus/manual, experimentos, roadmap e backup JSON tecnico.
            </p>
          </div>
          <LocalCopyButton text={intelligence.exports.insightsMarkdown} label="Copiar insights v6" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PilotExportBlock title="Insights" text={intelligence.exports.insightsMarkdown} />
          <PilotExportBlock title="Metricas TSV" text={intelligence.exports.metricsTsv} />
          <PilotExportBlock title="Google Agenda v6" text={intelligence.exports.googleAgenda} />
          <PilotExportBlock title="Etus/manual v6" text={intelligence.exports.etusManual} />
          <PilotExportBlock title="Experimentos" text={intelligence.exports.experimentMarkdown} />
          <PilotExportBlock title="Roadmap" text={intelligence.exports.roadmapMarkdown} />
        </div>
      </section>

      <section className="grid gap-4">
        {packages.map((pkg) => (
          <article key={pkg.id} className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{pkg.format}</span>
                  <span className={`badge ${pkg.userFacing ? "bg-green-50 text-leaf" : "bg-slate-100 text-slate-600"}`}>{pkg.userFacing ? "usuario" : "backup tecnico"}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{pkg.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
              </div>
              <LocalCopyButton text={pkg.text} label="Copiar pacote" />
            </div>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{pkg.text}</pre>
          </article>
        ))}
      </section>
    </div>
  );
}

function PilotExportBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h4 className="font-semibold">{title}</h4>
        <LocalCopyButton text={text} label="Copiar" />
      </div>
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{text}</pre>
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
