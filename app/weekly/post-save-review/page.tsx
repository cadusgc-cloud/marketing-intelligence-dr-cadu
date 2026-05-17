import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { WeeklyPostSaveReviewCopyButton } from "@/app/weekly/WeeklyPostSaveReviewCopyButton";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { buildWeeklyCommandResult } from "@/lib/weeklyCommandResult";
import { buildWeeklyPostSaveReview } from "@/lib/weeklyPostSaveReview";
import { buildWeeklyStrategicDecisionReport } from "@/lib/weeklyStrategicDecision";
import {
  getLatestWeeklyMarketingData,
  getPreviousValidWeeklyMarketingData,
  getWeeklyMarketingDataById
} from "@/lib/weeklyMarketingWeeks";

export const dynamic = "force-dynamic";

type WeeklyPostSaveReviewPacketPageProps = {
  searchParams?: {
    week?: string;
  };
};

export default async function WeeklyPostSaveReviewPacketPage({ searchParams }: WeeklyPostSaveReviewPacketPageProps) {
  const selectedWeekId = searchParams?.week ?? "";
  const [selectedWeek, latestWeek] = await Promise.all([
    selectedWeekId ? getWeeklyMarketingDataById(selectedWeekId) : Promise.resolve(null),
    getLatestWeeklyMarketingData()
  ]);
  const activeWeek = selectedWeek ?? latestWeek;

  if (!activeWeek) {
    return (
      <EmptyState
        title="Nenhuma semana salva ainda."
        description="Salve dados agregados antes de montar o pacote pos-salvamento."
        href="/data"
        actionLabel="Preencher dados semanais"
      />
    );
  }

  const center = buildWeeklyCommandCenter(activeWeek);
  const previousValidWeeks = await getPreviousValidWeeklyMarketingData(activeWeek, 4);
  const previousWeek = previousValidWeeks[0] ?? null;
  const strategicReport = buildWeeklyStrategicDecisionReport(activeWeek, previousWeek);
  const resultReport = buildWeeklyCommandResult(activeWeek, previousWeek, center, strategicReport, previousValidWeeks);
  const review = buildWeeklyPostSaveReview(activeWeek, previousWeek, resultReport);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Weekly Command Center</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Pacote pos-salvamento</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Artefato interno para copiar a revisao compacta, registrar o primeiro passo e abrir os modulos certos depois que a semana foi salva.
            </p>
            {selectedWeekId && !selectedWeek ? (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
                A semana solicitada nao foi encontrada. O pacote abriu a semana mais recente salva.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <WeeklyPostSaveReviewCopyButton copyText={review.copyMarkdown} label="Copiar revisao" />
            <Link href={`/weekly?week=${activeWeek.id}`} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Voltar para /weekly
            </Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Resumo copiavel</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">{review.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{review.summary}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Status do pacote</p>
            <p className="mt-2 text-sm text-slate-600">{review.statusLabel}</p>
            <p className="mt-1 text-sm text-slate-600">Confianca {review.confidence}: {review.confidenceScore}/100</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="panel">
          <SectionTitle eyebrow="Primeiro passo" title={review.firstAction.title} />
          <p className="mt-3 text-sm leading-6 text-slate-600">{review.firstAction.detail}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p><span className="font-semibold">Responsavel sugerido:</span> {review.firstAction.ownerSuggestion}</p>
            <p><span className="font-semibold">Janela:</span> {review.firstAction.actionWindow}</p>
          </div>
          <Link href={review.firstAction.targetHref} className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Abrir {review.firstAction.targetLabel}
          </Link>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Snapshot" title="Dados salvos que sustentam a leitura" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {review.savedSnapshot.map((item) => (
              <article key={item.label} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Checklist" title="Revisao compacta para registrar" description="Use estes itens como trilha manual; nada aqui envia mensagem ou altera campanha." />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {review.reviewItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 p-4">
              <span className="badge bg-slate-100 text-slate-700">{item.status}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{item.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <SectionTitle eyebrow="Abrir modulos" title="Continuar a revisao" />
          <div className="mt-4 grid gap-2">
            {review.nextOpenLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                {link.label}
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{link.purpose}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Guardrails" title="Limites fixos" />
          <div className="mt-4 grid gap-2">
            {review.guardrails.map((guardrail) => (
              <p key={guardrail} className="rounded-md bg-cyan-50 p-3 text-sm leading-6 text-ocean">
                {guardrail}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ocean">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
