import Link from "next/link";
import {
  WEEKLY_COMMAND_CENTER_LINKS,
  buildWeeklyCommandCenter,
  type WeeklyActionChannel,
  type WeeklyActionItem,
  type WeeklyOperationalStatus
} from "@/lib/weeklyCommandCenter";
import { channelLabel, decisionTypeLabel, severityLabel } from "@/lib/decisionSignals";
import { classificationLabel, impactLabel } from "@/lib/weeklyAudit";

const statusClasses: Record<WeeklyOperationalStatus, string> = {
  healthy: "bg-green-50 text-leaf",
  attention: "bg-amber-50 text-amber",
  critical: "bg-red-50 text-red-700",
  incomplete_data: "bg-slate-100 text-slate-700"
};

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

export default function WeeklyCommandCenterPage() {
  const center = buildWeeklyCommandCenter();
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
      <section className="panel">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ocean">Central Semanal</p>
              <span className={`badge ${statusClasses[center.operationalStatus]}`}>{statusLabel(center.operationalStatus)}</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">Central Semanal</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">Visão integrada dos dados, sinais, auditoria e plano de ação do marketing.</p>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Diagnóstico executivo</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{center.executiveSummary}</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm">
            <DecisionBlock label="Decisão principal" value={center.mainDecision} />
            <DecisionBlock label="Risco principal" value={center.mainRisk} />
            <DecisionBlock label="Oportunidade principal" value={center.mainOpportunity} />
          </div>
        </div>
      </section>

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

function DecisionBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function statusLabel(status: WeeklyOperationalStatus): string {
  return {
    healthy: "Saudável",
    attention: "Atenção",
    critical: "Crítico",
    incomplete_data: "Dados incompletos"
  }[status];
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
