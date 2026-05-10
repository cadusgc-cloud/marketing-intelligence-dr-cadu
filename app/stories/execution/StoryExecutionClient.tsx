"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildStoryWeekExportPackage } from "@/lib/storyWeekExport";
import {
  buildStoryDayExecutionBoard,
  calculateStoryExecutionProgress,
  createStoryDayExecutionBoardFromItems,
  generateStoryExecutionChecklist,
  getStoryExecutionNextActions,
  getStoryExecutionWarnings,
  storyExecutionBoardTitle,
  storyExecutionPriorityLabel,
  storyExecutionStatusLabel,
  summarizeStoryExecution,
  updateStoryExecutionNotes,
  updateStoryExecutionStatus,
  updateStoryPublishedUrl,
  type StoryDayExecutionBoard,
  type StoryExecutionItem,
  type StoryExecutionPriority,
  type StoryExecutionStatus
} from "@/lib/storyExecutionBoard";
import { storySlotTypeLabel, storyWeekThemeLabel } from "@/lib/storyWeekBuilder";
import type { PatientPrivacyRisk } from "@/lib/mediaLibrary";

const statusClasses: Record<StoryExecutionStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-50 text-amber",
  approved: "bg-cyan-50 text-ocean",
  ready_for_manual_publish: "bg-green-50 text-leaf",
  manually_published: "bg-slate-100 text-slate-700",
  skipped: "bg-slate-100 text-slate-600",
  blocked: "bg-red-50 text-red-700"
};

const priorityClasses: Record<StoryExecutionPriority, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

const privacyClasses: Record<PatientPrivacyRisk, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

