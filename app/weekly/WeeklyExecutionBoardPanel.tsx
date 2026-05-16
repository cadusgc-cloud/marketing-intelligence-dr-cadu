import Link from "next/link";
import type {
  WeeklyExecutionBoard,
  WeeklyExecutionLane,
  WeeklyExecutionLaneId,
  WeeklyExecutionRiskLevel,
  WeeklyExecutionTask,
  WeeklyExecutionTaskStatus
} from "@/lib/weeklyExecutionBoard";
import type {
  WeeklyPriorityLeverAction,
  WeeklyPriorityLeverArea,
  WeeklyPriorityLeverPriority
} from "@/lib/weeklyCommandResult";

const laneToneClasses: Record<WeeklyExecutionLaneId, string> = {
  today: "bg-red-50 text-red-700",
  this_week: "bg-amber-50 text-amber",
  next_week: "bg-cyan-50 text-ocean",
  monthly_review: "bg-slate-100 text-slate-700"
};

const statusClasses: Record<WeeklyExecutionTaskStatus, string> = {
  planned: "bg-cyan-50 text-ocean",
  needs_review: "bg-amber-50 text-amber",
  ready: "bg-green-50 text-leaf",
  blocked: "bg-red-50 text-red-700"
};

const riskClasses: Record<WeeklyExecutionRiskLevel, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

const priorityClasses: Record<WeeklyPriorityLeverPriority, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber",
  low: "bg-slate-100 text-slate-700"
};

type WeeklyExecutionBoardPanelProps = {
  board: WeeklyExecutionBoard;
  compact?: boolean;
};

