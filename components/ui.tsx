import Link from "next/link";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/money";

export function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warn" | "bad" }) {
  const toneClass = tone === "good" ? "text-leaf" : tone === "warn" ? "text-amber" : tone === "bad" ? "text-danger" : "text-ink";
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export function EmptyState({ title, description, href, actionLabel }: { title: string; description: string; href: string; actionLabel: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
      <Link href={href} className="mt-4 inline-flex rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
        {actionLabel}
      </Link>
    </div>
  );
}

export function PriorityBadge({ value }: { value: string }) {
  const classes: Record<string, string> = {
    critical: "bg-red-50 text-danger",
    high: "bg-amber-50 text-amber",
    medium: "bg-cyan-50 text-ocean",
    low: "bg-slate-100 text-slate-600"
  };
  const label: Record<string, string> = { critical: "crítico", high: "alto", medium: "médio", low: "baixo" };
  return <span className={`badge ${classes[value] ?? classes.low}`}>{label[value] ?? value}</span>;
}

export function DiagnosisBadge({ value }: { value?: string | null }) {
  const classes: Record<string, string> = {
    scale: "bg-green-50 text-leaf",
    keep: "bg-cyan-50 text-ocean",
    vary: "bg-indigo-50 text-indigo-700",
    pause: "bg-red-50 text-danger",
    investigate: "bg-amber-50 text-amber",
    unknown: "bg-slate-100 text-slate-600"
  };
  const label: Record<string, string> = {
    scale: "escalar",
    keep: "manter",
    vary: "variar",
    pause: "pausar",
    investigate: "investigar",
    unknown: "sem diagnóstico"
  };
  return <span className={`badge ${classes[value ?? "unknown"]}`}>{label[value ?? "unknown"]}</span>;
}

export function channelLabel(channel: string) {
  return {
    meta_ads: "Meta Ads",
    google_ads: "Google Ads",
    instagram_organic: "Instagram orgânico",
    consolidated: "Consolidado"
  }[channel] ?? channel;
}

export function CompactReportTable({ reports }: { reports: Awaited<ReturnType<typeof import("@/lib/reports").getReports>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-3 pr-4">Relatório</th>
            <th className="py-3 pr-4">Tipo</th>
            <th className="py-3 pr-4">Investimento</th>
            <th className="py-3 pr-4">Oportunidades comerciais</th>
            <th className="py-3 pr-4">Audiência</th>
            <th className="py-3 pr-4">Alertas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((report) => {
            const consolidated = report.channelSummaries.find((item) => item.channel === "consolidated");
            return (
              <tr key={report.id}>
                <td className="py-3 pr-4">
                  <Link href={`/reports/${report.id}`} className="font-medium text-ocean hover:underline">
                    {report.title}
                  </Link>
                  {report.isOperationalAnomaly ? <p className="text-xs text-danger">{report.anomalyReason}</p> : null}
                </td>
                <td className="py-3 pr-4">{report.reportType}</td>
                <td className="py-3 pr-4">{formatCurrency(consolidated?.investment)}</td>
                <td className="py-3 pr-4">{formatNumber(consolidated?.opportunities)}</td>
                <td className="py-3 pr-4">
                  {formatNumber(consolidated?.newFollowers)} seguidores
                  <br />
                  <span className="text-slate-500">{formatNumber(consolidated?.reach)} alcance</span>
                </td>
                <td className="py-3 pr-4">{report.dataIssues.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { formatCurrency, formatNumber, formatPercent };
