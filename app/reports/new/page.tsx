import { ReportImportForm } from "@/app/reports/new/ReportImportForm";

export default function NewReportPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ReportImportForm />

      <aside className="panel h-fit">
        <h3 className="font-semibold">Escopo do MVP</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>O sistema usa apenas texto colado e estatísticas agregadas.</p>
          <p>Não há atendimento a pacientes, autenticação, integração externa ou OpenAI API nesta versão.</p>
          <p>Eventos comerciais e crescimento de audiência ficam separados para evitar misturar conversas, seguidores, visitas e conversões.</p>
        </div>
      </aside>
    </div>
  );
}
