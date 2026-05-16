import Link from "next/link";
import {
  buildStoryDailyBrief,
  storyDailyBriefStatusLabel,
  type StoryDailyBriefAction,
  type StoryDailyBriefStatus
} from "@/lib/storyDailyBrief";
import { storyExecutionPriorityLabel, storyExecutionStatusLabel, type StoryExecutionPriority } from "@/lib/storyExecutionBoard";

const statusClasses: Record<StoryDailyBriefStatus, string> = {
  ready_for_manual_execution: "bg-green-50 text-leaf",
  needs_review: "bg-amber-50 text-amber",
  blocked: "bg-red-50 text-red-700",
  limited_data: "bg-slate-100 text-slate-700"
};

const priorityClasses: Record<StoryExecutionPriority, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

type StoryTodayPageProps = {
  searchParams?: {
    date?: string;
    day?: string;
  };
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

export default function StoryTodayPage({ searchParams }: StoryTodayPageProps) {
  const brief = buildStoryDailyBrief({
    date: searchParams?.date,
    dayLabel: searchParams?.day
  });

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ocean">Stories</p>
              <span className={`badge ${statusClasses[brief.status]}`}>{storyDailyBriefStatusLabel(brief.status)}</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">Briefing de Stories de Hoje</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Roteiro operacional interno para executar manualmente a sequencia de stories, revisar riscos e registrar metricas agregadas no fim do dia.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:min-w-80">
            <p className="text-xs font-semibold uppercase text-slate-500">Dia selecionado</p>
            <p className="mt-2 font-semibold text-ink">{brief.dayLabel} - {brief.date}</p>
            <p className="mt-1">{brief.themeLabel}</p>
            <p className="mt-3 font-medium text-amber">{brief.mainWarning}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Stories" value={brief.totalStories} />
        <MetricCard label="Prontos" value={brief.readyCount} />
        <MetricCard label="Revisao" value={brief.reviewCount} />
        <MetricCard label="Bloqueados" value={brief.blockedCount} />
        <MetricCard label="CTAs" value={brief.ctaCount} detail={`${brief.directCtaCount} direto(s)`} />
        <MetricCard label="BOFU/MOFU/TOFU" value={`${brief.bofuCount}/${brief.mofuCount}/${brief.tofuCount}`} />
        <MetricCard label="Progresso" value={`${brief.progressPercent}%`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <p className="text-sm font-medium text-ocean">Objetivo do dia</p>
          <h3 className="mt-1 text-lg font-semibold">{brief.objective}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {brief.topPriorities.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
            Este briefing apoia a rotina interna. A publicacao, revisao e decisao final continuam humanas e manuais.
          </p>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Selecionar dia</h3>
          <div className="mt-3 grid gap-2 text-sm">
            {brief.availableDays.map((day) => (
              <Link
                key={day.date}
                href={day.href}
                className={`rounded-md border px-3 py-2 font-medium ${day.isSelected ? "border-ocean bg-cyan-50 text-ocean" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                {day.dayLabel} - {day.date}
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="panel">
          <h3 className="text-lg font-semibold">Fila de publicacao manual</h3>
          <p className="mt-1 text-sm text-slate-500">Itens sem alerta critico para conferencia final, copia manual e publicacao fora do sistema.</p>
          <div className="mt-4 space-y-3">
            {brief.manualPublishQueue.length > 0 ? (
              brief.manualPublishQueue.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="grid gap-4 xl:grid-cols-[90px_180px_1fr_180px]">
                    <span className="badge h-fit w-fit bg-slate-100 text-slate-700">Story {item.order}</span>
                    <div>
                      <p className="text-sm font-semibold">{item.slotTypeLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.funnelStage} - {item.pillar}</p>
                      <p className="mt-2 text-xs text-slate-500">{item.suggestedFilename}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{item.suggestedText}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-600">CTA: {item.suggestedCTA}</p>
                      <p className="mt-1 text-xs text-slate-500">Sticker: {item.stickerSuggestion}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${priorityClasses[item.priority]}`}>{storyExecutionPriorityLabel(item.priority)}</span>
                      <span className="badge bg-green-50 text-leaf">{storyExecutionStatusLabel(item.status)}</span>
                      <p className="basis-full text-xs text-slate-500">{item.reason}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">Nenhum item liberado para fila manual antes de resolver revisoes.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Revisao antes de publicar</h3>
          <p className="mt-1 text-sm text-slate-500">Fila que precisa de Cadu, marketing ou revisao humana antes de qualquer uso.</p>
          <div className="mt-4 space-y-3">
            {brief.reviewQueue.map((item) => (
              <article key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-white text-slate-700">Story {item.order}</span>
                  <span className={`badge ${priorityClasses[item.priority]}`}>{storyExecutionPriorityLabel(item.priority)}</span>
                </div>
                <p className="mt-2 font-semibold text-ink">{item.slotTypeLabel}</p>
                <p className="mt-1">{item.reason}</p>
                {item.warnings.length > 0 ? <p className="mt-2 text-xs text-amber">{item.warnings[0]}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h3 className="text-lg font-semibold">Proximas acoes</h3>
          <div className="mt-3 space-y-3">
            {brief.nextActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Metricas para registrar</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {brief.dataCaptureChecklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Guardrails</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {brief.guardrails.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Links contextuais</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {brief.sourceLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ActionCard({ action }: { action: StoryDailyBriefAction }) {
  return (
    <article className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
      <div className="flex flex-wrap gap-2">
        <span className={`badge ${priorityClasses[action.priority]}`}>{storyExecutionPriorityLabel(action.priority)}</span>
        <span className="badge bg-white text-slate-700">{action.ownerSuggestion}</span>
        <span className="badge bg-white text-slate-700">{action.actionWindow}</span>
      </div>
      <p className="mt-2 font-semibold text-ink">{action.title}</p>
      <p className="mt-1">{action.description}</p>
    </article>
  );
}
