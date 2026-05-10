"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildStoryWeekExportPackage } from "@/lib/storyWeekExport";
import { buildStoryDayExecutionBoard } from "@/lib/storyExecutionBoard";
import {
  buildStoryResultItemsFromExecutionBoard,
  filterStoryResultsByDay,
  getAvoidRepeatingItems,
  getReuseCandidates,
  getStoriesMissingResults,
  getStoryResultWarnings,
  getNextWeekRecommendationsFromResults,
  storyResultSignalLabel,
  storyResultStatusLabel,
  summarizeStoryDayResults,
  summarizeStoryWeekResults,
  updateStoryResultMetric,
  updateStoryResultNotes,
  updateStoryResultPublishedUrl,
  validateStoryResultItem,
  type StoryResultItem,
  type StoryResultMetricField,
  type StoryResultSignal,
  type StoryResultStatus
} from "@/lib/storyResults";
import { storySlotTypeLabel } from "@/lib/storyWeekBuilder";
import type { PatientPrivacyRisk } from "@/lib/mediaLibrary";

const metricFields: Array<{ field: StoryResultMetricField; label: string }> = [
  { field: "views", label: "Visualizacoes" },
  { field: "replies", label: "Respostas" },
  { field: "stickerInteractions", label: "Stickers" },
  { field: "linkClicks", label: "Cliques" },
  { field: "profileVisits", label: "Visitas perfil" },
  { field: "whatsappConversations", label: "WhatsApp" },
  { field: "saves", label: "Salvos" },
  { field: "shares", label: "Compart." }
];

const statusClasses: Record<StoryResultStatus, string> = {
  not_published: "bg-slate-100 text-slate-700",
  published: "bg-cyan-50 text-ocean",
  results_pending: "bg-amber-50 text-amber",
  results_recorded: "bg-green-50 text-leaf",
  needs_analysis: "bg-amber-50 text-amber",
  high_performance: "bg-green-50 text-leaf",
  low_performance: "bg-red-50 text-red-700"
};

const privacyClasses: Record<PatientPrivacyRisk, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

