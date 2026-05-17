import type {
  WeeklyNextCollectionPlan,
  WeeklyNextCollectionPlanStatus,
  WeeklyNextCollectionTask,
  WeeklyNextCollectionTaskCadence,
  WeeklyNextCollectionTaskPriority
} from "@/lib/weeklyNextCollectionPlan";

export function WeeklyNextCollectionPlanPanel({ plan }: { plan: WeeklyNextCollectionPlan }) {
  return (
    <div className={`mt-4 rounded-md border p-3 text-sm ${planPanelClass(plan.status)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-semibold">Plano de coleta da proxima semana</p>
          <p className="mt-1 text-sm leading-5">{plan.summary}</p>
          <p className="mt-2 text-xs text-slate-500">Semana base: {plan.weekLabel}. Plano interno, manual e baseado apenas em metricas agregadas.</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{planStatusLabel(plan.status)}</span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="rounded-md bg-white p-3 text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Tarefas priorizadas</p>
            <span className="text-xs font-semibold text-slate-500">{plan.tasks.length} tarefa(s)</span>
          </div>
          <div className="mt-3 grid gap-2">
            {plan.tasks.slice(0, 5).map((task) => (
              <WeeklyNextCollectionTaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <RoutineBlock title="Roteiro diario" items={plan.dailyRoutine} />
          <RoutineBlock title="Fechamento semanal" items={plan.weeklyCloseRoutine} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <label className="block rounded-md bg-white p-3 text-slate-700">
          <span className="text-sm font-semibold">Handoff interno copiavel</span>
          <textarea readOnly value={plan.handoffScript} rows={9} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 outline-none" />
        </label>

        <div className="rounded-md bg-white p-3 text-slate-700">
          <p className="font-semibold">Nao fazer</p>
          <ul className="mt-2 space-y-1 text-xs leading-5">
            {plan.doNotDo.slice(0, 5).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {plan.nextRoutes.map((route) => (
          <a key={route.href} href={route.href} title={route.purpose} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            {route.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function WeeklyNextCollectionTaskCard({ task }: { task: WeeklyNextCollectionTask }) {
  return (
    <article className="rounded-md border border-slate-100 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${taskPriorityClass(task.priority)}`}>{taskPriorityLabel(task.priority)}</span>
        <span className="badge bg-white text-slate-700">{taskCadenceLabel(task.cadence)}</span>
        <span className="text-xs font-semibold text-slate-500">{task.ownerSuggestion}</span>
      </div>
      <h3 className="mt-2 font-semibold text-slate-900">{task.title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{task.trigger}</p>
      <p className="mt-2 text-sm leading-5 text-slate-700">{task.action}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <TaskList title="Evidencia" items={task.evidenceToCollect} />
        <TaskList title="Aceite" items={task.acceptanceCriteria} />
      </div>
      <p className="mt-3 rounded-md bg-white p-2 text-xs leading-5 text-slate-600">{task.guardrail}</p>
    </article>
  );
}

function RoutineBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-white p-3 text-slate-700">
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 space-y-1 text-xs leading-5">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function TaskList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      <ul className="mt-1 space-y-1 text-xs leading-5 text-slate-600">
        {items.slice(0, 4).map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function planPanelClass(status: WeeklyNextCollectionPlanStatus): string {
  if (status === "ready_to_plan") return "border-green-200 bg-green-50 text-leaf";
  if (status === "blocked") return "border-red-200 bg-red-50 text-danger";
  return "border-cyan-200 bg-cyan-50 text-ocean";
}

function planStatusLabel(status: WeeklyNextCollectionPlanStatus): string {
  if (status === "ready_to_plan") return "rotina pronta";
  if (status === "blocked") return "bloqueado";
  return "coleta pendente";
}

function taskPriorityClass(priority: WeeklyNextCollectionTaskPriority): string {
  if (priority === "high") return "bg-red-50 text-red-700";
  if (priority === "medium") return "bg-amber-50 text-amber";
  return "bg-green-50 text-leaf";
}

function taskPriorityLabel(priority: WeeklyNextCollectionTaskPriority): string {
  if (priority === "high") return "alta";
  if (priority === "medium") return "media";
  return "baixa";
}

function taskCadenceLabel(cadence: WeeklyNextCollectionTaskCadence): string {
  return {
    before_week_starts: "antes da semana",
    daily: "diario",
    weekly_close: "fechamento",
    review_only: "revisao"
  }[cadence];
}
