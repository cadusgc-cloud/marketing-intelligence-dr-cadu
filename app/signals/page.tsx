import {
  DECISION_SIGNAL_INPUTS,
  DECISION_RULES,
  channelLabel,
  decisionTypeLabel,
  evaluateDecisionSignals,
  filterSignalsByChannel,
  filterSignalsByDecisionType,
  filterSignalsBySeverity,
  getCriticalSignals,
  getSignalsByChannel,
  getSignalsByDecisionType,
  getTriggeredSignals,
  severityLabel,
  summarizeDecisionSignals,
  type DecisionSignalChannel,
  type DecisionSeverity,
  type DecisionType
} from "@/lib/decisionSignals";

const channels: DecisionSignalChannel[] = ["meta", "google", "instagram", "content", "funnel", "budget"];

const severityClasses: Record<DecisionSeverity, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber",
  critical: "bg-red-50 text-red-700"
};

const decisionTypeClasses: Record<DecisionType, string> = {
  scale: "bg-green-50 text-leaf",
  maintain: "bg-cyan-50 text-ocean",
  reduce: "bg-amber-50 text-amber",
  pause: "bg-red-50 text-red-700",
  test: "bg-indigo-50 text-indigo-700",
  investigate: "bg-slate-100 text-slate-700",
  restructure: "bg-purple-50 text-purple-700"
};

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function DecisionSignalsPage() {
  const results = evaluateDecisionSignals(DECISION_SIGNAL_INPUTS, DECISION_RULES);
  const triggered = getTriggeredSignals(results);
  const critical = getCriticalSignals(results);
  const byChannel = getSignalsByChannel(results);
  const byDecisionType = getSignalsByDecisionType(results);
  const scaleSignals = filterSignalsByDecisionType(triggered, "scale");
  const pauseOrReduceSignals = triggered.filter((result) => result.decisionType === "pause" || result.decisionType === "reduce");
  const needsDataSignals = triggered.filter((result) => result.recommendation.toLocaleLowerCase("pt-BR").includes("dados") || result.nextAction.toLocaleLowerCase("pt-BR").includes("dados"));

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Sinais de Decisao</p>
        <h2 className="mt-1 text-2xl font-semibold">Sinais de Decisao</h2>
        <p className="mt-2 text-sm text-slate-500">Regras operacionais para transformar dados de marketing em decisoes praticas.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-6">
        <MetricCard label="Sinais acionados" value={triggered.length} />
        <MetricCard label="Sinais criticos" value={critical.length} />
        <MetricCard label="Decisoes de escala" value={byDecisionType.scale} />
        <MetricCard label="Pausa/reducao" value={byDecisionType.pause + byDecisionType.reduce} />
        <MetricCard label="Precisa dados" value={needsDataSignals.length} />
        <MetricCard label="Regras avaliadas" value={results.length} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Diagnostico executivo dos sinais</h3>
          <p className="mt-2 text-sm text-slate-600">{summarizeDecisionSignals(results)}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Meta Ads</p>
              <p className="mt-1 text-sm text-slate-600">Canal principal de escala quando BOFU entrega WhatsApp barato.</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Google Ads</p>
              <p className="mt-1 text-sm text-slate-600">Permanece diagnostico ate conversoes ficarem confiaveis.</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Conteudo</p>
              <p className="mt-1 text-sm text-slate-600">Stories, Reels/Shorts e TikTok sustentam funil e rotina.</p>
            </div>
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Sinais por canal</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            {channels.map((channel) => (
              <div key={channel} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span>{channelLabel(channel)}</span>
                <span className="font-semibold">{byChannel[channel]}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h3 className="text-lg font-semibold">Decisoes recomendadas agora</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {scaleSignals.map((signal) => (
              <li key={signal.id}>- {signal.nextAction}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Nao escalar ainda</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {pauseOrReduceSignals.map((signal) => (
              <li key={signal.id}>- {signal.nextAction}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Precisa de mais dados</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {needsDataSignals.map((signal) => (
              <li key={signal.id}>- {signal.nextAction}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {channels.map((channel) => {
          const channelSignals = filterSignalsByChannel(triggered, channel);
          return (
            <div key={channel} className="panel">
              <h3 className="text-lg font-semibold">{channelLabel(channel)}</h3>
              <p className="mt-1 text-sm text-slate-500">{channelSignals.length} sinal(is) acionado(s).</p>
              <div className="mt-4 space-y-3">
                {channelSignals.map((signal) => (
                  <article key={signal.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="badge bg-slate-100 text-slate-700">{channelLabel(signal.channel)}</span>
                      <span className={`badge ${severityClasses[signal.severity]}`}>{severityLabel(signal.severity)}</span>
                      <span className={`badge ${decisionTypeClasses[signal.decisionType]}`}>{decisionTypeLabel(signal.decisionType)}</span>
                      <span className="badge bg-slate-100 text-slate-700">Confianca {signal.confidence}</span>
                    </div>
                    <h4 className="mt-3 font-semibold">{signal.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">{signal.recommendation}</p>
                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                      <p><span className="font-semibold">Proxima acao:</span> {signal.nextAction}</p>
                      <p className="mt-2"><span className="font-semibold">Racional:</span> {signal.rationale}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Lista de regras acionadas</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {triggered.map((signal) => (
            <div key={signal.id} className="rounded-md bg-slate-50 p-3">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{channelLabel(signal.channel)}</span>
                <span className={`badge ${severityClasses[signal.severity]}`}>{severityLabel(signal.severity)}</span>
                <span className={`badge ${decisionTypeClasses[signal.decisionType]}`}>{decisionTypeLabel(signal.decisionType)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{signal.title}</p>
              <p className="mt-1 text-sm text-slate-600">{signal.nextAction}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Filtros de dominio disponiveis</h3>
        <p className="mt-2 text-sm text-slate-600">
          O modulo possui filtros testaveis por canal, severidade e tipo de decisao. Exemplo: {filterSignalsBySeverity(triggered, "critical").length} sinal(is) critico(s) e{" "}
          {filterSignalsByDecisionType(triggered, "investigate").length} sinal(is) de investigacao.
        </p>
      </section>
    </div>
  );
}