const signalClasses: Record<StoryResultSignal, string> = {
  strong_engagement: "bg-green-50 text-leaf",
  low_engagement: "bg-red-50 text-red-700",
  generated_replies: "bg-cyan-50 text-ocean",
  generated_whatsapp: "bg-green-50 text-leaf",
  good_cta: "bg-green-50 text-leaf",
  weak_cta: "bg-amber-50 text-amber",
  ethical_attention: "bg-amber-50 text-amber",
  reuse_candidate: "bg-green-50 text-leaf",
  avoid_repeating: "bg-red-50 text-red-700",
  needs_more_data: "bg-slate-100 text-slate-700"
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

function parseMetricValue(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function StoryResultsClient() {
  const exportPackage = useMemo(() => buildStoryWeekExportPackage(), []);
  const initialItems = useMemo(() => {
    return exportPackage.dayPackages.flatMap((dayPackage) => {
      const board = buildStoryDayExecutionBoard(dayPackage);
      return buildStoryResultItemsFromExecutionBoard(board);
    });
  }, [exportPackage.dayPackages]);

  const [items, setItems] = useState<StoryResultItem[]>(initialItems);
  const [selectedDay, setSelectedDay] = useState(exportPackage.dayPackages[0]?.dayLabel ?? "Segunda-feira");
  const weekSummary = summarizeStoryWeekResults(items, exportPackage.weekLabel, exportPackage.startDate, exportPackage.endDate);
  const selectedItems = filterStoryResultsByDay(items, selectedDay);
  const selectedDaySummary = summarizeStoryDayResults(items, selectedDay);
  const warnings = getStoryResultWarnings(items);
  const reuseCandidates = getReuseCandidates(items);
  const avoidItems = getAvoidRepeatingItems(items);
  const missingResults = getStoriesMissingResults(items);
  const recommendations = getNextWeekRecommendationsFromResults(items);

  function updateMetric(itemId: string, field: StoryResultMetricField, value: string) {
    setItems((current) => updateStoryResultMetric(current, itemId, field, parseMetricValue(value)));
  }

  function updateUrl(itemId: string, value: string) {
    setItems((current) => updateStoryResultPublishedUrl(current, itemId, value));
  }

  function updateNotes(itemId: string, value: string) {
    setItems((current) => updateStoryResultNotes(current, itemId, value));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Resultados dos Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Registre manualmente o desempenho dos stories publicados.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, os resultados sao manuais e simulados. Nenhum dado e buscado automaticamente do Instagram, Meta ou qualquer plataforma.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Stories" value={weekSummary.totalStories} />
        <MetricCard label="Publicados" value={weekSummary.totalPublished} />
        <MetricCard label="Registrados" value={weekSummary.totalResultsRecorded} />
        <MetricCard label="Visualizacoes" value={weekSummary.totalViews} />
        <MetricCard label="Respostas" value={weekSummary.totalReplies} />
        <MetricCard label="WhatsApp" value={weekSummary.totalWhatsappConversations} />
        <MetricCard label="Reutilizar" value={reuseCandidates.length} detail={`${avoidItems.length} evitar/revisar`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <p className="text-sm font-medium text-ocean">Visao por dia</p>
          <h3 className="mt-1 text-lg font-semibold">Resumo manual da semana</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {exportPackage.dayPackages.map((day) => {
              const daySummary = summarizeStoryDayResults(items, day.dayLabel, day.date);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDay(day.dayLabel)}
                  className={`rounded-lg border p-3 text-left text-sm transition hover:bg-slate-50 ${selectedDay === day.dayLabel ? "border-ocean bg-cyan-50" : "border-slate-200 bg-white"}`}
                >
                  <p className="font-semibold">{day.dayLabel}</p>
                  <p className="mt-1 text-slate-600">{daySummary.resultsRecorded}/{daySummary.totalStories} com resultado</p>
                  <p className="mt-2 text-xs text-slate-500">{daySummary.totalViews} views · {daySummary.totalReplies} respostas · {daySummary.totalWhatsappConversations} WhatsApps</p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{daySummary.mainLearning}</p>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Links contextuais</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/stories/execution" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Execucao diaria</Link>
            <Link href="/stories/export" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Exportacao da semana</Link>
            <Link href="/stories" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Planejador de Stories</Link>
            <Link href="/data" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Dados Semanais</Link>
            <Link href="/weekly" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central Semanal</Link>
          </div>
        </aside>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Lista de stories</p>
            <h3 className="mt-1 text-lg font-semibold">{selectedDay}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {selectedDaySummary.resultsRecorded} resultados registrados · {selectedDaySummary.totalViews} visualizacoes · {selectedDaySummary.totalWhatsappConversations} WhatsApps.
            </p>
          </div>
          <span className="w-fit rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {selectedDaySummary.nextRecommendation}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {selectedItems.map((item) => {
            const validation = validateStoryResultItem(item);
            return (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-4 xl:grid-cols-[90px_180px_1fr_320px]">
                  <div>
                    <span className="badge bg-slate-100 text-slate-700">Story {item.order}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{storySlotTypeLabel(item.slotType)}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.funnelStage} · {item.pillar}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`badge ${statusClasses[item.resultStatus]}`}>{storyResultStatusLabel(item.resultStatus)}</span>
                      <span className={`badge ${privacyClasses[item.privacyRisk]}`}>Risco {item.privacyRisk}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Arquivo sugerido</p>
                    <p className="mt-1 break-words text-sm text-slate-700">{item.suggestedFilename || "Definir manualmente"}</p>
                    <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Aprendizado</p>
                    <p className="mt-1 text-sm text-slate-700">{item.learning}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.signals.map((signal) => (
                        <span key={signal} className={`badge ${signalClasses[signal]}`}>{storyResultSignalLabel(signal)}</span>
                      ))}
                    </div>
                    {validation.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-xs text-amber">
                        {validation.slice(0, 3).map((warning) => (
                          <li key={warning}>- {warning}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500" htmlFor={`${item.id}-url`}>
                      URL publicada simulada
                    </label>
                    <input
                      id={`${item.id}-url`}
                      value={item.publishedUrl}
                      onChange={(event) => updateUrl(item.id, event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                      placeholder="Cole o link manual, se houver."
                    />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {metricFields.map(({ field, label }) => (
                        <label key={field} className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${item.id}-${field}`}>
                          {label}
                          <input
                            id={`${item.id}-${field}`}
                            type="number"
                            value={item[field] ?? ""}
                            onChange={(event) => updateMetric(item.id, field, event.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm font-normal text-ink"
                            placeholder="0"
                          />
                        </label>
                      ))}
                    </div>
                    <label className="mt-3 block text-xs font-semibold uppercase text-slate-500" htmlFor={`${item.id}-notes`}>
                      Observacao local
                    </label>
                    <textarea
                      id={`${item.id}-notes`}
                      value={item.notes}
                      onChange={(event) => updateNotes(item.id, event.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                      placeholder="Anote contexto, resposta ou melhoria para a proxima semana."
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Aprendizados da semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {weekSummary.mainLearnings.map((learning) => (
              <li key={learning}>- {learning}</li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Reutilizar" value={reuseCandidates.length} />
            <MetricCard label="Evitar/revisar" value={avoidItems.length} />
            <MetricCard label="Lacunas" value={missingResults.length} />
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Recomendacoes para a proxima semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {recommendations.map((recommendation) => (
              <li key={recommendation}>- {recommendation}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Avisos operacionais</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Proximo fechamento</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Registrar visualizacoes, respostas, cliques e WhatsApps dos stories publicados.</li>
            <li>- Separar candidatos para reutilizar em Stories, Reels ou Shorts.</li>
            <li>- Revisar stories sem metricas antes da reuniao semanal.</li>
            <li>- Alimentar /data com o consolidado manual depois da execucao.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
