"use client";

import { useMemo, useState } from "react";
import {
  buildCatalogingResultFromManifestText,
  catalogingConfidenceLabel,
  catalogingStatusLabel,
  filterSuggestionsByPrivacyRisk,
  filterSuggestionsByStatus,
  getDefaultMediaManifestText,
  removeEmptyManifestLines,
  type CatalogedAssetType,
  type MediaCatalogingConfidence,
  type MediaCatalogingStatus
} from "@/lib/mediaCataloging";
import { funnelStageLabel, orientationLabel, suggestedUseLabel, type PatientPrivacyRisk } from "@/lib/mediaLibrary";
import {
  buildDailyStoryPlanFromCatalog,
  buildWeeklyStoryPlanFromCatalog,
  getUnmatchedStorySlots,
  summarizeCatalogPlanning,
  type StorySlotRecommendation
} from "@/lib/storyPlanFromCatalog";

const confidenceClasses: Record<MediaCatalogingConfidence, string> = {
  low: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber",
  high: "bg-green-50 text-leaf"
};

const statusClasses: Record<MediaCatalogingStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-50 text-amber",
  ready_to_import: "bg-green-50 text-leaf",
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

function assetTypeLabel(type: CatalogedAssetType): string {
  return {
    photo: "Foto",
    video: "Video",
    carousel: "Carrossel",
    graphic: "Arte",
    document: "Documento",
    unknown: "Desconhecido"
  }[type];
}

