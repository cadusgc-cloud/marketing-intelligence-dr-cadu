import Link from "next/link";
import {
  buildStoryWeekPlanFromCatalog,
  calculateStoryWeekSummary,
  generateStoryWeekExportDraft,
  getHighRiskStorySlots,
  getStoryWeekNextActions,
  storySlotTypeLabel,
  storyWeekStatusLabel,
  storyWeekThemeLabel,
  type StoryWeekBuilderStatus,
  type StoryWeekSlotStatus
} from "@/lib/storyWeekBuilder";
import type { PatientPrivacyRisk } from "@/lib/mediaLibrary";

const statusClasses: Record<StoryWeekBuilderStatus | StoryWeekSlotStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  planned: "bg-cyan-50 text-ocean",
  needs_review: "bg-amber-50 text-amber",
  approved: "bg-green-50 text-leaf",
  ready_to_export: "bg-green-50 text-leaf",
  ready_to_publish: "bg-green-50 text-leaf",
  exported: "bg-slate-100 text-slate-700",
  published: "bg-slate-100 text-slate-700",
  blocked: "bg-red-50 text-red-700"
};

const privacyClasses: Record<PatientPrivacyRisk, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function StoriesPage() {
  const plan = buildStoryWeekPlanFromCatalog();
  const summary = calculateStoryWeekSummary(plan);
  const exportDraft = generateStoryWeekExportDraft(plan);
  const highRiskSlots = getHighRiskStorySlots(plan.days.flatMap((day) => day.slots));
  const nextActions = getStoryWeekNextActions(plan);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Planejador de stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Planejador de Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Monte uma semana completa de stories a partir do acervo catalogado.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, o planejamento usa dados simulados e nomes de arquivos. Nenhum arquivo real é lido, enviado, analisado visualmente ou publicado.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Stories planejados" value={summary.totalStories} />
        <MetricCard label="Média por dia" value={summary.averageStoriesPerDay} />
        <MetricCard label="Dias abaixo da meta" value={summary.daysBelowTarget.length} />
        <MetricCard label="Precisam revisão" value={summary.totalNeedsReview} />
        <MetricCard label="Risco alto" value={summary.highPrivacyRiskItems} />
        <MetricCard label="CTAs diretos" value={summary.totalDirectCtas} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Resumo da semana</h3>
          <p className="mt-2 text-sm text-slate-600">
            O plano monta {summary.totalStories} stories em {summary.daysPlanned} dias, mantendo a média de {summary.averageStoriesPerDay} stories por dia. A leitura
            operacional prioriza cadência, revisão ética e presença de CTA diário antes de qualquer exportação manual.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Equilíbrio de funil</p>
              <p className="mt-1 text-sm text-slate-600">
                TOFU {summary.funnelBalance.TOFU} · MOFU {summary.funnelBalance.MOFU} · BOFU {summary.funnelBalance.BOFU}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Status operacional</p>
              <p className="mt-1 text-sm text-slate-600">{storyWeekStatusLabel(plan.status)} com revisão manual obrigatória antes de publicar.</p>
            </div>
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Links contextuais</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/media/import" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Catalogar acervo</Link>
            <Link href="/media" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Ver biblioteca de mídias</Link>
            <Link href="/publishing" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central de Publicação</Link>
            <Link href="/calendar" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Calendário editorial</Link>
            <Link href="/weekly" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central Semanal</Link>
          </div>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Visão semanal</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plan.days.map((day) => (
            <article key={day.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{day.dayLabel}</span>
                <span className={`badge ${statusClasses[day.status]}`}>{storyWeekStatusLabel(day.status)}</span>
              </div>
              <h4 className="mt-3 font-semibold">{storyWeekThemeLabel(day.theme)}</h4>
              <p className="mt-2 text-sm text-slate-600">{day.objective}</p>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p><span className="font-semibold">Stories:</span> {day.totalStories}</p>
                <p className="mt-1"><span className="font-semibold">CTAs:</span> {day.ctaCount}</p>
                <p className="mt-1"><span className="font-semibold">Avisos:</span> {day.warnings.length}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Sequência diária</p>
            <h3 className="mt-1 text-lg font-semibold">Stories por dia</h3>
            <p className="mt-2 text-sm text-slate-500">Cada dia tenta manter 10 stories com bastidor, autoridade, procedimento, prova de confiança e CTA.</p>
          </div>
          <span className="w-fit rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">70 stories na semana</span>
        </div>

        <div className="mt-5 space-y-5">
          {plan.days.map((day) => (
            <div key={day.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div>
                  <h4 className="font-semibold">{day.dayLabel} · {storyWeekThemeLabel(day.theme)}</h4>
                  <p className="mt-1 text-sm text-slate-600">{day.objective}</p>
                </div>
                <span className="badge bg-slate-100 text-slate-700">{day.totalStories} stories</span>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {day.slots.map((slot) => (
                  <article key={slot.id} className="rounded-md bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="badge bg-white text-slate-700">Story {slot.order}</span>
                      <span className="badge bg-white text-slate-700">{storySlotTypeLabel(slot.slotType)}</span>
                      <span className={`badge ${privacyClasses[slot.privacyRisk]}`}>Risco {slot.privacyRisk}</span>
                      <span className={`badge ${statusClasses[slot.status]}`}>{storyWeekStatusLabel(slot.status)}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">{slot.objective}</p>
                    <p className="mt-2 text-sm text-slate-600">{slot.suggestedText}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p><span className="font-semibold">Arquivo:</span> {slot.suggestedFilename || "Sem mídia definida"}</p>
                      <p><span className="font-semibold">Sticker:</span> {slot.stickerSuggestion}</p>
                      <p><span className="font-semibold">CTA:</span> {slot.cta}</p>
                      <p><span className="font-semibold">Funil:</span> {slot.funnelStage}</p>
                      <p><span className="font-semibold">Pilar:</span> {slot.pillar}</p>
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
          <h3 className="text-lg font-semibold">Itens que exigem revisão</h3>
          <div className="mt-4 space-y-3">
            {highRiskSlots.slice(0, 8).map((slot) => (
              <div key={slot.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{slot.dayLabel} · Story {slot.order}</p>
                <p className="mt-1">{slot.suggestedFilename}</p>
                <ul className="mt-2 space-y-1">
                  {slot.ethicalWarnings.slice(0, 3).map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Próximas ações</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {nextActions.map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Rascunho de exportação</h3>
          <p className="mt-2 text-sm text-slate-600">
            O rascunho abaixo é copy-ready para revisão manual. Ele não agenda, publica nem envia conteúdo para qualquer plataforma.
          </p>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-600">{exportDraft.copyReadyText}</pre>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Briefing Markdown</h3>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-600">{exportDraft.markdownBrief}</pre>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Alertas da semana</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {summary.mainWarnings.map((warning) => (
            <li key={warning}>- {warning}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
