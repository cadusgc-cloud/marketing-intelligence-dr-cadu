"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import {
  TASK_STATUSES,
  applyTaskStatusOverrides,
  buildMarketingOpsState,
  getDefaultOpsLocalState,
  getMediaOpsCategories,
  readinessStatusLabel,
  type ExecutionTask,
  type ExportPackage,
  type OpsLocalState,
  type PublishingReadiness,
  type TaskStatus
} from "@/lib/marketing-ops";
import { runMarketingDogfoodingScenario } from "@/lib/marketing-dogfooding";
import { buildStudioDashboardPackage } from "@/lib/content-studio";
import { buildIntelligenceDashboard } from "@/lib/marketing-intelligence";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";
import { auditWorkspace, buildDefaultMarketingWorkspace, generateWeeklyRunbook } from "@/lib/marketing-workspace";
import { safetyClassificationLabel, type SafetyClassification } from "@/lib/monthly-editorial";

const LOCAL_STATE_KEY = "marketing-os-v3-local-state";

const riskClasses: Record<SafetyClassification, string> = {
  seguro: "bg-green-50 text-leaf",
  atencao: "bg-amber-50 text-amber",
  revisar_antes_de_postar: "bg-orange-50 text-orange-700",
  bloquear: "bg-red-50 text-red-700"
};

const statusClasses: Record<TaskStatus, string> = {
  pendente: "bg-slate-100 text-slate-700",
  em_andamento: "bg-cyan-50 text-ocean",
  pronto: "bg-green-50 text-leaf",
  publicado_manual: "bg-indigo-50 text-indigo-700",
  bloqueado: "bg-red-50 text-red-700",
  arquivado: "bg-slate-100 text-slate-500"
};

const readinessClasses: Record<PublishingReadiness["status"], string> = {
  pronto: "bg-green-50 text-leaf",
  quase_pronto: "bg-cyan-50 text-ocean",
  precisa_midia: "bg-amber-50 text-amber",
  precisa_revisao: "bg-orange-50 text-orange-700",
  bloqueado: "bg-red-50 text-red-700"
};

const priorityClasses: Record<ExecutionTask["priority"], string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-cyan-50 text-ocean",
  alta: "bg-amber-50 text-amber",
  critica: "bg-red-50 text-red-700"
};

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

function ReadinessBadge({ readiness }: { readiness: PublishingReadiness }) {
  return <span className={`badge ${readinessClasses[readiness.status]}`}>{readiness.score}/100 - {readinessStatusLabel(readiness.status)}</span>;
}

function ExportPreview({ pkg }: { pkg: ExportPackage }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="font-semibold">{pkg.title}</p>
          <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
        </div>
        <LocalCopyButton text={pkg.text} label="Copiar" />
      </div>
      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{pkg.text.slice(0, 2400)}</pre>
    </article>
  );
}

