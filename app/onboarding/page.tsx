import Link from "next/link";

const steps = [
  ["/command-center", "Abrir Command Center", "ver a proxima acao"],
  ["/workspace", "Revisar Workspace", "confirmar estado local"],
  ["/imports", "Importar dados", "colar CSV/TSV manual"],
  ["/weekly-review", "Fechar semana", "gerar aprendizados"],
  ["/strategy", "Gerar plano", "proximos 7 dias"],
  ["/studio", "Criar pacote", "stories, reels, posts e briefing"],
  ["/review", "Revisar conteudo", "aprovar ou bloquear manualmente"],
  ["/safety", "Revisar safety", "evitar risco medico-publicitario"],
  ["/exports", "Exportar", "copiar Etus/manual e agenda"],
  ["/workspace", "Criar backup", "snapshot e JSON tecnico local"]
];

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Marketing OS v9</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-normal">Primeiros Passos</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Guia rapido para usar o Marketing OS do zero: comece pelo Command Center, siga fluxos guiados, revise safety, exporte manualmente e mantenha backup local.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map(([href, title, description], index) => (
          <article key={`${href}-${title}`} className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="badge bg-cyan-50 text-ocean">Passo {index + 1}</span>
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
            <Link href={href} className="mt-4 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir {href}</Link>
          </article>
        ))}
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Limites seguros</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>- Metricas sao manuais e locais; nenhuma API real e conectada.</li>
          <li>- Conteudo nao e publicado automaticamente.</li>
          <li>- Backup e restore sao tecnicos, locais e sem upload.</li>
          <li>- Dados de pacientes, prontuarios, documentos, tokens e senhas nao devem ser colados.</li>
          <li>- Safety e revisao humana continuam obrigatorios antes de qualquer uso externo.</li>
        </ul>
      </section>
    </div>
  );
}
