import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildDogfoodingReportMarkdown, buildPrReadinessMarkdown, runMarketingDogfoodingScenario } from "@/lib/marketing-dogfooding";
import { buildQualityReportMarkdown } from "@/lib/marketing-quality";
import { buildContentStudioCheckReport } from "@/lib/content-studio";
import { buildIntelligenceDashboard } from "@/lib/marketing-intelligence";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";
import { auditWorkspace, buildDefaultMarketingWorkspace } from "@/lib/marketing-workspace";

const statusClasses = {
  aprovado: "bg-green-50 text-leaf",
  revisar: "bg-amber-50 text-amber",
  bloqueado: "bg-red-50 text-red-700"
} as const;

export default function QaPage() {
  const dogfood = runMarketingDogfoodingScenario();
  const qaMarkdown = buildQualityReportMarkdown(dogfood.quality);
  const dogfoodMarkdown = buildDogfoodingReportMarkdown(dogfood);
  const prMarkdown = buildPrReadinessMarkdown(dogfood);
  const studioCheck = buildContentStudioCheckReport();
  const intelligence = buildIntelligenceDashboard();
  const weeklyReview = buildDefaultWeeklyReview();
  const workspace = buildDefaultMarketingWorkspace();
  const workspaceAudit = auditWorkspace(workspace);
  const approvedDays = dogfood.dailyReadiness.filter((day) => day.risk === "seguro" || day.risk === "atencao").length;
  const reviewDays = dogfood.dailyReadiness.filter((day) => day.risk === "revisar_antes_de_postar").length;
  const blockedDays = dogfood.dailyReadiness.filter((day) => day.risk === "bloquear").length;

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <p className="text-sm font-medium text-ocean">Marketing OS v4</p>
              <span className={`badge ${statusClasses[dogfood.finalStatus]}`}>{dogfood.finalStatus}</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">QA, Dogfooding e PR Readiness</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Validacao automatica da semana piloto de marketing medico seguro: StoryOps, exports, safety, readiness e checklist de PR. Tudo local, deterministico e sem integracao externa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={dogfoodMarkdown} label="Copiar dogfood" />
            <LocalCopyButton text={prMarkdown} label="Copiar PR readiness" />
            <Link href="/operations" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Operacoes
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Status QA" value={dogfood.quality.status} detail={`${dogfood.quality.score}/100`} />
        <MetricCard label="Regras internas" value={dogfood.quality.totalChecks} detail={`${dogfood.quality.passedChecks} aprovadas`} />
        <MetricCard label="Readiness semana" value={`${dogfood.weeklyReadiness}/100`} detail={dogfood.scenario.summary.period} />
        <MetricCard label="Dias aprovados" value={approvedDays} detail={`${reviewDays} revisar | ${blockedDays} bloqueados`} />
        <MetricCard label="Stories" value={dogfood.totalStories} detail="6 por dia" />
        <MetricCard label="Exports" value={dogfood.exportsGenerated.length} detail="pacotes locais" />
        <MetricCard label="Studio v5" value={studioCheck.status} detail={`${studioCheck.generatedPackages} pacotes`} />
        <MetricCard label="Intelligence v6" value={intelligence.report.quality.status} detail={`${intelligence.intelligenceScore}/100`} />
        <MetricCard label="Weekly v7" value={weeklyReview.quality.status} detail={`${weeklyReview.quality.score}/100`} />
        <MetricCard label="Workspace v8" value={workspaceAudit.status} detail={`${workspaceAudit.score}/100`} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h3 className="mt-1 text-lg font-semibold">Workspace check e backup check</h3>
            <p className="mt-2 text-sm text-slate-500">
              {workspace.history.length} eventos | {workspace.snapshots.length} snapshots | status {workspaceAudit.status}.
            </p>
          </div>
          <Link href="/workspace" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir Workspace</Link>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h3 className="mt-1 text-lg font-semibold">Import check e weekly check</h3>
            <p className="mt-2 text-sm text-slate-500">
              {weeklyReview.currentRecords.length} registros no fechamento | {weeklyReview.nextWeekPlan.days.length} dias na proxima semana | confianca {weeklyReview.quality.confidence}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/weekly-review" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir V7</Link>
            <LocalCopyButton text={weeklyReview.exports.importQualityMarkdown} label="Copiar QA V7" />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h3 className="mt-1 text-lg font-semibold">Content Studio check</h3>
            <p className="mt-2 text-sm text-slate-500">
              {studioCheck.generatedPackages} pacotes | {studioCheck.generatedVariants} variacoes | {studioCheck.recordingTopics} videos | readiness medio {studioCheck.averageReadiness}/100
            </p>
          </div>
          <Link href="/studio" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir Studio</Link>
        </div>
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-ink">Falhas bloqueantes</p>
          <ul className="mt-2 space-y-1">
            {studioCheck.blockingFailures.length ? studioCheck.blockingFailures.map((failure) => <li key={failure}>- {failure}</li>) : <li>- nenhuma falha bloqueante</li>}
          </ul>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h3 className="mt-1 text-lg font-semibold">Intelligence check</h3>
            <p className="mt-2 text-sm text-slate-500">
              {intelligence.recordCount} registros | {intelligence.experiments.length} experimentos | {intelligence.roadmap.adaptiveCalendar.length} dias adaptativos | QA {intelligence.report.quality.score}/100.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/insights" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir Insights</Link>
            <LocalCopyButton text={intelligence.exports.nextActionsMarkdown} label="Copiar V6" />
          </div>
        </div>
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-ink">Falhas bloqueantes V6</p>
          <ul className="mt-2 space-y-1">
            {intelligence.report.quality.blockingIssues.length ? intelligence.report.quality.blockingIssues.map((failure) => <li key={failure}>- {failure}</li>) : <li>- nenhuma falha bloqueante</li>}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Semana piloto</p>
          <h3 className="mt-1 text-lg font-semibold">{dogfood.scenario.summary.campaignName}</h3>
          <p className="mt-2 text-sm text-slate-500">{dogfood.scenario.summary.period}</p>
          <div className="mt-4 space-y-3">
            {dogfood.scenario.days.map((day) => (
              <article key={day.editorialDay.date} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-ink">{day.editorialDay.weekday} - {day.editorialDay.theme}</p>
                    <p className="mt-1 text-slate-500">{day.editorialDay.date} | {day.editorialDay.pillar.name}</p>
                  </div>
                  <span className="badge bg-slate-100 text-slate-700">{day.readiness.score}/100</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Falhas e avisos</p>
          <h3 className="mt-1 text-lg font-semibold">Resultado consolidado</h3>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-ink">Falhas bloqueantes</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              {dogfood.failures.length ? dogfood.failures.map((failure) => <li key={failure.id}>- {failure.source}: {failure.message}</li>) : <li>- nenhuma falha bloqueante</li>}
            </ul>
          </div>
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-ink">Termos e alertas detectados</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              {dogfood.sensitiveTermsDetected.length ? dogfood.sensitiveTermsDetected.slice(0, 10).map((item) => <li key={item}>- {item}</li>) : <li>- sem termo sensivel bloqueante no cenario padrao</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ReportPanel title="QA automatico" text={qaMarkdown} />
        <ReportPanel title="PR readiness" text={prMarkdown} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Exportacoes validadas</p>
            <h3 className="mt-1 text-lg font-semibold">Semana piloto pronta para copiar</h3>
          </div>
          <LocalCopyButton text={dogfood.scenario.exports.weeklyMarkdown} label="Copiar semana piloto" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(dogfood.quality.exportValidation).map(([key, value]) => (
            <div key={key} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{key}</p>
              <p className={value ? "mt-1 text-leaf" : "mt-1 text-red-700"}>{value ? "ok" : "falha"}</p>
            </div>
          ))}
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{dogfood.scenario.exports.weeklyMarkdown}</pre>
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

function ReportPanel({ title, text }: { title: string; text: string }) {
  return (
    <section className="panel">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <LocalCopyButton text={text} label="Copiar" />
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{text}</pre>
    </section>
  );
}
