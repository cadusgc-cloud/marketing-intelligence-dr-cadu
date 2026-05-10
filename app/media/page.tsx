import {
  MEDIA_ASSETS,
  approvalStatusLabel,
  assetTypeLabel,
  buildDailyStoryPlan,
  buildWeeklyStoryPlan,
  funnelStageLabel,
  getApprovedMediaAssets,
  getMediaLibraryWarnings,
  getStoryPlanWarnings,
  getUnusedMediaAssets,
  orientationLabel,
  storySlotTypeLabel,
  suggestedUseLabel,
  summarizeMediaLibrary,
  summarizeWeeklyStoryPlan,
  usageStatusLabel,
  type MediaApprovalStatus,
  type MediaUsageStatus,
  type PatientPrivacyRisk,
  type StorySlotStatus
} from "@/lib/mediaLibrary";

const usageClasses: Record<MediaUsageStatus, string> = {
  unused: "bg-slate-100 text-slate-700",
  planned: "bg-cyan-50 text-ocean",
  used: "bg-green-50 text-leaf",
  archived: "bg-slate-100 text-slate-600",
  blocked: "bg-red-50 text-red-700"
};

const approvalClasses: Record<MediaApprovalStatus, string> = {
  not_reviewed: "bg-slate-100 text-slate-700",
  approved: "bg-green-50 text-leaf",
  needs_adjustment: "bg-amber-50 text-amber",
  blocked: "bg-red-50 text-red-700"
};

const privacyClasses: Record<PatientPrivacyRisk, string> = {
  low: "bg-green-50 text-leaf",
  medium: "bg-amber-50 text-amber",
  high: "bg-red-50 text-red-700"
};

const slotStatusClasses: Record<StorySlotStatus, string> = {
  planned: "bg-cyan-50 text-ocean",
  needs_review: "bg-amber-50 text-amber",
  approved: "bg-green-50 text-leaf",
  published: "bg-slate-100 text-slate-700",
  blocked: "bg-red-50 text-red-700"
};

