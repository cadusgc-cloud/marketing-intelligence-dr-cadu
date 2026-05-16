import Link from "next/link";
import { EmptyState } from "@/components/ui";
import {
  WEEKLY_COMMAND_CENTER_LINKS,
  buildWeeklyCommandCenter,
  type WeeklyActionChannel,
  type WeeklyActionItem
} from "@/lib/weeklyCommandCenter";
import { channelLabel, decisionTypeLabel, severityLabel } from "@/lib/decisionSignals";
import { classificationLabel, impactLabel } from "@/lib/weeklyAudit";
import { buildWeeklyStrategicDecisionReport } from "@/lib/weeklyStrategicDecision";
import { buildWeeklyCommandResult } from "@/lib/weeklyCommandResult";
import { getLatestWeeklyMarketingData, getPreviousWeeklyMarketingData, getWeeklyMarketingDataById, getWeeklyMarketingWeekSummaries, type WeeklyMarketingWeekSummary } from "@/lib/weeklyMarketingWeeks";
import { WeeklyCommandResultScreen } from "@/app/weekly/WeeklyCommandResultScreen";
import { WeeklyStrategicDecisionPanel } from "@/app/weekly/WeeklyStrategicDecisionPanel";

export const dynamic = "force-dynamic";

const actionPriorityClasses: Record<WeeklyActionItem["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber"
};

const channelOrder: WeeklyActionChannel[] = ["meta", "google", "instagram", "content", "funnel", "budget"];

type ChannelCard = {
  channel: WeeklyActionChannel;
  status: string;
  summary: string;
  nextAction: string;
};

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

