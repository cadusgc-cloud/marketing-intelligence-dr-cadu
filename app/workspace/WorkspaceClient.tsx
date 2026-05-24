"use client";

import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { useMarketingWorkspace } from "@/components/workspace/useMarketingWorkspace";
import { auditWorkspace, generateWeeklyRunbook, listSnapshots } from "@/lib/marketing-workspace";
import { createFlowRun, getGuidedFlowCatalog } from "@/lib/guided-flows";

export function WorkspaceClient() {
  const { workspace, storageStatus, exports, saveWeeklyReviewSnapshot } = useMarketingWorkspace();
  const audit = auditWorkspace(workspace);
  const runbook = generateWeeklyRunbook({ workspace });
  const snapshots = listSnapshots(workspace);
  const flows = getGuidedFlowCatalog();
  const activeFlow = createFlowRun("fechamento-semanal-completo", { completedStepIds: ["abrir-imports", "colar-relatorio"] });

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Workspace</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Estado local, historico, snapshots e recuperacao do Marketing OS. Persistencia opcional no navegador, sem backend e sem API externa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={exports.backupJson} label="Copiar backup" />
            <LocalCopyButton text={exports.historyMarkdown} label="Copiar historico" />
            <button type="button" onClick={saveWeeklyReviewSnapshot} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Salvar snapshot
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Workspace" value={workspace.metadata.name} detail={storageStatus} />
        <MetricCard label="Semana ativa" value={workspace.activeCycle.weekId} detail={`${workspace.activeCycle.periodStart} a ${workspace.activeCycle.periodEnd}`} />
        <MetricCard label="Readiness" value={`${workspace.activeCycle.readinessScore}/100`} detail={workspace.activeCycle.riskStatus} />
        <MetricCard label="Snapshots" value={snapshots.length} detail="locais e sanitizados" />
        <MetricCard label="Integridade" value={audit.status} detail={`${audit.score}/100`} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v9</p>
            <h3 className="mt-1 text-lg font-semibold">Fluxos em andamento</h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeFlow.progressPercent}% do fluxo semanal simulado concluido. O progresso real fica apenas neste navegador quando o fluxo e aberto.
            </p>
          </div>
          <Link href="/flows" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir fluxos</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {flows.slice(0, 3).map((flow) => (
            <article key={flow.id} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{flow.name}</p>
              <p className="mt-1 text-slate-600">{flow.steps.length} etapas | {flow.outputs.length} saidas</p>
              <Link href={`/flows/${flow.id}`} className="mt-2 inline-block font-semibold text-ocean hover:underline">Retomar</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Continuidade</p>
          <h3 className="mt-1 text-lg font-semibold">Ciclo ativo</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-ink">Campanha:</span> {workspace.activeCycle.campaignName}</p>
            <p><span className="font-semibold text-ink">Foco:</span> {workspace.activeCycle.currentFocus}</p>
            <p><span className="font-semibold text-ink">Proximo ciclo:</span> {workspace.activeCycle.nextRecommendedCycle}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["/weekly-review", "/imports", "/performance", "/strategy", "/studio", "/operations"].map((href) => (
              <Link key={href} href={href} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{href}</Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="text-sm font-medium text-ocean">Runbook de hoje</p>
          <h3 className="mt-1 text-lg font-semibold">{runbook.days[0]?.weekday} operacional</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {runbook.days[0]?.tasks.map((task) => (
              <li key={task.id} className="rounded-md bg-slate-50 p-3">
                <span className="font-semibold text-ink">{task.title}</span> - {task.description}
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Snapshots</p>
          <h3 className="mt-1 text-lg font-semibold">Recuperacao local</h3>
          <div className="mt-4 space-y-3">
            {snapshots.map((snapshot) => (
              <article key={snapshot.id} className="rounded-lg border border-slate-200 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{snapshot.type}</span>
                  <span className="badge bg-cyan-50 text-ocean">{snapshot.safetyStatus}</span>
                </div>
                <p className="mt-2 font-semibold text-ink">{snapshot.label}</p>
                <p className="mt-1 text-slate-500">{snapshot.summary}</p>
                <p className="mt-1 text-xs text-slate-400">checksum {snapshot.checksum}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="text-sm font-medium text-ocean">Auditoria local</p>
          <h3 className="mt-1 text-lg font-semibold">{audit.summary}</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {audit.issues.length ? audit.issues.map((issue) => <li key={`${issue.code}-${issue.path}`}>- {issue.severity}: {issue.message}</li>) : <li>- Nenhum dado sensivel ou corrupcao detectados.</li>}
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
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