const slotStatusLabels: Record<StorySlotStatus, string> = {
  planned: "Planejado",
  needs_review: "Precisa revisão",
  approved: "Aprovado",
  published: "Publicado",
  blocked: "Bloqueado"
};

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function MediaLibraryPage() {
  const assets = MEDIA_ASSETS;
  const summary = summarizeMediaLibrary(assets);
  const dailyPlan = buildDailyStoryPlan();
  const weeklyPlan = buildWeeklyStoryPlan();
  const weeklySummary = summarizeWeeklyStoryPlan(weeklyPlan);
  const warnings = getStoryPlanWarnings(dailyPlan, weeklyPlan, assets);
  const mediaWarnings = getMediaLibraryWarnings(assets);
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Biblioteca de mídias</p>
        <h2 className="mt-1 text-2xl font-semibold">Biblioteca de Mídias</h2>
        <p className="mt-2 text-sm text-slate-500">Organização de fotos, vídeos e sequências de stories para o marketing do Dr. Cadu.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, a biblioteca usa mídias simuladas. Nenhum arquivo real é lido, enviado ou publicado.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Mídias no acervo" value={summary.totalAssets} />
        <MetricCard label="Fotos" value={summary.photos} />
        <MetricCard label="Vídeos" value={summary.videos} />
        <MetricCard label="Aprovadas" value={summary.approvedAssets} />
        <MetricCard label="Não usadas" value={summary.unusedAssets} />
        <MetricCard label="Risco alto" value={summary.highPrivacyRiskAssets} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Resumo do acervo simulado</h3>
          <p className="mt-2 text-sm text-slate-600">
            O acervo inicial tem {summary.totalAssets} mídias simuladas, com {getApprovedMediaAssets(assets).length} item(ns) aprovados e{" "}
            {getUnusedMediaAssets(assets).length} item(ns) ainda não usados. A ideia é preparar o modelo para catalogação real sem ler arquivos do sistema nesta fase.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.assetsByPillar).map(([pillar, total]) => (
              <div key={pillar} className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">{pillar}</p>
                <p className="mt-1 text-sm text-slate-600">{total} mídia(s)</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Próximos passos</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Importar acervo real em fase futura.</li>
            <li>- Catalogar fotos e vídeos por tema, pilar e risco.</li>
            <li>- Aprovar mídias antes de uso em marketing médico.</li>
            <li>- Conectar ao calendário editorial.</li>
            <li>- Exportar sequências para a Central de Publicação.</li>
          </ul>
        </aside>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Acervo simulado</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {assets.map((asset) => (
            <article key={asset.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{assetTypeLabel(asset.assetType)}</span>
                <span className="badge bg-slate-100 text-slate-700">{orientationLabel(asset.orientation)}</span>
                <span className="badge bg-slate-100 text-slate-700">{funnelStageLabel(asset.funnelStage)}</span>
                <span className={`badge ${usageClasses[asset.usageStatus]}`}>{usageStatusLabel(asset.usageStatus)}</span>
                <span className={`badge ${approvalClasses[asset.approvalStatus]}`}>{approvalStatusLabel(asset.approvalStatus)}</span>
                <span className={`badge ${privacyClasses[asset.patientPrivacyRisk]}`}>Privacidade {asset.patientPrivacyRisk}</span>
              </div>
              <h4 className="mt-3 font-semibold">{asset.displayName}</h4>
              <p className="mt-1 text-sm text-slate-500">{asset.filename}</p>
              <p className="mt-2 text-sm text-slate-600">{asset.description}</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p><span className="font-semibold">Pilar:</span> {asset.pillar}</p>
                <p><span className="font-semibold">Uso sugerido:</span> {suggestedUseLabel(asset.suggestedUse)}</p>
                <p className="md:col-span-2"><span className="font-semibold">Notas éticas:</span> {asset.ethicalNotes}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span key={tag} className="badge bg-slate-100 text-slate-600">{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Plano diário</p>
            <h3 className="mt-1 text-lg font-semibold">Plano diário de 10 stories</h3>
            <p className="mt-2 text-sm text-slate-500">{dailyPlan.theme} - {dailyPlan.objective}</p>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold">{dailyPlan.totalStories}</span> stories planejados
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {dailyPlan.slots.map((slot) => {
            const media = assetsById.get(slot.mediaAssetId);
            return (
              <article key={slot.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">Story {slot.order}</span>
                  <span className="badge bg-slate-100 text-slate-700">{storySlotTypeLabel(slot.slotType)}</span>
                  <span className="badge bg-slate-100 text-slate-700">{funnelStageLabel(slot.funnelStage)}</span>
                  <span className={`badge ${slotStatusClasses[slot.status]}`}>{slotStatusLabels[slot.status]}</span>
                </div>
                <h4 className="mt-3 font-semibold">{slot.objective}</h4>
                <p className="mt-2 text-sm text-slate-600">{slot.suggestedText}</p>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p><span className="font-semibold">Mídia sugerida:</span> {media?.filename ?? "Sem mídia sugerida"}</p>
                  <p className="mt-1"><span className="font-semibold">Sticker:</span> {slot.stickerSuggestion}</p>
                  <p className="mt-1"><span className="font-semibold">CTA:</span> {slot.cta}</p>
                  <p className="mt-1"><span className="font-semibold">Observação:</span> {slot.notes}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Plano semanal de stories</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Stories na semana" value={weeklySummary.totalStoriesPlanned} />
            <MetricCard label="Média por dia" value={weeklySummary.averageStoriesPerDay} />
            <MetricCard label="Dias abaixo da meta" value={weeklySummary.daysBelowTarget.length} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {weeklyPlan.dailyPlans.map((plan) => (
              <div key={plan.id} className="rounded-md bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{plan.dayLabel}</p>
                  <span className="badge bg-slate-100 text-slate-700">{plan.totalStories} stories</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{plan.theme}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Recomendações da semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {weeklySummary.recommendedAdjustments.map((adjustment) => (
              <li key={adjustment}>- {adjustment}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p><span className="font-semibold">Dias sem plano:</span> {weeklySummary.missingDays.length > 0 ? weeklySummary.missingDays.join(", ") : "nenhum"}</p>
            <p className="mt-1"><span className="font-semibold">Dias abaixo da meta:</span> {weeklySummary.daysBelowTarget.length > 0 ? weeklySummary.daysBelowTarget.join(", ") : "nenhum"}</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Alertas</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Avisos da biblioteca</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {mediaWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
