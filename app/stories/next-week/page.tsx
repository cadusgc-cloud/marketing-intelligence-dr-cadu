import Link from "next/link";
import {
  buildNextWeekPlanFromLearning,
  generateNextWeekCopyReadyPlan,
  generateNextWeekPlanMarkdownBrief,
  generateNextWeekPlanningChecklist,
  getNextWeekHighPriorityItems,
  getNextWeekReviewItems,
  nextWeekStoryStatusLabel,
  nextWeekThemeLabel,
  planningStrategyLabel,
  summarizeNextWeekPlan,
  type NextWeekPlanningStrategy,
  type NextWeekStoryStatus
} from "@/lib/storyNextWeekPlanner";
import { storySlotTypeLabel } from "@/lib/storyWeekBuilder";

const statusClasses: Record<NextWeekStoryStatus, string> = {
  suggested: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-50 text-amber",
  approved: "bg-green-50 text-leaf",
  ready_to_export: "bg-green-50 text-leaf",
  blocked: "bg-red-50 text-red-700"
};

const strategyClasses: Record<NextWeekPlanningStrategy, string> = {
  repeat_winners: "bg-green-50 text-leaf",
  adjust_weak_content: "bg-amber-50 text-amber",
  fill_funnel_gaps: "bg-cyan-50 text-ocean",
  improve_cta: "bg-amber-50 text-amber",
  increase_bastidores: "bg-green-50 text-leaf",
  increase_authority: "bg-cyan-50 text-ocean",
  increase_bofu: "bg-green-50 text-leaf",
  collect_more_data: "bg-slate-100 text-slate-700",
  ethical_rewrite: "bg-amber-50 text-amber"
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

export default function StoryNextWeekPage() {
  const plan = buildNextWeekPlanFromLearning();
  const summary = summarizeNextWeekPlan(plan);
  const reviewItems = getNextWeekReviewItems(plan);
  const highPriorityItems = getNextWeekHighPriorityItems(plan);
  const checklist = generateNextWeekPlanningChecklist(plan);
  const markdownBrief = generateNextWeekPlanMarkdownBrief(plan);
  const copyReady = generateNextWeekCopyReadyPlan(plan);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Próxima Semana de Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Use os aprendizados da semana para montar o próximo plano de stories.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, o plano é gerado com dados simulados e aprendizados manuais. Nenhum conteúdo é publicado automaticamente.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Stories" value={summary.totalStories} />
        <MetricCard label="Média/dia" value={summary.averageStoriesPerDay} />
        <MetricCard label="Alta prioridade" value={summary.highPriorityItems} />
        <MetricCard label="Em revisão" value={summary.reviewItems} />
        <MetricCard label="Repetir" value={summary.repeatRecommendations} />
        <MetricCard label="Ajustar" value={summary.adjustRecommendations} />
        <MetricCard label="BOFU/MOFU/TOFU" value={`${summary.bofuItems}/${summary.mofuItems}/${summary.tofuItems}`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <p className="text-sm font-medium text-ocean">Estratégia da próxima semana</p>
          <h3 className="mt-1 text-lg font-semibold">{summary.mainStrategy}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">O que repetir</p>
              <p className="mt-1">{plan.repeatedWinningThemes.join(", ") || "Repetir apenas depois de novos dados."}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">O que ajustar</p>
              <p className="mt-1">{plan.adjustedWeakThemes.join(", ") || "Ajustes concentrados em CTA e ganchos fracos."}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Onde aumentar BOFU</p>
              <p className="mt-1">{plan.funnelGapsAddressed.join(", ") || "Manter CTA direto e procedimento em todos os dias."}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Principal cuidado ético</p>
              <p className="mt-1">{reviewItems.length} item(ns) inspirados em aprendizado sensível precisam revisão humana.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {summary.nextActions.map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Links contextuais</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/stories/today" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Briefing de hoje</Link>
            <Link href="/stories/learning" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Aprendizado dos Stories</Link>
            <Link href="/stories/results" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Resultados dos Stories</Link>
            <Link href="/stories" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Planejador de Stories</Link>
            <Link href="/stories/export" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Exportar semana</Link>
            <Link href="/media/import" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Catalogar acervo</Link>
            <Link href="/weekly" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central Semanal</Link>
          </div>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Plano por dia</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plan.days.map((day) => (
            <article key={day.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{day.dayLabel}</span>
                <span className={`badge ${statusClasses[day.status]}`}>{nextWeekStoryStatusLabel(day.status)}</span>
              </div>
              <h4 className="mt-3 font-semibold">{nextWeekThemeLabel(day.theme)}</h4>
              <p className="mt-2 text-sm text-slate-600">{day.objective}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-md bg-slate-50 p-2"><p className="font-semibold">{day.totalStories}</p><p className="text-xs text-slate-500">stories</p></div>
                <div className="rounded-md bg-slate-50 p-2"><p className="font-semibold">{day.ctaCount}</p><p className="text-xs text-slate-500">CTAs</p></div>
                <div className="rounded-md bg-slate-50 p-2"><p className="font-semibold">{day.reviewCount}</p><p className="text-xs text-slate-500">revisão</p></div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{day.warnings[0] ?? "Dia completo para revisão operacional."}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Sequência de stories</h3>
        <div className="mt-4 space-y-5">
          {plan.days.map((day) => (
            <div key={day.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div>
                  <h4 className="font-semibold">{day.dayLabel} · {nextWeekThemeLabel(day.theme)}</h4>
                  <p className="mt-1 text-sm text-slate-600">{day.objective}</p>
                </div>
                <span className={`badge ${statusClasses[day.status]}`}>{nextWeekStoryStatusLabel(day.status)}</span>
              </div>
              <div className="mt-4 space-y-2">
                {day.items.map((item) => (
                  <article key={item.id} className="rounded-md bg-slate-50 p-3">
                    <div className="grid gap-3 xl:grid-cols-[80px_180px_1fr_1fr_170px]">
                      <span className="badge h-fit w-fit bg-white text-slate-700">Story {item.order}</span>
                      <div>
                        <p className="text-sm font-semibold">{storySlotTypeLabel(item.slotType)}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.funnelStage} · {item.pillar}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Texto e CTA</p>
                        <p className="mt-1 text-sm text-slate-700">{item.suggestedText}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-600">CTA: {item.suggestedCTA}</p>
                        <p className="mt-1 text-xs text-slate-500">Sticker: {item.suggestedSticker}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Motivo</p>
                        <p className="mt-1 text-sm text-slate-700">{item.reason}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.suggestedMediaHint}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${strategyClasses[item.planningStrategy]}`}>{planningStrategyLabel(item.planningStrategy)}</span>
                        <span className={`badge ${statusClasses[item.status]}`}>{nextWeekStoryStatusLabel(item.status)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Itens derivados de aprendizados</h3>
          <div className="mt-4 space-y-3">
            {highPriorityItems.slice(0, 10).map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{item.dayLabel} · Story {item.order} · {item.pillar}</p>
                <p className="mt-1">Sinais: {item.sourceSignals.join(", ") || "regra manual"}</p>
                <p className="mt-1">Uso na próxima semana: {item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Itens que precisam revisão</h3>
          <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber">
            Paciente, resultado, depoimento e antes/depois podem inspirar versão educativa, mas nunca reutilização automática.
          </p>
          <div className="mt-4 space-y-3">
            {reviewItems.slice(0, 10).map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{item.dayLabel} · Story {item.order} · {item.suggestedTitle}</p>
                <p className="mt-1">{item.ethicalWarnings[0] ?? "Revisão humana antes de exportar."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Checklist de planejamento</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {checklist.map((item) => (
              <li key={item.id}>
                - {item.label}: {item.description}
                {item.warning ? <span className="font-semibold text-amber"> {item.warning}</span> : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Alertas do plano</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {summary.mainWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Briefing Markdown</h3>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-600">{markdownBrief.slice(0, 5000)}</pre>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Copy-ready do plano</h3>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-600">{copyReady.slice(0, 5000)}</pre>
        </div>
      </section>
    </div>
  );
}
