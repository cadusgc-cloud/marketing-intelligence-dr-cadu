import Link from "next/link";
import {
  buildStoryWeekPlanFromCatalog,
  calculateStoryWeekSummary,
  getStoryWeekCtaSummary,
  getStoryWeekDayStatus,
  getStoryWeekEthicalReviewSummary,
  getStoryWeekExportSummary,
  getStoryWeekMainAttention,
  getStoryWeekNextRecommendedAction,
  getStoryWeekOperationalChecklist,
  getStoryWeekOperationalStatus,
  getStoryWeekReviewQueue,
  storySlotTypeLabel,
  storyWeekStatusLabel,
  storyWeekThemeLabel,
  type StoryWeekBuilderStatus,
  type StoryWeekOperationalStatus,
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

const operationalClasses: Record<StoryWeekOperationalStatus, string> = {
  healthy: "bg-green-50 text-leaf",
  attention: "bg-amber-50 text-amber",
  critical: "bg-red-50 text-red-700"
};

const operationalLabels: Record<StoryWeekOperationalStatus, string> = {
  healthy: "Ok",
  attention: "Atenção",
  critical: "Revisão crítica"
};

const privacyClasses: Record<PatientPrivacyRisk, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
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

export default function StoriesPage() {
  const plan = buildStoryWeekPlanFromCatalog();
  const summary = calculateStoryWeekSummary(plan);
  const operationalStatus = getStoryWeekOperationalStatus(plan);
  const mainAttention = getStoryWeekMainAttention(plan);
  const nextRecommendedAction = getStoryWeekNextRecommendedAction(plan);
  const reviewQueue = getStoryWeekReviewQueue(plan);
  const ctaSummary = getStoryWeekCtaSummary(plan);
  const ethicalSummary = getStoryWeekEthicalReviewSummary(plan);
  const exportSummary = getStoryWeekExportSummary(plan);
  const checklist = getStoryWeekOperationalChecklist(plan);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Planejador de stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Planejador de Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Semana com 70 stories planejados a partir do acervo catalogado.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Planejamento simulado: nenhum arquivo real é lido, enviado ou publicado.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Stories" value={summary.totalStories} detail="Meta semanal" />
        <MetricCard label="Média/dia" value={summary.averageStoriesPerDay} detail="Alvo: 10" />
        <MetricCard label="Dias abaixo" value={summary.daysBelowTarget.length} detail="Meta diária" />
        <MetricCard label="Em revisão" value={summary.totalNeedsReview} detail="Slots pendentes" />
        <MetricCard label="Risco ético" value={ethicalSummary.highRiskItems} detail="Revisão manual" />
        <MetricCard label="CTAs diretos" value={ctaSummary.totalDirectCtas} detail={`${ctaSummary.daysWithDirectCta.length} dias`} />
        <div className="metric-card">
          <p className="text-sm text-slate-500">Status geral</p>
          <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-sm font-semibold ${operationalClasses[operationalStatus]}`}>
            {operationalLabels[operationalStatus]}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <p className="text-sm font-medium text-ocean">Decisão operacional da semana</p>
          <h3 className="mt-1 text-lg font-semibold">Semana pronta para revisão</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Principal atenção</p>
              <p className="mt-1 text-sm text-slate-600">{mainAttention}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Próxima ação</p>
              <p className="mt-1 text-sm text-slate-600">{nextRecommendedAction}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Publicação</p>
              <p className="mt-1 text-sm text-slate-600">Não publicar automaticamente. Exportar apenas depois de aprovação manual.</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Funil</p>
              <p className="mt-1 text-sm text-slate-600">
                TOFU {summary.funnelBalance.TOFU} · MOFU {summary.funnelBalance.MOFU} · BOFU {summary.funnelBalance.BOFU}
              </p>
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
          {plan.days.map((day) => {
            const dayStatus = getStoryWeekDayStatus(day);
            const reviewCount = day.slots.filter((slot) => slot.status === "needs_review" || slot.privacyRisk === "high").length;
            const badgeLabel = dayStatus === "ready_to_export" ? "ok" : dayStatus === "blocked" ? "revisão" : "atenção";

            return (
              <article key={day.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{day.dayLabel}</span>
                  <span className={`badge ${statusClasses[dayStatus]}`}>{badgeLabel}</span>
                </div>
                <h4 className="mt-3 font-semibold">{storyWeekThemeLabel(day.theme)}</h4>
                <p className="mt-2 text-sm text-slate-600">{day.objective}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-semibold">{day.totalStories}</p>
                    <p className="text-xs text-slate-500">stories</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-semibold">{reviewCount}</p>
                    <p className="text-xs text-slate-500">revisão</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-semibold">{day.ctaCount}</p>
                    <p className="text-xs text-slate-500">CTAs</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{day.warnings[0] ?? "Sequência completa para revisão."}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Sequência diária simplificada</p>
            <h3 className="mt-1 text-lg font-semibold">10 stories por dia</h3>
            <p className="mt-2 text-sm text-slate-500">Linha rápida para revisar arquivo, texto, sticker, CTA, status e risco.</p>
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
                <span className={`badge ${statusClasses[getStoryWeekDayStatus(day)]}`}>{storyWeekStatusLabel(getStoryWeekDayStatus(day))}</span>
              </div>
              <div className="mt-4 space-y-2">
                {day.slots.map((slot) => (
                  <article key={slot.id} className="rounded-md bg-slate-50 p-3">
                    <div className="grid gap-3 lg:grid-cols-[80px_180px_1fr_1fr_160px] lg:items-start">
                      <div>
                        <span className="badge bg-white text-slate-700">Story {slot.order}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{storySlotTypeLabel(slot.slotType)}</p>
                        <p className="mt-1 text-xs text-slate-500">{slot.funnelStage} · {slot.pillar}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Arquivo</p>
                        <p className="mt-1 break-words text-sm text-slate-700">{slot.suggestedFilename || "Sem mídia definida"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Texto e CTA</p>
                        <p className="mt-1 text-sm text-slate-700">{slot.suggestedText}</p>
                        <p className="mt-1 text-xs text-slate-500">Sticker: {slot.stickerSuggestion}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-600">CTA: {slot.cta}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${statusClasses[slot.status]}`}>{storyWeekStatusLabel(slot.status)}</span>
                        <span className={`badge ${privacyClasses[slot.privacyRisk]}`}>Risco {slot.privacyRisk}</span>
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
          <p className="text-sm font-medium text-ocean">Revisão ética</p>
          <h3 className="mt-1 text-lg font-semibold">Itens que exigem aprovação manual</h3>
          <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber">
            Nenhum item de risco deve ser usado sem aprovação manual.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <MetricCard label="Paciente" value={ethicalSummary.patientMentions} />
            <MetricCard label="Resultado" value={ethicalSummary.resultMentions} />
            <MetricCard label="Antes/depois" value={ethicalSummary.beforeAfterMentions} />
            <MetricCard label="Depoimento" value={ethicalSummary.testimonialMentions} />
          </div>
          <div className="mt-4 space-y-3">
            {reviewQueue.slice(0, 8).map((slot) => (
              <div key={slot.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{slot.dayLabel} · Story {slot.order} · {slot.suggestedFilename}</p>
                <p className="mt-1">Motivo: {slot.ethicalWarnings[0] ?? "Slot em revisão operacional."}</p>
                <p className="mt-1 font-semibold">Ação: {ethicalSummary.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Rascunhos de exportação</p>
          <h3 className="mt-1 text-lg font-semibold">Copy-ready e briefing Markdown</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Dias com copy" value={exportSummary.daysWithCopyReady} />
            <MetricCard label="Dias em revisão" value={exportSummary.daysNeedingReview} />
            <MetricCard label="Warnings" value={exportSummary.warningCount} />
          </div>
          <div className="mt-4 space-y-3">
            {exportSummary.drafts.slice(0, 4).map((draft) => (
              <div key={draft.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{draft.dayLabel}</p>
                  <span className={`badge ${statusClasses[draft.status]}`}>{storyWeekStatusLabel(draft.status)}</span>
                </div>
                <p className="mt-1">{draft.totalStories} stories · copy-ready e briefing Markdown disponíveis.</p>
                <p className="mt-1 font-semibold">Próximo passo: {exportSummary.nextStep}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Checklist operacional</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {checklist.map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Alertas da semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {summary.mainWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