export default function MediaManifestImportClient() {
  const defaultManifest = useMemo(() => getDefaultMediaManifestText(), []);
  const [manifestText, setManifestText] = useState(defaultManifest);
  const [result, setResult] = useState(() => buildCatalogingResultFromManifestText(defaultManifest, "simulated"));
  const [storyPlan, setStoryPlan] = useState(() => buildDailyStoryPlanFromCatalog(result.suggestions, "2026-05-11", "Segunda-feira", "Plano diário a partir do exemplo", "Manifesto simulado"));
  const currentLineCount = removeEmptyManifestLines(manifestText).length;
  const ethicalReviewItems = filterSuggestionsByPrivacyRisk(result.suggestions, "high");
  const reviewSuggestions = filterSuggestionsByStatus(result.suggestions, "needs_review");
  const readyDrafts = result.drafts.filter((draft) => draft.importStatus === "ready");
  const weeklyPlan = buildWeeklyStoryPlanFromCatalog(result.suggestions);
  const planningSummary = summarizeCatalogPlanning(result.suggestions, storyPlan, weeklyPlan);
  const unmatchedSlots = getUnmatchedStorySlots(storyPlan.slots);

  function processManifest() {
    const nextResult = buildCatalogingResultFromManifestText(manifestText, "pasted_list");
    setResult(nextResult);
    setStoryPlan(buildDailyStoryPlanFromCatalog(nextResult.suggestions, "2026-05-11", "Segunda-feira", "Plano diário a partir da lista colada", "Lista colada"));
  }

  function restoreExample() {
    setManifestText(defaultManifest);
    const nextResult = buildCatalogingResultFromManifestText(defaultManifest, "simulated");
    setResult(nextResult);
    setStoryPlan(buildDailyStoryPlanFromCatalog(nextResult.suggestions, "2026-05-11", "Segunda-feira", "Plano diário a partir do exemplo", "Manifesto simulado"));
  }

  function clearManifest() {
    setManifestText("");
    const nextResult = buildCatalogingResultFromManifestText("", "pasted_list");
    setResult(nextResult);
    setStoryPlan(buildDailyStoryPlanFromCatalog(nextResult.suggestions, "2026-05-11", "Segunda-feira", "Plano diário vazio", "Lista vazia"));
  }

  function generateStoryPlan() {
    setStoryPlan(buildDailyStoryPlanFromCatalog(result.suggestions, "2026-05-11", "Segunda-feira", "Plano diário a partir do acervo catalogado", "Catalogação atual"));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <h3 className="text-lg font-semibold">Cole a lista de arquivos</h3>
            <p className="mt-2 text-sm text-slate-600">
              A entrada abaixo aceita apenas nomes de arquivos ou caminhos textuais. O sistema processa o texto, mas não acessa o disco, não faz upload e não analisa imagens.
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold">{currentLineCount}</span> linha(s) preenchida(s)
          </div>
        </div>
        <textarea
          value={manifestText}
          onChange={(event) => setManifestText(event.target.value)}
          className="mt-4 min-h-72 w-full rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 shadow-sm focus:border-ocean focus:outline-none focus:ring-2 focus:ring-cyan-100"
          aria-label="Lista de nomes de arquivos para catalogacao"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={processManifest} className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            Processar lista
          </button>
          <button type="button" onClick={restoreExample} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Restaurar exemplo
          </button>
          <button type="button" onClick={clearManifest} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Limpar
          </button>
          <button type="button" onClick={generateStoryPlan} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Gerar plano a partir da lista
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Itens processados" value={result.summary.totalItems} />
        <MetricCard label="Imagens" value={result.summary.imageItems} />
        <MetricCard label="Videos" value={result.summary.videoItems} />
        <MetricCard label="Desconhecidos" value={result.summary.unknownItems} />
        <MetricCard label="Precisa revisao" value={result.summary.needsReview} />
        <MetricCard label="Risco privacidade" value={result.summary.privacyRiskItems} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Resumo da catalogacao</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <MetricCard label="Alta confianca" value={result.summary.highConfidence} />
            <MetricCard label="Media confianca" value={result.summary.mediumConfidence} />
            <MetricCard label="Baixa confianca" value={result.summary.lowConfidence} />
            <MetricCard label="Possiveis duplicatas" value={result.summary.duplicateCandidates} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.summary.suggestedPillars).map(([pillar, total]) => (
              <div key={pillar} className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">{pillar}</p>
                <p className="mt-1 text-sm text-slate-600">{total} sugestao(oes)</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Previa da lista</h3>
          <p className="mt-2 text-sm text-slate-500">{result.lineCount} item(ns) processado(s). Primeiras linhas:</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {result.previewLines.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Sugestoes geradas</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {result.suggestions.map((suggestion) => (
            <article key={suggestion.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{assetTypeLabel(suggestion.suggestedAssetType)}</span>
                <span className="badge bg-slate-100 text-slate-700">{orientationLabel(suggestion.suggestedOrientation)}</span>
                <span className="badge bg-slate-100 text-slate-700">{funnelStageLabel(suggestion.suggestedFunnelStage)}</span>
                <span className={`badge ${privacyClasses[suggestion.suggestedPrivacyRisk]}`}>Privacidade {suggestion.suggestedPrivacyRisk}</span>
                <span className={`badge ${confidenceClasses[suggestion.confidence]}`}>{catalogingConfidenceLabel(suggestion.confidence)}</span>
                <span className={`badge ${statusClasses[suggestion.status]}`}>{catalogingStatusLabel(suggestion.status)}</span>
              </div>
              <h4 className="mt-3 font-semibold">{suggestion.displayName}</h4>
              <p className="mt-1 text-sm text-slate-500">{suggestion.filename}</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p><span className="font-semibold">Pilar:</span> {suggestion.suggestedPillar}</p>
                <p><span className="font-semibold">Uso:</span> {suggestedUseLabel(suggestion.suggestedUse)}</p>
                <p className="md:col-span-2"><span className="font-semibold">Tema:</span> {suggestion.suggestedTheme}</p>
              </div>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Perguntas para revisao</p>
                <ul className="mt-2 space-y-1">
                  {suggestion.reviewQuestions.map((question) => (
                    <li key={question}>- {question}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Plano de stories a partir do acervo</p>
            <h3 className="mt-1 text-lg font-semibold">Plano diário sugerido de 10 stories</h3>
            <p className="mt-2 text-sm text-slate-600">
              O plano usa as sugestões catalogadas como fonte, mas não aprova automaticamente mídias com risco ético ou privacidade.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <span className="font-semibold">{planningSummary.matchedSlots}</span> slots preenchidos
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <span className="font-semibold">{planningSummary.unmatchedSlots}</span> sem mídia
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <span className="font-semibold">{weeklyPlan.averageStoriesPerDay}</span> stories/dia
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {storyPlan.slots.map((slot) => (
            <StorySlotCard key={slot.id} slot={slot} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Resumo de funil</h4>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Stories planejados no dia: {planningSummary.dailyStoriesPlanned}</p>
              <p>Stories planejados na semana: {planningSummary.weeklyStoriesPlanned}</p>
              <p>Itens com risco de privacidade: {planningSummary.privacyRiskItems}</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Slots sem mídia adequada</h4>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {unmatchedSlots.length > 0 ? unmatchedSlots.map((slot) => <li key={slot.id}>- {slotTypeLabel(slot.slotType)}</li>) : <li>- Nenhuma lacuna crítica no plano diário.</li>}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Warnings do plano</h4>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {planningSummary.mainWarnings.map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h3 className="text-lg font-semibold">Rascunhos prontos para importacao</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {readyDrafts.slice(0, 10).map((draft) => (
              <li key={draft.id}>- {draft.mediaAssetDraft.filename}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Itens que exigem revisao etica</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {ethicalReviewItems.map((suggestion) => (
              <li key={suggestion.id}>- {suggestion.filename}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Possiveis duplicatas</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {result.duplicateCandidates.map((candidate) => (
              <li key={candidate.baseName}>- {candidate.filenames.join(", ")}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Revisao manual pendente</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {reviewSuggestions.slice(0, 10).map((suggestion) => (
              <li key={suggestion.id}>- {suggestion.filename}: {suggestion.reviewQuestions[0]}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Warnings</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {result.warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function StorySlotCard({ slot }: { slot: StorySlotRecommendation }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap gap-2">
        <span className="badge bg-slate-100 text-slate-700">{slotTypeLabel(slot.slotType)}</span>
        <span className="badge bg-slate-100 text-slate-700">{funnelStageLabel(slot.funnelStage)}</span>
        <span className={`badge ${confidenceClasses[slot.confidence]}`}>{catalogingConfidenceLabel(slot.confidence)}</span>
      </div>
      <h4 className="mt-3 font-semibold">{slot.suggestedFilename || "Slot sem mídia adequada"}</h4>
      <p className="mt-2 text-sm text-slate-600">{slot.suggestedText}</p>
      <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
        <p><span className="font-semibold">Pilar:</span> {slot.pillar}</p>
        <p className="mt-1"><span className="font-semibold">Sticker:</span> {slot.suggestedSticker}</p>
        <p className="mt-1"><span className="font-semibold">CTA:</span> {slot.suggestedCTA}</p>
        <p className="mt-1"><span className="font-semibold">Motivo:</span> {slot.reason}</p>
      </div>
      {slot.warnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-amber">
          {slot.warnings.map((warning) => (
            <li key={warning}>- {warning}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function slotTypeLabel(slotType: StorySlotRecommendation["slotType"]): string {
  return {
    human_bastidor: "Bastidor humano",
    rotina_medica: "Rotina médica",
    autoridade: "Autoridade",
    duvida_frequente: "Dúvida frequente",
    quebra_de_mito: "Quebra de mito",
    prova_confianca: "Prova de confiança",
    procedimento: "Procedimento",
    maternidade_naturalidade: "Maternidade/naturalidade",
    cta_leve: "CTA leve",
    cta_direto: "CTA direto"
  }[slotType];
}
