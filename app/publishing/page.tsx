import Link from "next/link";
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
import {
  generatePublishingExportBundle,
  getBlockedExportPackages,
  getExportInstructionsByChannel,
  getPackagesNeedingReview,
  getReadyExportPackages,
  summarizePublishingExports,
  type PublishingExportStatus
} from "@/lib/publishingExport";

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

const exportStatusClasses: Record<PublishingExportStatus, string> = {
  ready: "bg-green-50 text-leaf",
  needs_review: "bg-amber-50 text-amber",
  blocked: "bg-red-50 text-red-700"
};

const exportStatusLabels: Record<PublishingExportStatus, string> = {
  ready: "Pronto",
  needs_review: "Precisa revisão",
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

export default function PublishingHubPage() {
  const items = PUBLISHING_ITEMS;
  const summary = summarizePublishingHub(items);
  const readyForApproval = getItemsReadyForApproval(items);
  const readyToSchedule = getItemsReadyToSchedule(items);
  const blockedItems = getBlockedItems(items);
  const nextQueue = getNextPublishingQueue(items);
  const warnings = getPublishingWarnings();
  const exportPackages = generatePublishingExportBundle(items);
  const exportSummary = summarizePublishingExports(exportPackages);
  const readyExports = getReadyExportPackages(exportPackages);
  const reviewExports = getPackagesNeedingReview(exportPackages);
  const blockedExports = getBlockedExportPackages(exportPackages);

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

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Stories e distribuição futura</p>
            <h3 className="mt-1 text-lg font-semibold">Planos de stories podem alimentar a Central de Publicação</h3>
            <p className="mt-2 text-sm text-slate-600">
              A sequência semanal ainda é manual e simulada, mas já organiza textos, stickers, CTAs, revisões e pacote copy-ready para publicação manual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/stories" className="w-fit rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Ver Planejador de Stories
            </Link>
            <Link href="/stories/export" className="w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
              Exportar semana
            </Link>
          </div>
        </div>
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
        <p className="text-sm font-medium text-ocean">Pacote de exportação</p>
        <h3 className="mt-1 text-lg font-semibold">Pacote de exportação</h3>
        <p className="mt-2 text-sm text-slate-500">Textos e payloads simulados para copiar e usar manualmente nas plataformas.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nenhum conteúdo é publicado automaticamente nesta fase. Esta tela apenas organiza textos, payloads e briefings para revisão e uso manual.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MetricCard label="Pacotes gerados" value={exportSummary.totalPackages} />
          <MetricCard label="Prontos" value={exportSummary.readyPackages} />
          <MetricCard label="Precisam revisão" value={exportSummary.packagesNeedingReview} />
          <MetricCard label="Bloqueados" value={exportSummary.blockedPackages} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {["Instagram Reels", "Instagram Stories", "Facebook", "YouTube Shorts", "TikTok", "Artigo do site", "Página do site"].map((platform) => (
            <div key={platform} className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">{platform}</p>
              <p className="mt-1 text-sm text-slate-600">{exportSummary.packagesByChannel[platform] ?? 0} pacote(s)</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Pacotes prontos</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {readyExports.slice(0, 5).map((pkg) => (
                <li key={pkg.id}>- {pkg.title} ({pkg.platformName})</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Precisam revisão</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {reviewExports.slice(0, 5).map((pkg) => (
                <li key={pkg.id}>- {pkg.title} ({pkg.platformName})</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Bloqueados</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {blockedExports.slice(0, 5).map((pkg) => (
                <li key={pkg.id}>- {pkg.title} ({pkg.platformName})</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {exportPackages.slice(0, 6).map((pkg) => (
            <article key={pkg.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{pkg.platformName}</span>
                <span className={`badge ${exportStatusClasses[pkg.status]}`}>{exportStatusLabels[pkg.status]}</span>
              </div>
              <h4 className="mt-3 font-semibold">{pkg.title}</h4>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Texto pronto para copiar</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm">{pkg.copyReadyText}</pre>
              </div>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Payload JSON simulado</p>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(pkg.jsonPayload, null, 2)}</pre>
              </div>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Briefing Markdown</p>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm">{pkg.markdownBrief}</pre>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">Alertas</p>
                  <ul className="mt-2 space-y-1">
                    {[...pkg.ethicalWarnings, ...pkg.platformWarnings].slice(0, 5).map((warning) => (
                      <li key={warning}>- {warning}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">Instruções manuais</p>
                  <ul className="mt-2 space-y-1">
                    {getExportInstructionsByChannel(pkg.channel).map((instruction) => (
                      <li key={instruction}>- {instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
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
