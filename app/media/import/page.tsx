import {
  SIMULATED_MEDIA_MANIFEST,
  catalogingConfidenceLabel,
  catalogingStatusLabel,
  createMediaImportDrafts,
  detectDuplicateFilenameCandidates,
  filterSuggestionsByPrivacyRisk,
  filterSuggestionsByStatus,
  generateMediaCatalogingSuggestions,
  getCatalogingWarnings,
  parseMediaManifestLines,
  summarizeMediaCataloging,
  type CatalogedAssetType,
  type MediaCatalogingConfidence,
  type MediaCatalogingStatus
} from "@/lib/mediaCataloging";
import { funnelStageLabel, orientationLabel, suggestedUseLabel, type PatientPrivacyRisk } from "@/lib/mediaLibrary";

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

export default function MediaCatalogingPage() {
  const manifestItems = parseMediaManifestLines(SIMULATED_MEDIA_MANIFEST);
  const suggestions = generateMediaCatalogingSuggestions(manifestItems);
  const summary = summarizeMediaCataloging(suggestions);
  const drafts = createMediaImportDrafts(suggestions);
  const ethicalReviewItems = filterSuggestionsByPrivacyRisk(suggestions, "high");
  const readyDrafts = drafts.filter((draft) => draft.importStatus === "ready");
  const reviewSuggestions = filterSuggestionsByStatus(suggestions, "needs_review");
  const duplicateCandidates = detectDuplicateFilenameCandidates(manifestItems);
  const warnings = getCatalogingWarnings();

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Catalogação do acervo</p>
        <h2 className="mt-1 text-2xl font-semibold">Catalogação do Acervo</h2>
        <p className="mt-2 text-sm text-slate-500">Transforme listas de fotos e vídeos em rascunhos organizados para a Biblioteca de Mídias.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, a catalogação usa uma lista simulada de arquivos. Nenhum arquivo real é lido, enviado ou analisado visualmente.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Itens na lista" value={summary.totalItems} />
        <MetricCard label="Imagens" value={summary.imageItems} />
        <MetricCard label="Vídeos" value={summary.videoItems} />
        <MetricCard label="Desconhecidos" value={summary.unknownItems} />
        <MetricCard label="Precisa revisão" value={summary.needsReview} />
        <MetricCard label="Risco privacidade" value={summary.privacyRiskItems} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Resumo da catalogação</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <MetricCard label="Alta confiança" value={summary.highConfidence} />
            <MetricCard label="Média confiança" value={summary.mediumConfidence} />
            <MetricCard label="Baixa confiança" value={summary.lowConfidence} />
            <MetricCard label="Possíveis duplicatas" value={summary.duplicateCandidates} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.suggestedPillars).map(([pillar, total]) => (
              <div key={pillar} className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">{pillar}</p>
                <p className="mt-1 text-sm text-slate-600">{total} sugestão(ões)</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Como usar com seu acervo real</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. Exportar a lista de arquivos da pasta.</li>
            <li>2. Colar a lista no sistema.</li>
            <li>3. Revisar sugestões de pilar, funil e uso.</li>
            <li>4. Aprovar ou ajustar manualmente.</li>
            <li>5. Transformar em itens da Biblioteca de Mídias.</li>
            <li>6. Encaixar no plano diário e semanal de stories.</li>
          </ol>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Lista de sugestões</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {suggestions.map((suggestion) => (
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
                <p className="font-semibold text-ink">Warnings</p>
                <ul className="mt-2 space-y-1">
                  {suggestion.warnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Perguntas para revisão</p>
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

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h3 className="text-lg font-semibold">Rascunhos prontos para importar</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {readyDrafts.slice(0, 8).map((draft) => (
              <li key={draft.id}>- {draft.mediaAssetDraft.filename}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Itens que exigem revisão ética</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {ethicalReviewItems.map((suggestion) => (
              <li key={suggestion.id}>- {suggestion.filename}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Possíveis duplicatas</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {duplicateCandidates.map((candidate) => (
              <li key={candidate.baseName}>- {candidate.filenames.join(", ")}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Revisão manual pendente</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {reviewSuggestions.slice(0, 10).map((suggestion) => (
              <li key={suggestion.id}>- {suggestion.filename}: {suggestion.reviewQuestions[0]}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Avisos de segurança</h3>
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
