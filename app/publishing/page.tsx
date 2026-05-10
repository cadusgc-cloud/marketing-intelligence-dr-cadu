import {
  PUBLISHING_ITEMS,
  approvalStatusLabel,
  channelLabel,
  funnelStageLabel,
  getBlockedItems,
  getItemsReadyForApproval,
  getItemsReadyToSchedule,
  getNextPublishingQueue,
  getPublishingWarnings,
  publishingStatusLabel,
  summarizePublishingHub,
  validateEthicalChecklist,
  type ApprovalStatus,
  type PublishingChannel,
  type PublishingStatus
} from "@/lib/publishingHub";

const channelGroups: { title: string; channels: PublishingChannel[] }[] = [
  { title: "Instagram/Reels/Stories", channels: ["meta_instagram_feed", "meta_instagram_reels", "meta_instagram_stories"] },
  { title: "Facebook", channels: ["facebook_page"] },
  { title: "YouTube/Shorts", channels: ["youtube_shorts", "youtube_video"] },
  { title: "TikTok", channels: ["tiktok"] },
  { title: "Site", channels: ["website_article", "website_page"] }
];

const statusClasses: Record<PublishingStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-50 text-amber",
  approved: "bg-cyan-50 text-ocean",
  ready_to_schedule: "bg-green-50 text-leaf",
  scheduled: "bg-indigo-50 text-indigo-700",
  published: "bg-slate-100 text-slate-700",
  blocked: "bg-red-50 text-red-700",
  error: "bg-red-50 text-red-700"
};

const approvalClasses: Record<ApprovalStatus, string> = {
  not_reviewed: "bg-slate-100 text-slate-700",
  needs_adjustment: "bg-amber-50 text-amber",
  approved_by_cadu: "bg-green-50 text-leaf",
  blocked_by_ethics: "bg-red-50 text-red-700"
};

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function PublishingHubPage() {
  const items = PUBLISHING_ITEMS;
  const summary = summarizePublishingHub(items);
  const readyForApproval = getItemsReadyForApproval(items);
  const readyToSchedule = getItemsReadyToSchedule(items);
  const blockedItems = getBlockedItems(items);
  const nextQueue = getNextPublishingQueue(items);
  const warnings = getPublishingWarnings();

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Central de publicação</p>
        <h2 className="mt-1 text-2xl font-semibold">Central de Publicação</h2>
        <p className="mt-2 text-sm text-slate-500">Preparação, aprovação e distribuição de conteúdos para Meta, YouTube, TikTok e site.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, a Central de Publicação apenas prepara e organiza os conteúdos. Nenhuma publicação real é enviada para Meta, YouTube, TikTok ou site.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Conteúdos na fila" value={summary.totalItems} />
        <MetricCard label="Prontos para aprovação" value={summary.readyForApproval} />
        <MetricCard label="Aprovados pelo Dr. Cadu" value={summary.approvedByCadu} />
        <MetricCard label="Prontos para agendamento" value={summary.readyToSchedule} />
        <MetricCard label="Bloqueados por checklist" value={summary.blockedByChecklist} />
        <MetricCard label="Publicados simulados" value={summary.simulatedPublished} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Resumo executivo da fila</h3>
          <p className="mt-2 text-sm text-slate-600">
            A fila tem {summary.totalItems} conteúdos simulados distribuídos entre Instagram, Facebook, YouTube, TikTok e site. Há {summary.readyToSchedule} item(ns)
            prontos para agendamento simulado e {summary.blockedByChecklist} item(ns) bloqueados ou exigindo revisão ética antes de qualquer publicação.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {channelGroups.map((group) => (
              <div key={group.title} className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">{group.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {items.filter((item) => group.channels.includes(item.channel)).length} item(ns)
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Fluxo futuro</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. Planejar conteúdo</li>
            <li>2. Revisar texto</li>
            <li>3. Aprovar</li>
            <li>4. Gerar payload</li>
            <li>5. Agendar</li>
            <li>6. Publicar</li>
            <li>7. Registrar resultado</li>
          </ol>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Próximas publicações sugeridas</h3>
          <div className="mt-4 space-y-3">
            {nextQueue.map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1">{channelLabel(item.channel)} - {item.suggestedDate} às {item.suggestedTime}</p>
                <p className="mt-1">{item.cta}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Itens bloqueados ou que precisam de revisão</h3>
          <div className="mt-4 space-y-3">
            {blockedItems.concat(readyForApproval).slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1">{approvalStatusLabel(item.approvalStatus)} - {publishingStatusLabel(item.publishingStatus)}</p>
                <p className="mt-1">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Fila de publicação</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const ethics = validateEthicalChecklist(item);
            return (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{channelLabel(item.channel)}</span>
                  <span className={`badge ${statusClasses[item.publishingStatus]}`}>{publishingStatusLabel(item.publishingStatus)}</span>
                  <span className={`badge ${approvalClasses[item.approvalStatus]}`}>{approvalStatusLabel(item.approvalStatus)}</span>
                  <span className="badge bg-slate-100 text-slate-700">{funnelStageLabel(item.funnelStage)}</span>
                  <span className="badge bg-slate-100 text-slate-700">{item.pillar}</span>
                </div>
                <h4 className="mt-3 font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-semibold text-ink">Checklist ético</p>
                    <p className="mt-1">Status recomendado: {publishingStatusLabel(ethics.recommendedStatus)}</p>
                    <p className="mt-1">{ethics.valid ? "Checklist crítico completo." : `${ethics.missing.length} ponto(s) pendente(s).`}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-semibold text-ink">Payload simulado</p>
                    <p className="mt-1">Destino: {item.platformPayload.destination}</p>
                    <p className="mt-1">Agendamento: {item.platformPayload.scheduledAt}</p>
                    <p className="mt-1">Mídia: {item.platformPayload.mediaType}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p><span className="font-semibold">Título:</span> {item.titleForPlatform}</p>
                  <p className="mt-1"><span className="font-semibold">Legenda:</span> {item.caption}</p>
                  <p className="mt-1"><span className="font-semibold">CTA:</span> {item.cta}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">O que ainda não está automatizado</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Canais por plataforma</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            {Object.entries(summary.byPlatform).map(([platform, total]) => (
              <div key={platform} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span>{platform}</span>
                <span className="font-semibold">{total}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Itens prontos para agendamento simulado</h3>
        <p className="mt-2 text-sm text-slate-600">
          {readyToSchedule.length} conteúdo(s) passaram pela aprovação e pelo checklist crítico. Eles ainda não serão enviados a nenhuma plataforma nesta fase.
        </p>
      </section>
    </div>
  );
}
