import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildMarketingOpsState, exportSafetyReport } from "@/lib/marketing-ops";
import { buildPilotWeekScenario } from "@/lib/marketing-scenarios";
import { buildStudioDashboardPackage, buildUnifiedQualityMarkdown } from "@/lib/content-studio";
import { buildIntelligenceDashboard } from "@/lib/marketing-intelligence";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";
import { safetyClassificationLabel } from "@/lib/monthly-editorial";

const riskClasses = {
  seguro: "bg-green-50 text-leaf",
  atencao: "bg-amber-50 text-amber",
  revisar_antes_de_postar: "bg-orange-50 text-orange-700",
  bloquear: "bg-red-50 text-red-700"
} as const;

export default function SafetyPage() {
  const state = buildMarketingOpsState();
  const safety = state.dashboard.safety;
  const report = exportSafetyReport(safety);
  const pilot = buildPilotWeekScenario();
  const studio = buildStudioDashboardPackage();
  const intelligence = buildIntelligenceDashboard();
  const weeklyReview = buildDefaultWeeklyReview();
  const studioQualityReport = buildUnifiedQualityMarkdown(studio.packageItem.quality);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <p className="text-sm font-medium text-ocean">Marketing OS v3</p>
              <span className={`badge ${riskClasses[safety.safetyGate.classification]}`}>{safetyClassificationLabel(safety.safetyGate.classification)}</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">Safety Center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Centro interno para revisar risco medico-publicitario antes de qualquer execucao manual. O sistema nao publica, nao envia e nao decide sozinho.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={report} label="Copiar relatorio" />
            <Link href="/operations" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Operacoes
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Score" value={`${safety.safetyGate.score}/100`} detail={safetyClassificationLabel(safety.safetyGate.classification)} />
        <MetricCard label="Problemas" value={safety.totalIssues} />
        <MetricCard label="Bloqueados" value={safety.blockedContent} />
        <MetricCard label="Revisar" value={safety.needsReview} />
        <MetricCard label="Seguros" value={safety.safeContent} />
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h3 className="mt-1 text-lg font-semibold">Auditoria de importacao semanal</h3>
            <p className="mt-2 text-sm text-slate-500">
              O fechamento semanal bloqueia imports com CPF, telefone, prontuario, token, antes/depois ou bastidor especifico. O exemplo padrao permanece agregado e ficticio.
            </p>
          </div>
          <LocalCopyButton text={weeklyReview.exports.sensitiveAuditMarkdown} label="Copiar auditoria V7" />
        </div>
        <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{weeklyReview.exports.sensitiveAuditMarkdown}</pre>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Riscos do mes</p>
          <h3 className="mt-1 text-lg font-semibold">Ranking consolidado</h3>
          <div className="mt-4 space-y-3">
            {safety.topRisks.length ? safety.topRisks.map((risk) => (
              <div key={risk.category} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span className="font-semibold text-ink">{risk.category}</span>
                <span className="badge bg-slate-100 text-slate-700">{risk.count}</span>
              </div>
            )) : <p className="text-sm text-slate-500">Nenhum risco recorrente no plano padrao.</p>}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Sugestoes de ajuste</p>
          <h3 className="mt-1 text-lg font-semibold">Revisao humana antes de postar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {(safety.safetyGate.recommendations.length ? safety.safetyGate.recommendations : ["Manter linguagem educativa, sem promessa, sem antes/depois e sem CTA agressivo."]).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Conteudos bloqueados</p>
          <h3 className="mt-1 text-lg font-semibold">Nao publicar enquanto estiver bloqueado</h3>
          <div className="mt-4 space-y-3">
            {safety.blockedDays.length ? safety.blockedDays.map((day) => (
              <article key={day.date} className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-semibold">{day.date} - {day.theme}</p>
                <p className="mt-1">{day.pillar}</p>
              </article>
            )) : <p className="text-sm text-slate-500">Nenhum conteudo bloqueado no plano padrao.</p>}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Conteudos em revisao</p>
          <h3 className="mt-1 text-lg font-semibold">Conferir antes de qualquer uso externo</h3>
          <div className="mt-4 space-y-3">
            {safety.reviewDays.length ? safety.reviewDays.slice(0, 10).map((day) => (
              <article key={day.date} className="rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber">
                <p className="font-semibold">{day.date} - {day.theme}</p>
                <p className="mt-1">{day.risk}</p>
              </article>
            )) : <p className="text-sm text-slate-500">Nenhum conteudo em revisao no plano padrao.</p>}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v4</p>
            <h3 className="mt-1 text-lg font-semibold">Safety audit da semana piloto</h3>
            <p className="mt-2 text-sm text-slate-500">
              {pilot.summary.period} | {pilot.summary.totalSafetyAlerts} alertas | {pilot.summary.totalBlockedItems} bloqueios | status {pilot.summary.status}
            </p>
          </div>
          <LocalCopyButton text={pilot.exports.safetyReport} label="Copiar safety v4" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pilot.days.map((day) => (
            <article key={day.editorialDay.date} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">{day.editorialDay.date}</p>
              <p className="mt-1 text-slate-600">{day.editorialDay.theme}</p>
              <p className="mt-2 text-xs text-slate-500">{day.safetyGate.classification} | {day.safetyGate.score}/100</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h3 className="mt-1 text-lg font-semibold">QA de metricas e insights</h3>
            <p className="mt-2 text-sm text-slate-500">
              Score {intelligence.report.quality.score}/100 | status {intelligence.report.quality.status} | {intelligence.report.quality.blockingIssues.length} falhas bloqueantes.
            </p>
          </div>
          <LocalCopyButton text={intelligence.exports.insightsMarkdown} label="Copiar QA v6" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-ink">Checks executados</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              {intelligence.report.quality.checks.map((check) => <li key={check}>- {check}</li>)}
            </ul>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-ink">Avisos</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              {intelligence.report.quality.warnings.length ? intelligence.report.quality.warnings.map((warning) => <li key={warning}>- {warning}</li>) : <li>- nenhum aviso no dataset ficticio padrao</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h3 className="mt-1 text-lg font-semibold">Quality unificado do Content Studio</h3>
            <p className="mt-2 text-sm text-slate-500">
              Voice {studio.packageItem.quality.voiceScore}/100 | Safety {studio.packageItem.quality.safetyScore}/100 | Readiness {studio.packageItem.quality.readinessScore}/100 | status {studio.packageItem.quality.status}
            </p>
          </div>
          <LocalCopyButton text={studioQualityReport} label="Copiar quality v5" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Voice" value={`${studio.packageItem.quality.voiceScore}/100`} />
          <MetricCard label="Safety" value={`${studio.packageItem.quality.safetyScore}/100`} />
          <MetricCard label="Readiness" value={`${studio.packageItem.quality.readinessScore}/100`} />
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Relatorio copiavel</p>
            <h3 className="mt-1 text-lg font-semibold">Registro de seguranca editorial</h3>
          </div>
          <LocalCopyButton text={report} label="Copiar relatorio" />
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{report}</pre>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
