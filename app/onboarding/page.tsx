import Link from "next/link";
import { AppShell, ChecklistPanel, CopyBlock, LocalOnlyNotice, PageHeader, SectionHeader, SafetyNotice } from "@/components/product";

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
  const checklist = steps.map(([, title, description], index) => `${index + 1}. ${title}: ${description}`);
  const printable = checklist.join("\n");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Marketing OS v10"
        title="Primeiros Passos"
        description="Guia pratico para usar o Marketing OS do zero: Command Center, workspace, metricas manuais, fechamento semanal, producao, safety, exportacao e backup."
        actions={[
          { href: "/command-center", label: "Abrir Command Center", tone: "primary" },
          { href: "/flows", label: "Ver fluxos" }
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map(([href, title, description], index) => (
          <article key={`${href}-${title}`} className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="badge bg-cyan-50 text-ocean">Passo {index + 1}</span>
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
            <Link href={href} className="mt-4 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir {href}</Link>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <SectionHeader eyebrow="Fluxo semanal recomendado" title="Domingo a sabado" description="Importe dados, feche semana, gere plano, produza, revise e exporte manualmente." />
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>- Domingo: importar metricas e fechar /weekly-review.</li>
            <li>- Segunda: conferir /operations e iniciar execucao.</li>
            <li>- Terca e quarta: produzir no /studio e revisar /review.</li>
            <li>- Quinta e sexta: gravar, editar e exportar pacotes.</li>
            <li>- Sabado: revisar, criar snapshot e backup local.</li>
          </ul>
        </section>
        <section className="panel">
          <SectionHeader eyebrow="Fluxo mensal recomendado" title="Campanha, biblioteca e estrategia" description="Use /campaigns, /strategy, /recording e /workspace para fechar o ciclo sem improviso." />
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>- Gerar campanha mensal segura.</li>
            <li>- Transformar temas em pacotes no Content Studio.</li>
            <li>- Planejar gravacao em lote de 8 a 10 videos.</li>
            <li>- Revisar performance e atualizar estrategia.</li>
          </ul>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LocalOnlyNotice />
        <SafetyNotice />
      </section>

      <ChecklistPanel title="Checklist copiavel" items={checklist} />
      <CopyBlock title="Checklist em texto" description="Use como roteiro interno. Nao publica nada automaticamente." text={printable} />

      <section className="panel">
        <SectionHeader eyebrow="Glossario rapido" title="Termos do produto" description="Nomes mantidos em ingles quando viraram modulo do sistema." />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Local-only", "Tudo roda localmente, sem API externa."],
            ["Safety", "Camada de risco medico-publicitario."],
            ["Readiness", "Prontidao para revisao ou uso manual."],
            ["Snapshot", "Ponto tecnico local para retomar estado."],
            ["PR readiness", "Checklist antes de abrir pull request."],
            ["Exportacao manual", "Texto copiavel para ferramentas externas."]
          ].map(([term, description]) => (
            <article key={term} className="rounded-md bg-slate-50 p-3">
              <h2 className="text-base font-semibold text-ink">{term}</h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">O que o sistema nao faz</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>- Metricas sao manuais e locais; nenhuma API real e conectada.</li>
          <li>- Conteudo nao e publicado automaticamente.</li>
          <li>- Backup e restore sao tecnicos, locais e sem upload.</li>
          <li>- Dados de pacientes, prontuarios, documentos, tokens e senhas nao devem ser colados.</li>
          <li>- Safety e revisao humana continuam obrigatorios antes de qualquer uso externo.</li>
        </ul>
      </section>
    </AppShell>
  );
}
