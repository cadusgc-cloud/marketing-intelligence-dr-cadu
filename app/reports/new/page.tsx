import { importReport } from "@/app/reports/new/actions";

export default function NewReportPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form action={importReport} className="panel space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Importar novo relatório</h2>
          <p className="mt-1 text-sm text-slate-500">Cole estatísticas agregadas de Reportei, Meta Ads, Google Ads ou Instagram orgânico.</p>
        </div>
        <textarea
          name="rawText"
          required
          rows={20}
          className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-cyan-100"
          placeholder="Cole aqui o relatório bruto. Não inclua nomes, contatos, prontuários ou qualquer dado de paciente."
        />
        <button type="submit" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
          Analisar e salvar relatório
        </button>
      </form>

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
