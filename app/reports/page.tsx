import { CompactReportTable } from "@/components/ui";
import { getReports } from "@/lib/reports";

export default async function ReportsPage() {
  const reports = await getReports();
  return (
    <div className="panel">
      <h2 className="text-xl font-semibold">Relatórios importados</h2>
      <p className="mt-1 text-sm text-slate-500">Textos brutos analisados com parser determinístico e validações internas.</p>
      <div className="mt-5">
        <CompactReportTable reports={reports} />
      </div>
    </div>
  );
}
