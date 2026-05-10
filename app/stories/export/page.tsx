import Link from "next/link";
import {
  buildStoryWeekExportPackage,
  filterStoryExportSlotsByDay,
  getStoryExportBlockedItems,
  getStoryExportDaysNeedingReview,
  getStoryExportEthicalItems,
  getStoryExportReadyDays,
  getStoryExportWarnings,
  storyExportStatusLabel,
  summarizeStoryWeekExport,
  type StoryExportStatus
} from "@/lib/storyWeekExport";
import { storySlotTypeLabel, storyWeekThemeLabel } from "@/lib/storyWeekBuilder";
import type { PatientPrivacyRisk } from "@/lib/mediaLibrary";

const statusClasses: Record<StoryExportStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-50 text-amber",
  approved: "bg-green-50 text-leaf",
  ready_for_manual_publish: "bg-green-50 text-leaf",
  exported: "bg-slate-100 text-slate-700",
  blocked: "bg-red-50 text-red-700"
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

export default function StoryWeekExportPage() {
  const pkg = buildStoryWeekExportPackage();
  const summary = summarizeStoryWeekExport(pkg);
  const warnings = getStoryExportWarnings(pkg);
  const readyDays = getStoryExportReadyDays(pkg);
  const reviewDays = getStoryExportDaysNeedingReview(pkg);
  const ethicalItems = getStoryExportEthicalItems(pkg);
  const blockedItems = getStoryExportBlockedItems(pkg);
  const firstDay = pkg.dayPackages[0];

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Exportação da Semana de Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Pacote operacional para revisar, aprovar e publicar manualmente os stories da semana.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, a exportação é apenas textual e operacional. Nenhum story é publicado automaticamente.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Stories" value={summary.totalStories} />
        <MetricCard label="Dias prontos" value={summary.readyDays} />
        <MetricCard label="Dias em revisão" value={summary.daysNeedingReview} />
        <MetricCard label="Alertas éticos" value={summary.ethicalWarningItems} />
        <MetricCard label="CTAs leves" value={summary.lightCtas} />
        <MetricCard label="CTAs diretos" value={summary.directCtas} />
        <div className="metric-card">
          <p className="text-sm text-slate-500">Status geral</p>
          <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-sm font-semibold ${statusClasses[pkg.status]}`}>
            {storyExportStatusLabel(pkg.status)}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Pacote geral da semana</h3>
          <p className="mt-2 text-sm text-slate-600">
            O pacote reúne {pkg.totalStories} stories em {pkg.dayPackages.length} dias, com texto copy-ready, briefing Markdown, checklist operacional e alertas para revisão manual.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Dias prontos</p>
              <p className="mt-1">{readyDays.length > 0 ? readyDays.map((day) => day.dayLabel).join(", ") : "Nenhum dia liberado sem revisão."}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Dias em revisão</p>
              <p className="mt-1">{reviewDays.map((day) => day.dayLabel).join(", ") || "Nenhum"}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Bloqueados</p>
              <p className="mt-1">{blockedItems.length} story/stories até aprovação manual.</p>
            </div>
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Links contextuais</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/stories" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Voltar ao planejador</Link>
            <Link href="/media/import" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Catalogar acervo</Link>
            <Link href="/media" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Biblioteca de mídias</Link>
            <Link href="/publishing" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central de Publicação</Link>
            <Link href="/weekly" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central Semanal</Link>
            <Link href="/data" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Dados semanais</Link>
          </div>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Pacotes por dia</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pkg.dayPackages.map((day) => (
            <article key={day.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{day.dayLabel}</span>
                <span className={`badge ${statusClasses[day.status]}`}>{storyExportStatusLabel(day.status)}</span>
              </div>
              <h4 className="mt-3 font-semibold">{storyWeekThemeLabel(day.theme)}</h4>
              <p className="mt-2 text-sm text-slate-600">{day.totalStories} stories · {day.ethicalWarnings.length} alerta(s)</p>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Copiar manualmente</p>
                <p className="mt-1 line-clamp-4 whitespace-pre-line">{day.copyReadySequence.split("\n").slice(0, 5).join("\n")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Sequência detalhada</h3>
        <div className="mt-4 space-y-5">
          {pkg.dayPackages.map((day) => (
            <div key={day.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div>
                  <h4 className="font-semibold">{day.dayLabel} · {storyWeekThemeLabel(day.theme)}</h4>
                  <p className="mt-1 text-sm text-slate-600">{day.objective}</p>
                </div>
                <span className={`badge ${statusClasses[day.status]}`}>{storyExportStatusLabel(day.status)}</span>
              </div>
              <div className="mt-4 space-y-2">
                {filterStoryExportSlotsByDay(pkg.dayPackages.flatMap((item) => item.slots), day.dayLabel).map((slot) => (
                  <article key={slot.id} className="rounded-md bg-slate-50 p-3">
                    <div className="grid gap-3 lg:grid-cols-[80px_180px_1fr_1fr_160px]">
                      <span className="badge h-fit w-fit bg-white text-slate-700">Story {slot.order}</span>
                      <div>
                        <p className="text-sm font-semibold">{storySlotTypeLabel(slot.slotType)}</p>
                        <p className="mt-1 text-xs text-slate-500">{slot.funnelStage} · {slot.pillar}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Arquivo</p>
                        <p className="mt-1 break-words text-sm text-slate-700">{slot.suggestedFilename || "Definir manualmente"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Texto, sticker e CTA</p>
                        <p className="mt-1 text-sm text-slate-700">{slot.suggestedText}</p>
                        <p className="mt-1 text-xs text-slate-500">Sticker: {slot.stickerSuggestion}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-600">CTA: {slot.cta}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${statusClasses[slot.status]}`}>{storyExportStatusLabel(slot.status)}</span>
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
          <h3 className="text-lg font-semibold">Revisão ética</h3>
          <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber">
            Itens com paciente, resultado, depoimento ou antes/depois exigem aprovação manual antes de qualquer uso.
          </p>
          <div className="mt-4 space-y-3">
            {ethicalItems.slice(0, 10).map((slot) => (
              <div key={slot.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{slot.dayLabel} · Story {slot.order} · {slot.suggestedFilename}</p>
                <p className="mt-1">Motivo: {slot.ethicalWarnings[0] ?? "Risco operacional identificado."}</p>
                <p className="mt-1 font-semibold">Ação: revisar contexto, consentimento, privacidade e checklist ético.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Checklist operacional</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {pkg.operationalChecklist.map((item) => (
              <li key={item.id}>
                - {item.label}: {item.description}
                {item.warning ? <span className="font-semibold text-amber"> {item.warning}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Briefing Markdown diário</h3>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-600">{firstDay.markdownBrief}</pre>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Briefing Markdown semanal</h3>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-600">{pkg.fullWeekMarkdownBrief.slice(0, 3000)}</pre>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Próximos passos</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Revisar alertas éticos.</li>
            <li>- Aprovar sequência e checklist.</li>
            <li>- Copiar sequência do dia.</li>
            <li>- Publicar manualmente na ordem correta.</li>
            <li>- Registrar resultado.</li>
            <li>- Alimentar /data depois da execução.</li>
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Avisos do pacote</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