const actions: Array<{ label: string; status: StoryExecutionStatus }> = [
  { label: "Em revisão", status: "needs_review" },
  { label: "Aprovado", status: "approved" },
  { label: "Pronto", status: "ready_for_manual_publish" },
  { label: "Publicado", status: "manually_published" },
  { label: "Bloquear", status: "blocked" },
  { label: "Pular", status: "skipped" }
];

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export default function StoryExecutionClient() {
  const exportPackage = useMemo(() => buildStoryWeekExportPackage(), []);
  const initialBoards = useMemo(() => exportPackage.dayPackages.map((dayPackage) => buildStoryDayExecutionBoard(dayPackage)), [exportPackage.dayPackages]);
  const [boards, setBoards] = useState<StoryDayExecutionBoard[]>(initialBoards);
  const [selectedDay, setSelectedDay] = useState(initialBoards[0]?.dayLabel ?? "Segunda-feira");
  const board = boards.find((item) => item.dayLabel === selectedDay) ?? boards[0];
  const summary = summarizeStoryExecution(board);
  const checklist = generateStoryExecutionChecklist(board);
  const warnings = getStoryExecutionWarnings(board);
  const nextActions = getStoryExecutionNextActions(board);

  function updateBoardItems(items: StoryExecutionItem[]) {
    const dayPackage = exportPackage.dayPackages.find((day) => day.dayLabel === board.dayLabel) ?? exportPackage.dayPackages[0];
    const updatedBoard = createStoryDayExecutionBoardFromItems(dayPackage, items);
    setBoards((current) => current.map((item) => (item.dayLabel === board.dayLabel ? updatedBoard : item)));
  }

  function setStatus(itemId: string, status: StoryExecutionStatus) {
    updateBoardItems(updateStoryExecutionStatus(board.items, itemId, status));
  }

  function setNotes(itemId: string, notes: string) {
    updateBoardItems(updateStoryExecutionNotes(board.items, itemId, notes));
  }

  function setUrl(itemId: string, url: string) {
    updateBoardItems(updateStoryPublishedUrl(board.items, itemId, url));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Execução Diária de Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Acompanhe story por story antes da publicação manual.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, os status são locais e simulados. Nenhuma publicação é enviada automaticamente e nada é salvo em banco.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Stories do dia" value={summary.totalStories} />
        <MetricCard label="Publicados" value={summary.manuallyPublishedCount} />
        <MetricCard label="Pendentes" value={summary.pendingCount} />
        <MetricCard label="Em revisão" value={summary.needsReviewCount} />
        <MetricCard label="Prontos" value={summary.readyCount} />
        <MetricCard label="Bloqueados" value={summary.blockedCount} />
        <MetricCard label="Progresso" value={`${summary.progressPercent}%`} detail={`${calculateStoryExecutionProgress(board.items)}% executado`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-ocean">Board diário</p>
              <h3 className="mt-1 text-lg font-semibold">{storyExecutionBoardTitle(board)}</h3>
              <p className="mt-2 text-sm text-slate-600">{board.objective}</p>
            </div>
            <span className={`badge w-fit ${statusClasses[board.status]}`}>{storyExecutionStatusLabel(board.status)}</span>
          </div>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p><span className="font-semibold">Próxima ação:</span> {board.nextAction}</p>
            <p className="mt-1"><span className="font-semibold">Atenção:</span> {board.mainWarning}</p>
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Links contextuais</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/stories/export" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Exportação da semana</Link>
            <Link href="/stories" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Planejador de Stories</Link>
            <Link href="/publishing" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central de Publicação</Link>
            <Link href="/weekly" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central Semanal</Link>
            <Link href="/data" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Dados Semanais</Link>
          </div>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Selecionar dia</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {boards.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedDay(item.dayLabel)}
              className={`rounded-lg border p-3 text-left text-sm transition hover:bg-slate-50 ${item.dayLabel === selectedDay ? "border-ocean bg-cyan-50" : "border-slate-200 bg-white"}`}
            >
              <p className="font-semibold">{item.dayLabel}</p>
              <p className="mt-1 text-slate-600">{storyWeekThemeLabel(item.theme)}</p>
              <p className="mt-2 text-xs text-slate-500">{item.manuallyPublishedCount}/{item.totalStories} publicados · {item.progressPercent}%</p>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Lista de execução</h3>
        <div className="mt-4 space-y-3">
          {board.items.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 p-4">
              <div className="grid gap-4 xl:grid-cols-[90px_180px_1fr_240px]">
                <div>
                  <span className="badge bg-slate-100 text-slate-700">Story {item.order}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{storySlotTypeLabel(item.slotType)}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.funnelStage} · {item.pillar}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`badge ${priorityClasses[item.priority]}`}>Prioridade {storyExecutionPriorityLabel(item.priority)}</span>
                    <span className={`badge ${privacyClasses[item.privacyRisk]}`}>Risco {item.privacyRisk}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Arquivo sugerido</p>
                  <p className="mt-1 break-words text-sm text-slate-700">{item.suggestedFilename || "Definir manualmente"}</p>
                  <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Texto</p>
                  <p className="mt-1 text-sm text-slate-700">{item.suggestedText}</p>
                  <p className="mt-2 text-xs text-slate-500">Sticker: {item.stickerSuggestion}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">CTA: {item.cta}</p>
                  {item.ethicalWarnings.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-xs text-amber">
                      {item.ethicalWarnings.slice(0, 3).map((warning) => (
                        <li key={warning}>- {warning}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div>
                  <span className={`badge ${statusClasses[item.executionStatus]}`}>{storyExecutionStatusLabel(item.executionStatus)}</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        onClick={() => setStatus(item.id, action.status)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 block text-xs font-semibold uppercase text-slate-500" htmlFor={`${item.id}-notes`}>
                    Observação local
                  </label>
                  <textarea
                    id={`${item.id}-notes`}
                    value={item.notes}
                    onChange={(event) => setNotes(item.id, event.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                    placeholder="Anote ajuste, pendência ou decisão manual."
                  />
                  <label className="mt-3 block text-xs font-semibold uppercase text-slate-500" htmlFor={`${item.id}-url`}>
                    URL publicada simulada
                  </label>
                  <input
                    id={`${item.id}-url`}
                    value={item.publishedUrl}
                    onChange={(event) => setUrl(item.id, event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                    placeholder="Cole o link depois da publicação manual."
                  />
                  <p className="mt-2 text-xs text-slate-500">{item.manualPublishInstruction}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Checklist do dia</h3>
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
          <h3 className="text-lg font-semibold">Próximas ações</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {nextActions.map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
          <h4 className="mt-5 font-semibold">Avisos</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
