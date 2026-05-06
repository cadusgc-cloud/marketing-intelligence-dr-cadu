import Link from "next/link";
import { PriorityBadge } from "@/components/ui";
import { getReports } from "@/lib/reports";

export default async function InsightsPage() {
  const reports = await getReports();
  const insights = reports.flatMap((report) => report.recommendations.map((recommendation) => ({ ...recommendation, report })));
  return (
    <div className="panel">
      <h2 className="text-xl font-semibold">Central de insights e recomendações</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <Link key={insight.id} href={`/reports/${insight.report.id}`} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <PriorityBadge value={insight.priority} />
              <span className="text-xs text-slate-500">{insight.category}</span>
            </div>
            <p className="mt-3 font-semibold">{insight.title}</p>
            <p className="mt-1 text-sm text-slate-500">{insight.evidence}</p>
            <p className="mt-2 text-sm">{insight.recommendation}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
