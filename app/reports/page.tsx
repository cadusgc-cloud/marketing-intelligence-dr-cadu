import { CompactReportTable, EmptyState } from "@/components/ui";
import { getReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await getReports();
  return (
    <div className="panel">
      <h2 className="text-xl font-semibold">Relatórios importados</h2>
      <p className="mt-1 text-sm text-slate-500">Textos brutos analisados com parser determinístico e validações internas.</p>
      <div className="mt-5">
        {reports.length ? (
          <CompactReportTable reports={reports} />
        ) : (
          <EmptyState
            title="Nenhum relatório importado ainda."
            description="Cole um relatório do Reportei, Meta Ads, Google Ads ou Instagram para começar."
            href="/reports/new"
            actionLabel="Importar relatório"
          />
        )}
      </div>
    </div>
  );
}