export function WeeklyExecutionBoardPanel({ board, compact = false }: WeeklyExecutionBoardPanelProps) {
  const visibleLanes = compact
    ? board.lanes.map((lane) => ({ ...lane, tasks: lane.tasks.slice(0, 2) }))
    : board.lanes;
  const hasHiddenTasks = compact && board.lanes.some((lane, index) => lane.tasks.length > visibleLanes[index].tasks.length);

  return (
    <section className="panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-ocean">Execucao interna</p>
          <h3 className="mt-1 text-lg font-semibold">Board de Execucao Semanal</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{board.summary.summary}</p>
          <p className="mt-1 text-xs text-slate-500">{board.weekLabel} - {board.generatedAtLabel}</p>
        </div>
        {compact ? (
          <Link
            href={`/weekly/execution?week=${board.sourceReportId}`}
            className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Abrir board completo
          </Link>
        ) : (
          <Link href={`/weekly?week=${board.sourceReportId}`} className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Voltar ao Weekly Command Center
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BoardMetric label="Tarefas" value={board.summary.totalTasks} />
        <BoardMetric label="Alta prioridade" value={board.summary.highPriorityTasks} />
        <BoardMetric label="Bloqueadas" value={board.summary.blockedTasks} />
        <BoardMetric label="Prontas" value={board.summary.readyTasks} />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {board.summary.warnings.map((warning) => (
          <p key={warning} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {warning}
          </p>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {visibleLanes.map((lane) => (
          <ExecutionLaneCard key={lane.id} lane={lane} compact={compact} />
        ))}
      </div>

      {hasHiddenTasks ? (
        <p className="mt-4 rounded-md bg-cyan-50 p-3 text-sm text-ocean">
          O resumo mostra as tarefas mais importantes por faixa. Abra o board completo para ver agenda, diario de decisoes e todos os criterios de aceite.
        </p>
      ) : null}

      {!compact ? (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 p-4">
              <SectionTitle eyebrow="Reuniao de revisao" title="Agenda sugerida" />
              <div className="mt-4 space-y-3">
                {board.agenda.map((item) => (
                  <article key={item.id} className="rounded-md bg-slate-50 p-3">
                    <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">{item.prompt}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">Saida esperada: {item.expectedOutput}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <SectionTitle eyebrow="Diario de decisoes" title="Perguntas para registrar" />
              <div className="mt-4 space-y-3">
                {board.decisionLog.map((item) => (
                  <article key={item.id} className="rounded-md bg-slate-50 p-3">
                    <h4 className="text-sm font-semibold text-slate-800">{item.question}</h4>
                    <p className="mt-2 text-xs text-slate-500">Opcoes: {item.options.join(" / ")}</p>
                    <p className="mt-2 text-sm text-slate-600">Recomendacao padrao: {item.defaultRecommendation}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-slate-200 p-4">
            <SectionTitle eyebrow="Governanca" title="Regras operacionais do board" />
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {board.operatingRules.map((rule) => (
                <p key={rule} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  {rule}
                </p>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

function ExecutionLaneCard({ lane, compact }: { lane: WeeklyExecutionLane; compact: boolean }) {
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${laneToneClasses[lane.id]}`}>{lane.title}</span>
        <span className="badge bg-slate-100 text-slate-700">{lane.tasks.length} tarefa(s)</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{lane.description}</p>

      {lane.tasks.length ? (
        <div className="mt-4 space-y-3">
          {lane.tasks.map((task) => (
            <ExecutionTaskCard key={task.id} task={task} compact={compact} />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-500">
          Nenhuma tarefa nesta faixa. Mantenha a revisao manual e aguarde sinal suficiente.
        </p>
      )}
    </section>
  );
}

function ExecutionTaskCard({ task, compact }: { task: WeeklyExecutionTask; compact: boolean }) {
  const checklist = compact ? task.checklist.slice(0, 3) : task.checklist;
  const acceptanceCriteria = compact ? task.acceptanceCriteria.slice(0, 2) : task.acceptanceCriteria;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-slate-100 text-slate-700">#{task.rank}</span>
        <span className={`badge ${priorityClasses[task.priority]}`}>{priorityLabel(task.priority)}</span>
        <span className="badge bg-slate-100 text-slate-700">{actionLabel(task.action)}</span>
        <span className="badge bg-slate-100 text-slate-700">{areaLabel(task.area)}</span>
        <span className={`badge ${statusClasses[task.status]}`}>{statusLabel(task.status)}</span>
        <span className={`badge ${riskClasses[task.riskLevel]}`}>Risco {riskLabel(task.riskLevel)}</span>
      </div>

      <h4 className="mt-3 text-base font-semibold text-slate-900">{task.title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{task.objective}</p>

      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p><span className="font-semibold">Responsavel sugerido:</span> {task.ownerSuggestion}</p>
        <p><span className="font-semibold">Janela:</span> {task.actionWindow}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TaskList title="Checklist" items={checklist} />
        <TaskList title="Criterios de aceite" items={acceptanceCriteria} />
      </div>

      {!compact ? (
        <div className="mt-4">
          <h5 className="text-sm font-semibold text-slate-800">Evidencias agregadas</h5>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            {task.evidence.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{task.guardrail}</p>
    </article>
  );
}

function BoardMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function TaskList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <h5 className="text-sm font-semibold text-slate-800">{title}</h5>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ocean">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
    </div>
  );
}

function actionLabel(action: WeeklyPriorityLeverAction): string {
  return {
    repeat: "Repetir",
    adjust: "Ajustar",
    pause: "Pausar",
    test: "Testar"
  }[action];
}

function areaLabel(area: WeeklyPriorityLeverArea): string {
  return {
    meta: "Meta",
    google: "Google",
    instagram: "Instagram",
    content: "Conteudo",
    commercial: "Comercial",
    tracking: "Tracking",
    team: "Team Audit"
  }[area];
}

function priorityLabel(priority: WeeklyPriorityLeverPriority): string {
  return {
    high: "Alta",
    medium: "Media",
    low: "Baixa"
  }[priority];
}

function statusLabel(status: WeeklyExecutionTaskStatus): string {
  return {
    planned: "Planejada",
    needs_review: "Revisao",
    ready: "Pronta",
    blocked: "Bloqueada"
  }[status];
}

function riskLabel(risk: WeeklyExecutionRiskLevel): string {
  return {
    low: "baixo",
    medium: "medio",
    high: "alto"
  }[risk];
}