function ActionList({ title, items }: { title: string; items: WeeklyActionItem[] }) {
  return (
    <div className="panel">
      <SectionTitle eyebrow="Plano de ação" title={title} />
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${actionPriorityClasses[item.priority]}`}>{priorityLabel(item.priority)}</span>
              <span className="badge bg-slate-100 text-slate-700">{channelLabel(item.channel)}</span>
              <span className="badge bg-cyan-50 text-ocean">{decisionTypeLabel(item.decisionType)}</span>
            </div>
            <h4 className="mt-3 font-semibold">{item.title}</h4>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <p className="mt-2 text-sm text-slate-500">{item.rationale}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

type WeeklyCommandCenterPageProps = {
  searchParams?: {
    week?: string;
  };
};

export default async function WeeklyCommandCenterPage({ searchParams }: WeeklyCommandCenterPageProps) {
  const selectedWeekId = searchParams?.week ?? "";
  const [selectedWeek, latestWeek, weekSummaries] = await Promise.all([
    selectedWeekId ? getWeeklyMarketingDataById(selectedWeekId) : Promise.resolve(null),
    getLatestWeeklyMarketingData(),
    getWeeklyMarketingWeekSummaries()
  ]);
  const activeWeek = selectedWeek ?? latestWeek;

  if (!activeWeek) {
    return (
      <EmptyState
        title="Nenhuma semana salva ainda."
        description="Salve os dados agregados da semana em Dados semanais para alimentar a Central Semanal."
        href="/data"
        actionLabel="Preencher dados semanais"
      />
    );
  }

  const center = buildWeeklyCommandCenter(activeWeek);
  const previousWeek = await getPreviousWeeklyMarketingData(activeWeek);
  const strategicReport = buildWeeklyStrategicDecisionReport(activeWeek, previousWeek);
  const resultReport = buildWeeklyCommandResult(activeWeek, previousWeek, center, strategicReport);
  const criticalSignals = center.triggeredSignals.filter((signal) => signal.severity === "critical");
  const scaleSignals = center.triggeredSignals.filter((signal) => signal.decisionType === "scale");
  const googleSignals = center.triggeredSignals.filter((signal) => signal.channel === "google");
  const highlightedSignals = uniqueById([...criticalSignals, ...scaleSignals, ...googleSignals]).slice(0, 5);
  const channelCards: ChannelCard[] = [
    {
      channel: "meta",
      status: "Prioridade de escala",
      summary: center.metaSummary,
      nextAction: "Proteger BOFU eficiente e criar variações dos criativos vencedores."
    },
    {
      channel: "google",
      status: "Diagnóstico",
      summary: center.googleSummary,
      nextAction: "Auditar conversões antes de qualquer aumento de verba."
    },
    {
      channel: "instagram",
      status: "Atenção operacional",
      summary: center.instagramSummary,
      nextAction: "Retomar cadência de Stories com CTA diário para WhatsApp."
    },
    {
      channel: "content",
      status: "Rotina de produção",
      summary: center.contentSummary,
      nextAction: "Reaproveitar ideias em Stories, Reels/Shorts e TikTok."
    },
    {
      channel: "funnel",
      status: "Dados incompletos",
      summary: center.funnelSummary,
      nextAction: "Registrar consultas marcadas, comparecimentos e fechamentos."
    },
    {
      channel: "budget",
      status: "Proteção de verba",
      summary: "Orçamento deve proteger Meta Ads e evitar verba nova em canais ainda diagnósticos.",
      nextAction: "Evitar deslocar verba para Google Ads enquanto conversões estiverem zeradas."
    }
  ];

  return (
    <div className="space-y-6">
      <WeeklyCommandResultScreen report={resultReport} />

      <WeekHistorySelector weeks={weekSummaries} activeWeekId={activeWeek.id} requestedWeekMissing={Boolean(selectedWeekId && !selectedWeek)} />

      <WeeklyStrategicDecisionPanel report={strategicReport} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Sinais acionados" value={center.triggeredSignals.length} />
        <MetricCard label="Sinais críticos" value={criticalSignals.length} />
        <MetricCard label="Ações 24h" value={center.actionPlan24h.length} />
        <MetricCard label="Ações 72h" value={center.actionPlan72h.length} />
        <MetricCard label="Dados faltantes" value={center.missingData.length} />
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Leitura por área" title="Status dos canais" description="Cada card separa decisão executiva de contexto operacional." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channelOrder.map((channel) => {
            const card = channelCards.find((item) => item.channel === channel)!;
            return (
              <article key={channel} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{channelLabel(channel)}</h3>
                  <span className="badge bg-slate-100 text-slate-700">{card.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{card.summary}</p>
                <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Próxima ação:</span> {card.nextAction}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <SectionTitle eyebrow="Decisão" title="Sinais acionados mais importantes" />
          <div className="mt-4 space-y-3">
            {highlightedSignals.map((signal) => (
              <article key={signal.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{channelLabel(signal.channel)}</span>
                  <span className="badge bg-amber-50 text-amber">{severityLabel(signal.severity)}</span>
                  <span className="badge bg-cyan-50 text-ocean">{decisionTypeLabel(signal.decisionType)}</span>
                </div>
                <h4 className="mt-3 font-semibold">{signal.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{signal.nextAction}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Contexto" title="Achados da auditoria semanal" />
          <div className="mt-4 space-y-3">
            {center.auditFindings.slice(0, 5).map((finding) => (
              <article key={finding.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{channelLabel(finding.channel)}</span>
                  <span className="badge bg-cyan-50 text-ocean">{classificationLabel(finding.classification)}</span>
                  <span className="badge bg-amber-50 text-amber">Impacto {impactLabel(finding.impact)}</span>
                </div>
                <h4 className="mt-3 font-semibold">{finding.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{finding.nextAction}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ActionList title="Plano para as próximas 24h" items={center.actionPlan24h} />
        <ActionList title="Plano para as próximas 72h" items={center.actionPlan72h} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <SectionTitle eyebrow="Conteúdo" title="Conteúdos recomendados para a semana" description="Ideias priorizadas para reforçar o funil e reaproveitar formatos." />
          <div className="mt-4 grid gap-3">
            {center.recommendedContent.map((content) => (
              <article key={content.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{content.pillar}</span>
                  <span className="badge bg-cyan-50 text-ocean">{content.funnelStage}</span>
                  <span className="badge bg-green-50 text-leaf">{content.suggestedFormat}</span>
                </div>
                <h4 className="mt-3 font-semibold">{content.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{content.reason}</p>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p><span className="font-semibold">Motivo estratégico:</span> {content.relatedSignal}</p>
                  <p className="mt-2"><span className="font-semibold">CTA:</span> {content.cta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Alerta operacional" title="Dados faltantes" description="Não é erro técnico: a ausência desses dados limita a leitura do funil comercial." />
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {center.missingData.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber">
            Priorize consultas marcadas, comparecimento e fechamentos por origem antes de tirar conclusões finais sobre qualidade do funil.
          </p>
          <h3 className="mt-6 text-lg font-semibold">Abrir módulos de origem</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {WEEKLY_COMMAND_CENTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                {link.label}
              </Link>
            ))}
            <Link href="/stories/learning" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Aprender com os stories
            </Link>
            <Link href="/stories/today" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Briefing de stories de hoje
            </Link>
            <Link href="/stories/next-week" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Planejar próxima semana
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function WeekHistorySelector({
  weeks,
  activeWeekId,
  requestedWeekMissing
}: {
  weeks: WeeklyMarketingWeekSummary[];
  activeWeekId: string;
  requestedWeekMissing: boolean;
}) {
  if (!weeks.length) return null;

  return (
    <section className="panel">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <SectionTitle eyebrow="Historico" title="Semanas salvas" description="Abra uma semana anterior sem alterar os dados usados no historico." />
        <Link href="/data" className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Atualizar dados semanais
        </Link>
      </div>
      {requestedWeekMissing ? (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          A semana solicitada nao foi encontrada. A Central abriu a semana mais recente salva.
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {weeks.map((week) => {
          const active = week.id === activeWeekId;
          return (
            <Link
              key={week.id}
              href={`/weekly?week=${week.id}`}
              className={`rounded-lg border p-4 text-sm transition ${active ? "border-ocean bg-cyan-50 text-ocean" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <span className={`badge ${active ? "bg-white text-ocean" : "bg-slate-100 text-slate-700"}`}>{active ? "Semana aberta" : "Abrir semana"}</span>
              <p className="mt-3 font-semibold">{week.weekLabel}</p>
              <p className="mt-1 text-xs opacity-80">{week.startDate} a {week.endDate}</p>
              <p className="mt-2 leading-5">{week.operationalSnapshot}</p>
            </Link>
          );
        })}
      </div>
    </section>
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

function priorityLabel(priority: WeeklyActionItem["priority"]): string {
  return {
    low: "Baixa",
    medium: "Média",
    high: "Alta"
  }[priority];
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