export function OperationsClient() {
  const state = useMemo(() => buildMarketingOpsState(), []);
  const dogfood = useMemo(() => runMarketingDogfoodingScenario(), []);
  const studio = useMemo(() => buildStudioDashboardPackage(), []);
  const intelligence = useMemo(() => buildIntelligenceDashboard(), []);
  const weeklyReview = useMemo(() => buildDefaultWeeklyReview(), []);
  const workspace = useMemo(() => buildDefaultMarketingWorkspace(), []);
  const workspaceAudit = useMemo(() => auditWorkspace(workspace), [workspace]);
  const runbook = useMemo(() => generateWeeklyRunbook({ workspace }), [workspace]);
  const dashboard = state.dashboard;
  const [localState, setLocalState] = useState<OpsLocalState>(() => getDefaultOpsLocalState());
  const [hydrated, setHydrated] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(dashboard.today.dayNumber);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<OpsLocalState>;
        setLocalState({
          ...getDefaultOpsLocalState(),
          ...parsed,
          taskStatuses: parsed.taskStatuses ?? {}
        });
      }
    } catch {
      setLocalState(getDefaultOpsLocalState());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(localState));
  }, [hydrated, localState]);

  const tasks = useMemo(() => applyTaskStatusOverrides(dashboard.tasks.tasks, localState.taskStatuses), [dashboard.tasks.tasks, localState.taskStatuses]);
  const selectedDay = dashboard.days.find((day) => day.dayNumber === selectedDayNumber) ?? dashboard.today;
  const todayTasks = tasks.filter((task) => task.dayNumber === dashboard.today.dayNumber);
  const selectedDayTasks = tasks.filter((task) => task.dayNumber === selectedDay.dayNumber);
  const pendingTasks = tasks.filter((task) => task.status === "pendente" || task.status === "em_andamento");
  const readyTasks = tasks.filter((task) => task.status === "pronto" || task.status === "publicado_manual");
  const blockedTasks = tasks.filter((task) => task.status === "bloqueado" || task.blockedBySafety);
  const filteredTasks = tasks.filter((task) => {
    if (localState.filters.status && task.status !== localState.filters.status) return false;
    if (localState.filters.area && task.area !== localState.filters.area) return false;
    return true;
  });

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    setLocalState((current) => ({
      ...current,
      taskStatuses: {
        ...current.taskStatuses,
        [taskId]: status
      }
    }));
  }

  function updateFilter(partial: OpsLocalState["filters"]) {
    setLocalState((current) => ({
      ...current,
      filters: {
        ...current.filters,
        ...partial
      }
    }));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-ocean">Marketing OS v3 + v4 + v5 + v6</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Central Operacional de Execucao Editorial</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Painel interno para transformar o plano mensal em tarefas do dia, stories copiaveis, midia natural, safety, readiness e exportacao manual. Nada aqui publica, conecta API, envia mensagem ou usa dados de paciente.
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber lg:max-w-sm">
            <p className="font-semibold">Execucao manual e segura</p>
            <p className="mt-1">Use como cockpit local: revisar, copiar, gravar, separar midia e publicar fora do sistema somente apos conferencia humana.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["/storyops", "StoryOps"],
            ["/campaigns", "Campanhas"],
            ["/studio", "Content Studio"],
            ["/library", "Biblioteca"],
            ["/recording", "Gravacao"],
            ["/review", "Revisao"],
            ["/workspace", "Workspace"],
            ["/history", "Historico"],
            ["/runbook", "Runbook"],
            ["/audit-log", "Registro"],
            ["/weekly-review", "Fechamento v7"],
            ["/imports", "Importacoes"],
            ["/performance", "Performance"],
            ["/insights", "Insights"],
            ["/metrics", "Metricas"],
            ["/experiments", "Experimentos"],
            ["/strategy", "Estrategia"],
            ["/exports", "Export Center"],
            ["/safety", "Safety Center"],
            ["/qa", "QA v4"],
            ["/media", "Midias"],
            ["/calendar", "Calendario"],
            ["/data", "Dados"]
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Readiness hoje" value={`${dashboard.readiness.today.score}/100`} detail={readinessStatusLabel(dashboard.readiness.today.status)} />
        <MetricCard label="Readiness semana" value={`${dashboard.readiness.week.score}/100`} detail={readinessStatusLabel(dashboard.readiness.week.status)} />
        <MetricCard label="Readiness mes" value={`${dashboard.readiness.month.score}/100`} detail={readinessStatusLabel(dashboard.readiness.month.status)} />
        <MetricCard label="Tarefas pendentes" value={pendingTasks.length} detail={`${readyTasks.length} prontas | ${blockedTasks.length} bloqueadas`} />
        <MetricCard label="Dias planejados" value={dashboard.days.length} detail={dashboard.month.name} />
        <MetricCard label="Stories do mes" value={dashboard.days.length * 6} detail="StoryOps integrado" />
        <MetricCard label="Reels a gravar" value={dashboard.week.reelsToRecord.length} detail="na semana atual" />
        <MetricCard label="Riscos detectados" value={dashboard.safety.totalIssues} detail={safetyClassificationLabel(dashboard.safety.safetyGate.classification)} />
        <MetricCard label="Dogfooding v4" value={dogfood.finalStatus} detail={`${dogfood.weeklyReadiness}/100 na semana piloto`} />
        <MetricCard label="Studio v5" value={`${studio.averageReadiness}/100`} detail={`${studio.productionQueue.length} itens de producao`} />
        <MetricCard label="Intelligence v6" value={`${intelligence.intelligenceScore}/100`} detail={`${intelligence.report.recommendations.length} proximas acoes`} />
        <MetricCard label="Fechamento v7" value={weeklyReview.quality.confidence} detail={`${weeklyReview.tasks.length} tarefas semanais`} />
        <MetricCard label="Workspace v8" value={workspaceAudit.status} detail={`${workspace.snapshots.length} snapshots | runbook ${runbook.days.length} dias`} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Semana piloto validada</p>
            <h3 className="mt-1 text-lg font-semibold">{dogfood.scenario.summary.campaignName}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {dogfood.scenario.summary.period} | {dogfood.totalStories} stories | {dogfood.totalReels} reels | {dogfood.totalPostsAndCarousels} posts/carrosseis | QA {dogfood.quality.score}/100
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/qa" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir QA</Link>
            <LocalCopyButton text={dogfood.scenario.exports.weeklyMarkdown} label="Copiar semana piloto" />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h3 className="mt-1 text-lg font-semibold">Workspace, historico e runbook</h3>
            <p className="mt-2 text-sm text-slate-500">
              {workspace.metadata.name} | integridade {workspaceAudit.status} {workspaceAudit.score}/100 | {workspace.history.length} eventos | {workspace.snapshots.length} snapshots.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/workspace" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Workspace</Link>
            <Link href="/runbook" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Runbook</Link>
            <Link href="/history" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Historico</Link>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {runbook.days.slice(0, 3).map((day) => (
            <article key={day.date} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{day.weekday} - {day.objective}</p>
              <p className="mt-1 text-slate-600">{day.tasks.length} tarefas | {day.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)} min</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h3 className="mt-1 text-lg font-semibold">Fechamento semanal e plano operacional</h3>
            <p className="mt-2 text-sm text-slate-500">
              {weeklyReview.period.label} | {weeklyReview.currentRecords.length} registros | confianca {weeklyReview.quality.confidence} | {weeklyReview.nextWeekPlan.days.length} dias planejados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/weekly-review" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechamento</Link>
            <Link href="/imports" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Importar relatorio</Link>
            <Link href="/performance" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Performance</Link>
            <LocalCopyButton text={weeklyReview.exports.weeklyMarkdown} label="Copiar V7" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {weeklyReview.nextWeekPlan.days.slice(0, 4).map((day) => (
            <article key={day.date} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{day.date} - {day.theme}</p>
              <p className="mt-1 text-slate-600">{day.format} | readiness {day.readiness}/100</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h3 className="mt-1 text-lg font-semibold">Intelligence Loop e calendario adaptativo</h3>
            <p className="mt-2 text-sm text-slate-500">
              {intelligence.recordCount} registros ficticios agregados | score {intelligence.intelligenceScore}/100 | {intelligence.experiments.length} experimentos | {intelligence.roadmap.adaptiveCalendar.length} dias recomendados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/insights" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir Insights</Link>
            <Link href="/metrics" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Metricas</Link>
            <Link href="/strategy" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Estrategia</Link>
            <LocalCopyButton text={intelligence.exports.nextActionsMarkdown} label="Copiar acoes v6" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {intelligence.roadmap.adaptiveCalendar.slice(0, 4).map((day) => (
            <article key={day.date} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{day.date} - {day.theme}</p>
              <p className="mt-1 text-slate-600">{day.format} | {day.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h3 className="mt-1 text-lg font-semibold">Content Studio e gravacao em lote</h3>
            <p className="mt-2 text-sm text-slate-500">
              {studio.packages.length} pacotes editoriais | {studio.recordingSession.topics.length} videos para gravar | {studio.reviewQueue.length} itens em revisao | readiness medio {studio.averageReadiness}/100
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/studio" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir Studio</Link>
            <Link href="/recording" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Planejar gravacao</Link>
            <Link href="/review" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fila de revisao</Link>
            <LocalCopyButton text={studio.packageItem.exports.fullPackage} label="Copiar pacote v5" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-ocean">Hoje</p>
              <h3 className="mt-1 text-lg font-semibold">{dashboard.today.theme}</h3>
              <p className="mt-2 text-sm text-slate-500">{dashboard.today.date} - {dashboard.today.weekday} - {dashboard.today.pillar}</p>
            </div>
            <ReadinessBadge readiness={dashboard.today.readiness} />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">O que fazer agora</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {todayTasks.slice(0, 6).map((task) => (
                  <li key={task.id} className="flex gap-2">
                    <span className={`badge ${priorityClasses[task.priority]}`}>{task.priority}</span>
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">Midia de hoje</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {dashboard.today.mediaNeeds.slice(0, 5).map((need) => (
                  <li key={need.id}>- {need.label}: {need.reason}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <p className="font-semibold">Exportacao rapida do dia</p>
              <LocalCopyButton text={dashboard.today.quickExport} label="Copiar pacote do dia" />
            </div>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{dashboard.today.quickExport.slice(0, 3200)}</pre>
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-ocean">Esta semana</p>
                <h3 className="mt-1 text-lg font-semibold">Semana {dashboard.week.weekNumber}</h3>
                <p className="mt-2 text-sm text-slate-500">{dashboard.week.startDate} a {dashboard.week.endDate}</p>
              </div>
              <ReadinessBadge readiness={dashboard.week.readiness} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-semibold text-ink">Temas</p>
                <ul className="mt-2 space-y-1">{dashboard.week.themes.slice(0, 7).map((theme) => <li key={theme}>- {theme}</li>)}</ul>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-semibold text-ink">Checklist</p>
                <ul className="mt-2 space-y-1">{dashboard.week.checklist.map((item) => <li key={item}>- {item}</li>)}</ul>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-ocean">Este mes</p>
                <h3 className="mt-1 text-lg font-semibold">{dashboard.month.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{dashboard.month.startDate} a {dashboard.month.endDate}</p>
              </div>
              <ReadinessBadge readiness={dashboard.readiness.month} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              {dashboard.operations.map((operation) => (
                <div key={operation.id} className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <span className="font-semibold text-ink">{operation.label}</span>
                  <span className={`badge ${readinessClasses[operation.readiness.status]}`}>{operation.readiness.score}/100 - {operation.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Fila de execucao</p>
            <h3 className="mt-1 text-lg font-semibold">Tarefas editoriais com status local</h3>
            <p className="mt-2 text-sm text-slate-500">Os status ficam salvos apenas neste navegador via localStorage. Nenhum dado e enviado para fora.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={localState.filters.status ?? ""} onChange={(event) => updateFilter({ status: event.target.value ? event.target.value as TaskStatus : undefined })} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option value="">Todos os status</option>
              {TASK_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select value={localState.filters.area ?? ""} onChange={(event) => updateFilter({ area: event.target.value ? event.target.value as ExecutionTask["area"] : undefined })} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option value="">Todas as areas</option>
              {Array.from(new Set(tasks.map((task) => task.area))).map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {filteredTasks.slice(0, 24).map((task) => (
            <article key={task.id} className="grid gap-3 rounded-lg border border-slate-200 p-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${statusClasses[task.status]}`}>{task.status}</span>
                  <span className={`badge ${priorityClasses[task.priority]}`}>{task.priority}</span>
                  <span className="badge bg-slate-100 text-slate-700">{task.area}</span>
                  <span className="badge bg-slate-100 text-slate-700">{task.date}</span>
                </div>
                <h4 className="mt-3 font-semibold">{task.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                <p className="mt-2 text-xs text-slate-500">Responsavel sugerido: {task.ownerSuggestion} | Janela: {task.actionWindow}</p>
              </div>
              <div className="flex flex-col gap-2">
                <select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                  {TASK_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {task.exportText ? <LocalCopyButton text={task.exportText} label="Copiar tarefa" /> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Visao do dia</p>
          <h3 className="mt-1 text-lg font-semibold">Selecionar pacote diario</h3>
          <div className="mt-4 grid max-h-[520px] gap-3 overflow-auto md:grid-cols-2">
            {dashboard.days.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`rounded-lg border p-3 text-left transition ${selectedDay.dayNumber === day.dayNumber ? "border-ocean bg-cyan-50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">Dia {day.dayNumber}</span>
                  <span className={`badge ${riskClasses[day.risk]}`}>{safetyClassificationLabel(day.risk)}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{day.theme}</p>
                <p className="mt-1 text-xs text-slate-500">{day.date} - {day.weekday}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-ocean">Pacote selecionado</p>
              <h3 className="mt-1 text-lg font-semibold">{selectedDay.theme}</h3>
              <p className="mt-2 text-sm text-slate-500">{selectedDayTasks.length} tarefas | {selectedDay.mediaNeeds.length} midias sugeridas</p>
            </div>
            <LocalCopyButton text={selectedDay.quickExport} label="Copiar dia" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">Tarefas do dia</p>
              <ul className="mt-2 space-y-1 text-slate-600">{selectedDayTasks.map((task) => <li key={task.id}>- {task.title}</li>)}</ul>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">Midia</p>
              <ul className="mt-2 space-y-1 text-slate-600">{selectedDay.mediaNeeds.map((need) => <li key={need.id}>- {need.label}</li>)}</ul>
            </div>
          </div>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{selectedDay.quickExport.slice(0, 4200)}</pre>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ocean">Content Backlog</p>
              <h3 className="mt-1 text-lg font-semibold">Ideias reaproveitaveis</h3>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{dashboard.backlog.length} itens</span>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.backlog.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${priorityClasses[item.priority]}`}>{item.priority}</span>
                  <span className={`badge ${riskClasses[item.editorialRisk]}`}>{safetyClassificationLabel(item.editorialRisk)}</span>
                </div>
                <p className="mt-2 font-semibold text-ink">{item.theme}</p>
                <p className="mt-1 text-slate-600">{item.suggestedFormat} | {item.requiredMedia.join(" + ")}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Repurposing Engine</p>
          <h3 className="mt-1 text-lg font-semibold">Um tema em varios formatos</h3>
          <div className="mt-4 space-y-3">
            {dashboard.repurposing.slice(0, 3).map((plan) => (
              <article key={plan.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="font-semibold text-ink">{plan.theme}</p>
                  <LocalCopyButton text={[plan.storySequence, plan.reelScript, plan.carousel, plan.shortCaption, plan.editorBriefing].join("\n\n---\n\n")} label="Copiar pacote" />
                </div>
                <p className="mt-2 text-slate-600">{plan.spontaneousSpeech}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">MediaOps V3</p>
          <h3 className="mt-1 text-lg font-semibold">Captura de midia natural</h3>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-ink">Lacunas</p>
            <ul className="mt-2 space-y-1 text-slate-600">{dashboard.media.gaps.map((gap) => <li key={gap}>- {gap}</li>)}</ul>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {getMediaOpsCategories().slice(0, 10).map((category) => <span key={category} className="badge bg-slate-100 text-slate-700">{category}</span>)}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-ocean">Safety Center</p>
              <h3 className="mt-1 text-lg font-semibold">Risco consolidado do mes</h3>
              <p className="mt-2 text-sm text-slate-500">Termos proibidos, bloqueios e revisoes ficam visiveis antes de qualquer uso externo.</p>
            </div>
            <Link href="/safety" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir safety</Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Bloqueados" value={dashboard.safety.blockedContent} />
            <MetricCard label="Revisar" value={dashboard.safety.needsReview} />
            <MetricCard label="Seguros" value={dashboard.safety.safeContent} />
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {dashboard.readiness.bottlenecks.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>

        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-ocean">Export Center</p>
              <h3 className="mt-1 text-lg font-semibold">Pacotes copiaveis</h3>
              <p className="mt-2 text-sm text-slate-500">Google Sheets, Google Agenda, Etus, briefing de editor, stories e backup local.</p>
            </div>
            <Link href="/exports" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir exports</Link>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.exports.filter((pkg) => pkg.userFacing).slice(0, 3).map((pkg) => <ExportPreview key={pkg.id} pkg={pkg} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
